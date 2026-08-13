import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { DEFAULT_HERO_BACKGROUNDS } from '@/lib/countries';
import { parseNewsTicker, NEWS_TICKER_KEYS } from '@/lib/news-ticker';
import { parseBrandWordmark, BRAND_WORDMARK_KEY } from '@/lib/brand-wordmark';
import { cmsService } from '@/services/cms.service';
import { CMS_SETTING_KEYS } from '@/lib/cms-content';

export async function GET() {
  try {
    await cmsService.ensureCmsDefaults();

    const [settings, cmsBundle] = await Promise.all([
      db.siteSetting.findMany({
        where: {
          key: {
            in: [
              'hero_backgrounds',
              'site_name',
              'site_description',
              'default_country',
              'support_email',
              'support_phone',
              'site_phone',
              'support_whatsapp',
              NEWS_TICKER_KEYS.enabled,
              NEWS_TICKER_KEYS.items,
              NEWS_TICKER_KEYS.speed,
              NEWS_TICKER_KEYS.style,
              BRAND_WORDMARK_KEY,
              CMS_SETTING_KEYS.socialLinks,
              CMS_SETTING_KEYS.pageBackgrounds,
              CMS_SETTING_KEYS.footerCopy,
            ],
          },
        },
      }),
      cmsService.getPublicSiteBundle(),
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
        banners: cmsBundle.banners,
        homepageSections: cmsBundle.homepageSections,
        settings: settingsMap,
        newsTicker: parseNewsTicker(settingsMap),
        brandWordmark: parseBrandWordmark(settingsMap),
        navigation: cmsBundle.navigation,
        paymentMethods: cmsBundle.paymentMethods,
        socialLinks: cmsBundle.socialLinks,
        pageBackgrounds: cmsBundle.pageBackgrounds,
        pages: cmsBundle.pages,
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
