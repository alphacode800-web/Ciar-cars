/**
 * Ensures motorcycle listings equal half the car count per country.
 * Run: npx tsx prisma/seed-motorcycles-by-country.ts
 */
import { db } from '../src/lib/db';
import { COUNTRIES } from '../src/lib/countries';
import { getMotorcycleImageByIndex } from '../src/lib/car-images';

const MOTORCYCLE_BRANDS = [
  { brand: 'Honda', models: ['CBR600RR', 'CB500F', 'Africa Twin', 'PCX', 'Gold Wing'] },
  { brand: 'Yamaha', models: ['YZF-R1', 'MT-07', 'NMAX', 'Tracer 9', 'XSR700'] },
  { brand: 'Suzuki', models: ['GSX-R750', 'V-Strom 650', 'Burgman', 'Hayabusa', 'SV650'] },
  { brand: 'Kawasaki', models: ['Ninja 650', 'Z900', 'Versys', 'Vulcan', 'KLX230'] },
  { brand: 'BMW', models: ['R1250GS', 'S1000RR', 'F900R', 'G310R', 'R18'] },
  { brand: 'Harley-Davidson', models: ['Sportster', 'Street Glide', 'Fat Boy', 'Iron 883', 'Pan America'] },
  { brand: 'Ducati', models: ['Panigale V4', 'Monster', 'Multistrada', 'Scrambler', 'Diavel'] },
  { brand: 'KTM', models: ['390 Duke', '1290 Super Duke', 'Adventure 890', 'RC390', '250 SX-F'] },
  { brand: 'Triumph', models: ['Street Triple', 'Tiger 900', 'Bonneville', 'Rocket 3', 'Trident 660'] },
  { brand: 'Royal Enfield', models: ['Classic 350', 'Himalayan', 'Meteor 350', 'Interceptor 650', 'Bullet 350'] },
  { brand: 'Bajaj', models: ['Pulsar NS200', 'Dominar 400', 'Avenger', 'Platina', 'CT100'] },
  { brand: 'TVS', models: ['Apache RR 310', 'Jupiter', 'Raider', 'NTorq', 'Radeon'] },
  { brand: 'Hero', models: ['Splendor', 'Passion Pro', 'Xtreme 160R', 'Glamour', 'Karizma'] },
  { brand: 'Aprilia', models: ['RSV4', 'Tuono', 'RS660', 'SR GT', 'Tuareg 660'] },
  { brand: 'Benelli', models: ['TRK 502', 'TNT 600', 'Leoncino', '302S', 'Imperiale'] },
  { brand: 'Vespa', models: ['GTS 300', 'Primavera', 'Sprint', 'Elettrica', '946'] },
  { brand: 'CFMoto', models: ['650NK', '700CL-X', '300NK', '450SR', '800MT'] },
  { brand: 'SYM', models: ['Jet 14', 'Cruisym', 'Fiddle', 'Joymax', 'NH-T'] },
];

const BODY_TYPES = ['sport', 'cruiser', 'touring', 'naked', 'adventure', 'scooter', 'offroad', 'dual_sport', 'chopper', 'electric'];
const FUEL_TYPES = ['petrol', 'electric', 'hybrid'];
const TRANSMISSIONS = ['manual', 'automatic', 'cvt'];
const CONDITIONS = ['new', 'used'];
const ENGINE_SIZES = ['125cc', '150cc', '250cc', '400cc', '600cc', '750cc', '900cc', '1000cc', '1200cc'];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

function motorcycleImage(seed: number): string {
  return getMotorcycleImageByIndex(seed);
}

function cityForCountry(countryEn: string, index: number): string {
  const cities = ['Capital', 'Downtown', 'North District', 'West Zone', 'Central'];
  return `${countryEn} ${pick(cities, index)}`;
}

