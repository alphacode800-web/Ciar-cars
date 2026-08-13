/**
 * Replace all motorcycle listing images with curated motorcycle-only photos.
 * Run: npx tsx prisma/fix-motorcycle-images.ts
 */
import { db } from '../src/lib/db';
import { getMotorcycleImageByIndex } from '../src/lib/car-images';

async function main() {
  console.log('🏍️  Fixing motorcycle images...\n');

  const motorcycles = await db.car.findMany({
    where: { vehicleType: 'motorcycle' },
    include: { images: { orderBy: { order: 'asc' } } },
    orderBy: { createdAt: 'asc' },
  });

  let updated = 0;
  let created = 0;

  for (let i = 0; i < motorcycles.length; i++) {
    const car = motorcycles[i]!;
    const imageUrl = getMotorcycleImageByIndex(i);

    if (car.images.length === 0) {
      await db.carImage.create({
        data: {
          carId: car.id,
          url: imageUrl,
          alt: car.title,
          isPrimary: true,
          order: 0,
        },
      });
      created += 1;
      continue;
    }

    for (let j = 0; j < car.images.length; j++) {
      const img = car.images[j]!;
      const nextUrl = getMotorcycleImageByIndex(i + j);
      if (img.url === nextUrl) continue;

      await db.carImage.update({
        where: { id: img.id },
        data: { url: nextUrl, alt: car.title },
      });
      updated += 1;
    }
  }

  console.log(`✅ Done. Updated ${updated} images, created ${created} new images.`);
  console.log(`   Total motorcycles: ${motorcycles.length}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
