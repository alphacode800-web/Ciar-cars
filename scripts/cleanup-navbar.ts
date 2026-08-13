/**
 * Clean navbar crowding: move about/contact to footer-only,
 * refresh Ads label to avoid synonym confusion with "Post an Ad".
 * Usage: npx tsx scripts/cleanup-navbar.ts
 */
import { db } from '../src/lib/db';
import { stringifyNavLabel, localizedFromEn } from '../src/lib/cms-content';

async function main() {
  const navbar = await db.navigationItem.findMany({
    where: { position: 'navbar' },
    orderBy: { order: 'asc' },
  });

  for (const item of navbar) {
    const url = (item.url || '').toLowerCase();
    const isAbout = url.includes('about') || url === 'view:about';
    const isContact = url.includes('contact') || url === 'view:contact';
    if (isAbout || isContact) {
      await db.navigationItem.update({
        where: { id: item.id },
        data: { isActive: false },
      });
      console.log('deactivated from navbar:', item.url);
    }
    if (url.includes('advertis')) {
      await db.navigationItem.update({
        where: { id: item.id },
        data: {
          label: stringifyNavLabel(
            localizedFromEn('Ad Marketplace', 'سوق الإعلانات')
          ),
          url: 'view:advertisements',
          isActive: true,
        },
      });
      console.log('updated ads nav label');
    }
  }

  // Ensure about/contact exist in footer
  const footer = await db.navigationItem.findMany({ where: { position: 'footer' } });
  const ensureFooter = [
    { label: localizedFromEn('About', 'من نحن'), url: 'view:about' },
    { label: localizedFromEn('Contact', 'تواصل'), url: 'view:contact' },
  ];
  let order = footer.length;
  for (const item of ensureFooter) {
    const exists = footer.some((f) => (f.url || '').includes(item.url.replace('view:', '')));
    if (!exists) {
      await db.navigationItem.create({
        data: {
          label: stringifyNavLabel(item.label),
          url: item.url,
          order: order++,
          position: 'footer',
          isActive: true,
        },
      });
      console.log('added footer item:', item.url);
    }
  }

  const active = await db.navigationItem.findMany({
    where: { position: 'navbar', isActive: true },
    orderBy: { order: 'asc' },
  });
  console.log(
    'active navbar:',
    active.map((n) => `${n.url}`).join(' | ')
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