async function main() {
  console.log('🏍️  Seeding motorcycles (half of car count per country)...\n');

  const seller =
    (await db.user.findFirst({ where: { role: 'seller', isActive: true } })) ||
    (await db.user.findFirst({ where: { role: { in: ['admin', 'super_admin'] } } }));

  if (!seller) {
    console.error('❌ No seller or admin user found. Run prisma/seed.ts first.');
    process.exit(1);
  }

  let totalCreated = 0;

  for (const country of COUNTRIES) {
    const carCount = await db.car.count({
      where: {
        country: country.nameEn,
        vehicleType: 'car',
        status: { not: 'archived' },
      },
    });

    if (carCount === 0) {
      console.log(`  − ${country.nameEn}: no cars, skipping`);
      continue;
    }

    const targetMotorcycles = Math.floor(carCount / 2);
    const existingMotorcycles = await db.car.count({
      where: {
        country: country.nameEn,
        vehicleType: 'motorcycle',
        status: { not: 'archived' },
      },
    });

    const needed = Math.max(0, targetMotorcycles - existingMotorcycles);
    if (needed === 0) {
      console.log(
        `  ✓ ${country.nameEn}: ${existingMotorcycles}/${targetMotorcycles} motorcycles (${carCount} cars)`
      );
      continue;
    }

    console.log(
      `  + ${country.nameEn}: adding ${needed} motorcycles (${existingMotorcycles} → ${targetMotorcycles}, ${carCount} cars)`
    );

    const batchSize = 25;
    for (let offset = 0; offset < needed; offset += batchSize) {
      const chunk = Math.min(batchSize, needed - offset);
      await db.$transaction(
        Array.from({ length: chunk }, (_, i) => {
          const n = existingMotorcycles + offset + i;
          const brandEntry = pick(MOTORCYCLE_BRANDS, n);
          const model = pick(brandEntry.models, n + 5);
          const year = 2018 + (n % 7);
          const condition = pick(CONDITIONS, n);
          const title = `${brandEntry.brand} ${model} ${year}`;
          const slugBase = slugify(`m-${country.code}-${brandEntry.brand}-${model}-${year}-${n}`);
          const slug = `${slugBase}-${Date.now().toString(36)}${i}`;

          return db.car.create({
            data: {
              title,
              slug,
              description: `${title} motorcycle available in ${country.nameEn}. Listed on CIAR Cars.`,
              brand: brandEntry.brand,
              model,
              year,
              vehicleType: 'motorcycle',
              condition,
              mileage: condition === 'new' ? 5 + (n % 15) : 2000 + (n % 40000),
              fuelType: pick(FUEL_TYPES, n),
              transmission: pick(TRANSMISSIONS, n),
              engineSize: pick(ENGINE_SIZES, n),
              horsepower: 15 + (n % 180),
              bodyType: pick(BODY_TYPES, n),
              city: cityForCountry(country.nameEn, n),
              country: country.nameEn,
              price: 80000 + (n % 30) * 25000,
              status: 'active',
              isFeatured: n % 19 === 0,
              isAvailableForRent: false,
              ownerId: seller.id,
              viewsCount: n % 300,
              images: {
                create: [
                  {
                    url: motorcycleImage(n),
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

  const summary = await db.$queryRaw<
    { country: string; cars: bigint; motorcycles: bigint }[]
  >`
    SELECT country,
      SUM(CASE WHEN vehicleType = 'car' THEN 1 ELSE 0 END) as cars,
      SUM(CASE WHEN vehicleType = 'motorcycle' THEN 1 ELSE 0 END) as motorcycles
    FROM Car
    WHERE status != 'archived'
    GROUP BY country
    ORDER BY country ASC
  `;

  console.log(`\n✅ Done. Created ${totalCreated} new motorcycles.`);
  console.log(`   Countries with listings: ${summary.length}`);

  const mismatched = summary.filter((s) => {
    const cars = Number(s.cars);
    const motorcycles = Number(s.motorcycles);
    return cars > 0 && motorcycles !== Math.floor(cars / 2);
  });

  if (mismatched.length) {
    console.log(`   ⚠ Countries not at 50% ratio (first 5):`);
    mismatched.slice(0, 5).forEach((s) => {
      console.log(
        `     ${s.country}: ${s.motorcycles} motorcycles / ${s.cars} cars (target: ${Math.floor(Number(s.cars) / 2)})`
      );
    });
  } else {
    console.log('   All countries with cars have motorcycles at 50% ratio.');
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
