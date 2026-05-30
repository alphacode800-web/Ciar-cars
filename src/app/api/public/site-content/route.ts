import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { DEFAULT_HERO_BACKGROUNDS } from '@/lib/countries';

export async function GET() {
  try {
    const [settings, banners, homepageSections] = await Promise.all([
      db.siteSetting.findMany({
        where: {
          key: {
            in: ['hero_backgrounds', 'site_name', 'site_description', 'default_country'],
          },
        },
      }),
      db.banner.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      }),
      db.homepageSection.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      }),
    ]);

    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }

    let heroBackgrounds = DEFAULT_HERO_BACKGROUNDS;
    if (settingsMap.hero_backgrounds) {
      try {
        const parsed = JSON.parse(settingsMap.hero_backgrounds) as string[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          heroBackgrounds = parsed.filter((u) => typeof u === 'string' && u.trim());
        }
      } catch {
        // use defaults
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        heroBackgrounds,
        banners,
        homepageSections,
        settings: settingsMap,
      },
    });
  } catch (error) {
    console.error('[PUBLIC_SITE_CONTENT]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load site content' },
      { status: 500 }
    );
  }
}
