/**
 * Ensures at least 50 active car listings per country.
 * Run: npx tsx prisma/seed-cars-by-country.ts
 */
import { db } from '../src/lib/db';
import { COUNTRIES } from '../src/lib/countries';

const CARS_PER_COUNTRY = 50;

const BRANDS = [
  { brand: 'Toyota', models: ['Camry', 'Corolla', 'RAV4', 'Land Cruiser', 'Hilux'] },
  { brand: 'Hyundai', models: ['Elantra', 'Tucson', 'Santa Fe', 'Sonata', 'Creta'] },
  { brand: 'Kia', models: ['Sportage', 'Cerato', 'Sorento', 'Picanto', 'K5'] },
  { brand: 'BMW', models: ['320i', '520i', 'X3', 'X5', '118i'] },
  { brand: 'Mercedes-Benz', models: ['C200', 'E200', 'GLC', 'A180', 'S500'] },
  { brand: 'Nissan', models: ['Sunny', 'Patrol', 'X-Trail', 'Altima', 'Kicks'] },
  { brand: 'Honda', models: ['Civic', 'Accord', 'CR-V', 'City', 'Pilot'] },
  { brand: 'Chevrolet', models: ['Malibu', 'Captiva', 'Tahoe', 'Spark', 'Traverse'] },
  { brand: 'Ford', models: ['Focus', 'Explorer', 'F-150', 'Escape', 'Mustang'] },
  { brand: 'Volkswagen', models: ['Golf', 'Passat', 'Tiguan', 'Polo', 'Jetta'] },
];

const BODY_TYPES = ['sedan', 'suv', 'hatchback', 'coupe', 'truck'];
const FUEL_TYPES = ['petrol', 'diesel', 'hybrid', 'electric'];
const TRANSMISSIONS = ['automatic', 'manual', 'cvt'];
const CONDITIONS = ['new', 'used'];

const IMAGE_IDS = [
  '1492144534655-ae79c964c9d7',
  '1549317661-bd32c8ce0afa',
  '1552519507-da3b142c6e3d',
  '1583267746897-2cf415887172',
  '1605559424843-9e4c228bf1c2',
  '1617531653332-bd46c24f2068',
  '1503376780353-7e6692767b70',
  '1544636331-e26879cd4d9b',
  '1560958089-b8a1929cea89',
  '1592198084033-aade902d1aae',
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

function carImage(seed: number): string {
  const id = IMAGE_IDS[seed % IMAGE_IDS.length];
  return `https://images.unsplash.com/photo-${id}?w=800&h=450&fit=crop&auto=format&seed=${seed}`;
}

function cityForCountry(countryEn: string, index: number): string {
  const cities = ['Capital', 'Downtown', 'North District', 'West Zone', 'Central'];
  return `${countryEn} ${pick(cities, index)}`;
}

async function main() {
  console.log(`🚗 Seeding ${CARS_PER_COUNTRY} cars per country (${COUNTRIES.length} countries)...\n`);

  const seller =
    (await db.user.findFirst({ where: { role: 'seller', isActive: true } })) ||
    (await db.user.findFirst({ where: { role: { in: ['admin', 'super_admin'] } } }));

  if (!seller) {
    console.error('❌ No seller or admin user found. Run prisma/seed.ts first.');
    process.exit(1);
  }

  let totalCreated = 0;

  for (const country of COUNTRIES) {
    const existing = await db.car.count({
      where: { country: country.nameEn, status: { not: 'archived' } },
    });

    const needed = Math.max(0, CARS_PER_COUNTRY - existing);
    if (needed === 0) {
      console.log(`  ✓ ${country.nameEn}: already has ${existing} cars`);
      continue;
    }

    console.log(`  + ${country.nameEn}: adding ${needed} cars (${existing} existing)`);

    const batchSize = 25;
    for (let offset = 0; offset < needed; offset += batchSize) {
      const chunk = Math.min(batchSize, needed - offset);
      await db.$transaction(
        Array.from({ length: chunk }, (_, i) => {
          const n = existing + offset + i;
          const brandEntry = pick(BRANDS, n);
          const model = pick(brandEntry.models, n + 3);
          const year = 2018 + (n % 7);
          const condition = pick(CONDITIONS, n);
          const title = `${brandEntry.brand} ${model} ${year}`;
          const slugBase = slugify(`${country.code}-${brandEntry.brand}-${model}-${year}-${n}`);
          const slug = `${slugBase}-${Date.now().toString(36)}${i}`;

          return db.car.create({
            data: {
              title,
              slug,
              description: `${title} available in ${country.nameEn}. Well maintained vehicle listed on CIAR Cars.`,
              brand: brandEntry.brand,
              model,
              year,
              condition,
              mileage: condition === 'new' ? 5 + (n % 20) : 10000 + (n % 90000),
              fuelType: pick(FUEL_TYPES, n),
              transmission: pick(TRANSMISSIONS, n),
              bodyType: pick(BODY_TYPES, n),
              city: cityForCountry(country.nameEn, n),
              country: country.nameEn,
              price: 150000 + (n % 40) * 50000,
              status: 'active',
              isFeatured: n % 17 === 0,
              ownerId: seller.id,
              viewsCount: n % 500,
              images: {
                create: [
                  {
                    url: carImage(n),
                    alt: title,
                    isPrimary: true,
                    order: 0,
                  },
                ],
              },
            },
          });
        })
      );
      totalCreated += chunk;
    }
  }

  const summary = await db.car.groupBy({
    by: ['country'],
    _count: { id: true },
    orderBy: { country: 'asc' },
  });

  const belowMin = summary.filter((s) => s._count.id < CARS_PER_COUNTRY);

  console.log(`\n✅ Done. Created ${totalCreated} new cars.`);
  console.log(`   Countries: ${summary.length}`);
  if (belowMin.length) {
    console.log(`   ⚠ Countries below ${CARS_PER_COUNTRY}:`, belowMin.map((s) => `${s.country} (${s._count.id})`).join(', '));
  } else {
    console.log(`   All countries have at least ${CARS_PER_COUNTRY} cars.`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
