/**
 * One-off maintenance: put featured_cars right after hero on the homepage
 * and make sure the "Advertisements" navbar item exists.
 * Usage: npx tsx scripts/reorder-homepage.ts
 */
import { db } from '../src/lib/db';
import { stringifyNavLabel, localizedFromEn } from '../src/lib/cms-content';

async function main() {
  const sections = await db.homepageSection.findMany({ orderBy: { order: 'asc' } });
  console.log('current order:', sections.map((s) => s.type).join(', '));

  const hero = sections.filter((s) => s.type === 'hero');
  const featured = sections.filter((s) => s.type === 'featured_cars');
  const rest = sections.filter((s) => s.type !== 'hero' && s.type !== 'featured_cars');
  const reordered = [...hero, ...featured, ...rest];

  for (let i = 0; i < reordered.length; i++) {
    if (reordered[i].order !== i) {
      await db.homepageSection.update({ where: { id: reordered[i].id }, data: { order: i } });
    }
  }
  console.log('new order:', reordered.map((s) => s.type).join(', '));

  const navbar = await db.navigationItem.findMany({
    where: { position: 'navbar' },
    orderBy: { order: 'asc' },
  });
  const hasAds = navbar.some((n) => (n.url || '').toLowerCase().includes('advertis'));
  if (!hasAds) {
    // Insert right after the Cars item (or second position)
    const carsIndex = navbar.findIndex((n) => n.url === 'view:listing');
    const insertOrder = carsIndex >= 0 ? navbar[carsIndex].order + 1 : 2;
    for (const item of navbar) {
      if (item.order >= insertOrder) {
        await db.navigationItem.update({ where: { id: item.id }, data: { order: item.order + 1 } });
      }
    }
    await db.navigationItem.create({
      data: {
        label: stringifyNavLabel(localizedFromEn('Ads', 'الإعلانات')),
        url: 'view:advertisements',
        order: insertOrder,
        position: 'navbar',
        isActive: true,
      },
    });
    console.log('navbar: added Advertisements item at order', insertOrder);
  } else {
    console.log('navbar: Advertisements item already exists');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
