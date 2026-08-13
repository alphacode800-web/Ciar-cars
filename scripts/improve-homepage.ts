/**
 * One-off maintenance: clean up the homepage composition.
 * - Deactivate the duplicate `categories` section (renders the same featured cars component)
 * - Add missing `payments` and `cta` sections from defaults
 * - Final order: hero, featured_cars, banner, stats, payments, testimonials, cta
 * Usage: npx tsx scripts/improve-homepage.ts
 */
import { db } from '../src/lib/db';
import { DEFAULT_HOMEPAGE_ORDER } from '../src/lib/cms-content';

const TARGET_ORDER = ['hero', 'featured_cars', 'banner', 'stats', 'payments', 'testimonials', 'cta'];

async function main() {
  const sections = await db.homepageSection.findMany({ orderBy: { order: 'asc' } });

  for (const s of sections.filter((x) => x.type === 'categories' && x.isActive)) {
    await db.homepageSection.update({ where: { id: s.id }, data: { isActive: false } });
    console.log('deactivated duplicate categories section', s.id);
  }

  for (const type of ['payments', 'cta'] as const) {
    if (!sections.some((s) => s.type === type)) {
      const def = DEFAULT_HOMEPAGE_ORDER.find((d) => d.type === type);
      await db.homepageSection.create({
        data: {
          type,
          title: def?.title ?? null,
          subtitle: def?.subtitle ?? null,
          content: def?.content ? JSON.stringify(def.content) : null,
          order: 99,
          isActive: true,
        },
      });
      console.log('added missing section:', type);
    }
  }

  const all = await db.homepageSection.findMany({ where: { isActive: true } });
  const sorted = [...all].sort((a, b) => {
    const ai = TARGET_ORDER.indexOf(a.type);
    const bi = TARGET_ORDER.indexOf(b.type);
    return (ai === -1 ? 50 : ai) - (bi === -1 ? 50 : bi);
  });
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].order !== i) {
      await db.homepageSection.update({ where: { id: sorted[i].id }, data: { order: i } });
    }
  }
  console.log('final order:', sorted.map((s) => s.type).join(', '));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
