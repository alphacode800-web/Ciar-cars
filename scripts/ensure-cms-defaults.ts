/**
 * Ensure CMS defaults exist without wiping existing data.
 * Usage: npx tsx scripts/ensure-cms-defaults.ts
 */
import { cmsService } from '../src/services/cms.service';
import { db } from '../src/lib/db';

async function main() {
  await cmsService.ensureCmsDefaults();
  console.log('CMS defaults ensured.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
