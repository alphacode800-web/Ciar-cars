import { db } from '@/lib/db';
import {
  CMS_SETTING_KEYS,
  DEFAULT_HOMEPAGE_ORDER,
  DEFAULT_PAYMENT_METHODS,
  DEFAULT_SOCIAL_LINKS,
  defaultAboutContent,
  defaultContactContent,
  defaultLegalContent,
  parseSectionContent,
  stringifyNavLabel,
  localizedFromEn,
  type PageSlug,
  type PaymentMethodConfig,
  type SocialLinksConfig,
  type PageBackgroundsConfig,
} from '@/lib/cms-content';
import {
  DEFAULT_NEWS_TICKER,
  NEWS_TICKER_KEYS,
  serializeNewsTicker,
} from '@/lib/news-ticker';

const DEFAULT_ARABIC_NEWS_TICKER = {
  ...DEFAULT_NEWS_TICKER,
  enabled: true,
  items: [
    { id: '1', text: 'أكثر من 3,100 سيارة في 60+ دولة — تصفّح الآن', link: 'listing' },
    { id: '2', text: 'أعلن عن سيارتك مجاناً واصل لآلاف المشترين', link: 'sell-car' },
    { id: '3', text: 'تأجير مرن — يومي، أسبوعي، أو شهري', link: 'rental' },
    { id: '4', text: 'محفظة CIAR الآمنة للدفع والتحصيل', link: 'wallet' },
  ],
  style: {
    ...DEFAULT_NEWS_TICKER.style,
    labelText: 'عاجل',
    fontFamily: 'arabic' as const,
  },
};

async function upsertSetting(key: string, value: unknown, type = 'json') {
  const serialized = typeof value === 'string' ? value : JSON.stringify(value);
  return db.siteSetting.upsert({
    where: { key },
    create: { key, value: serialized, type },
    update: { value: serialized, type },
  });
}

async function getSettingJson<T>(key: string, fallback: T): Promise<T> {
  const row = await db.siteSetting.findUnique({ where: { key } });
  if (!row?.value) return fallback;
  try {
    return JSON.parse(row.value) as T;
  } catch {
    return fallback;
  }
}

export const cmsService = {
  async ensureHomepageDefaults() {
    const count = await db.homepageSection.count();
    if (count > 0) return;

    await Promise.all(
      DEFAULT_HOMEPAGE_ORDER.map((section, index) =>
        db.homepageSection.create({
          data: {
            type: section.type,
            title: section.title ?? null,
            subtitle: section.subtitle ?? null,
            content: section.content ? JSON.stringify(section.content) : null,
            order: index,
            isActive: true,
          },
        })
      )
    );
  },

  async ensurePageDefaults() {
    const pages: { slug: PageSlug; title: string; content: unknown }[] = [
      { slug: 'about', title: 'About', content: defaultAboutContent() },
      { slug: 'contact', title: 'Contact', content: defaultContactContent() },
      { slug: 'privacy', title: 'Privacy', content: defaultLegalContent('Privacy Policy', 'سياسة الخصوصية') },
      { slug: 'terms', title: 'Terms', content: defaultLegalContent('Terms of Service', 'شروط الخدمة') },
      { slug: 'cookies', title: 'Cookies', content: defaultLegalContent('Cookie Policy', 'سياسة ملفات تعريف الارتباط') },
    ];

    for (const page of pages) {
      const existing = await db.pageContent.findUnique({ where: { slug: page.slug } });
      if (!existing) {
        await db.pageContent.create({
          data: {
            slug: page.slug,
            title: page.title,
            status: 'published',
            content: JSON.stringify(page.content),
          },
        });
      }
    }
  },

  async ensurePaymentMethods() {
    const count = await db.paymentMethodItem.count();
    if (count > 0) return;
    await Promise.all(
      DEFAULT_PAYMENT_METHODS.map((m, i) =>
        db.paymentMethodItem.create({
          data: {
            name: m.name,
            imageUrl: m.imageUrl,
            order: i,
            isActive: true,
          },
        })
      )
    );
  },

  async ensureNavigationDefaults() {
    const [navbarCount, footerCount] = await Promise.all([
      db.navigationItem.count({ where: { position: 'navbar' } }),
      db.navigationItem.count({ where: { position: 'footer' } }),
    ]);

    if (navbarCount === 0) {
      const navbar = [
        { label: localizedFromEn('Home', 'الرئيسية'), url: 'view:home', order: 0 },
        { label: localizedFromEn('Cars', 'السيارات'), url: 'view:listing', order: 1 },
        { label: localizedFromEn('Ads', 'الإعلانات'), url: 'view:advertisements', order: 2 },
        { label: localizedFromEn('Rent', 'استئجار'), url: 'view:rental', order: 3 },
        { label: localizedFromEn('Sell', 'بيع سيارة'), url: 'view:sell-car', order: 4 },
      ];
      for (const item of navbar) {
        await db.navigationItem.create({
          data: {
            label: stringifyNavLabel(item.label),
            url: item.url,
            order: item.order,
            position: 'navbar',
            isActive: true,
          },
        });
      }
    }

    if (footerCount === 0) {
      const footer = [
        { label: localizedFromEn('Cars', 'السيارات'), url: 'view:listing', order: 0 },
        { label: localizedFromEn('Rent', 'استئجار'), url: 'view:rental', order: 1 },
        { label: localizedFromEn('Sell', 'بيع سيارة'), url: 'view:sell-car', order: 2 },
        { label: localizedFromEn('About', 'من نحن'), url: 'view:about', order: 3 },
        { label: localizedFromEn('Contact', 'تواصل'), url: 'view:contact', order: 4 },
        { label: localizedFromEn('Privacy Policy', 'سياسة الخصوصية'), url: 'view:privacy', order: 5 },
        { label: localizedFromEn('Terms of Service', 'الشروط والأحكام'), url: 'view:terms', order: 6 },
      ];
      for (const item of footer) {
        await db.navigationItem.create({
          data: {
            label: stringifyNavLabel(item.label),
            url: item.url,
            order: item.order,
            position: 'footer',
            isActive: true,
          },
        });
      }
    }
  },

  async ensureNewsTickerDefaults() {
    const existing = await db.siteSetting.findUnique({
      where: { key: NEWS_TICKER_KEYS.enabled },
    });
    if (existing) return;

    const serialized = serializeNewsTicker(DEFAULT_ARABIC_NEWS_TICKER);
    await Promise.all([
      upsertSetting(NEWS_TICKER_KEYS.enabled, serialized[NEWS_TICKER_KEYS.enabled], 'boolean'),
      upsertSetting(NEWS_TICKER_KEYS.speed, serialized[NEWS_TICKER_KEYS.speed], 'number'),
      upsertSetting(NEWS_TICKER_KEYS.items, serialized[NEWS_TICKER_KEYS.items], 'json'),
      upsertSetting(NEWS_TICKER_KEYS.style, serialized[NEWS_TICKER_KEYS.style], 'json'),
    ]);
  },

  async ensureCmsDefaults() {
    await Promise.all([
      this.ensureHomepageDefaults(),
      this.ensurePageDefaults(),
      this.ensurePaymentMethods(),
      this.ensureNavigationDefaults(),
      this.ensureNewsTickerDefaults(),
    ]);

    const social = await db.siteSetting.findUnique({ where: { key: CMS_SETTING_KEYS.socialLinks } });
    if (!social) await upsertSetting(CMS_SETTING_KEYS.socialLinks, DEFAULT_SOCIAL_LINKS);

    const backgrounds = await db.siteSetting.findUnique({
      where: { key: CMS_SETTING_KEYS.pageBackgrounds },
    });
    if (!backgrounds) await upsertSetting(CMS_SETTING_KEYS.pageBackgrounds, {});
  },

  async getPaymentMethods(): Promise<PaymentMethodConfig[]> {
    await this.ensurePaymentMethods();
    const rows = await db.paymentMethodItem.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    if (rows.length === 0) return DEFAULT_PAYMENT_METHODS;
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      imageUrl: r.imageUrl,
      isActive: r.isActive,
    }));
  },

  async getSocialLinks(): Promise<SocialLinksConfig> {
    const stored = await getSettingJson(CMS_SETTING_KEYS.socialLinks, DEFAULT_SOCIAL_LINKS);
    return { ...DEFAULT_SOCIAL_LINKS, ...stored };
  },

  async getPageBackgrounds(): Promise<PageBackgroundsConfig> {
    return getSettingJson(CMS_SETTING_KEYS.pageBackgrounds, {});
  },

  async getPage(slug: string) {
    await this.ensurePageDefaults();
    return db.pageContent.findUnique({ where: { slug } });
  },

  async listPages() {
    await this.ensurePageDefaults();
    return db.pageContent.findMany({ orderBy: { slug: 'asc' } });
  },

  async updatePage(
    slug: string,
    data: {
      title?: string;
      status?: string;
      content?: unknown;
      seoTitle?: string | null;
      seoDescription?: string | null;
    }
  ) {
    return db.pageContent.upsert({
      where: { slug },
      create: {
        slug,
        title: data.title ?? slug,
        status: data.status ?? 'published',
        content: JSON.stringify(data.content ?? {}),
        seoTitle: data.seoTitle ?? null,
        seoDescription: data.seoDescription ?? null,
      },
      update: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.content !== undefined
          ? { content: typeof data.content === 'string' ? data.content : JSON.stringify(data.content) }
          : {}),
        ...(data.seoTitle !== undefined ? { seoTitle: data.seoTitle } : {}),
        ...(data.seoDescription !== undefined ? { seoDescription: data.seoDescription } : {}),
      },
    });
  },

  async getPublicSiteBundle() {
    await this.ensureCmsDefaults();

    const [
      homepageSections,
      banners,
      navbarItems,
      footerItems,
      paymentMethods,
      socialLinks,
      pageBackgrounds,
      pages,
    ] = await Promise.all([
      db.homepageSection.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
      db.banner.findMany({
        where: {
          isActive: true,
          OR: [
            { startDate: null, endDate: null },
            { startDate: { lte: new Date() }, endDate: null },
            { startDate: null, endDate: { gte: new Date() } },
            { startDate: { lte: new Date() }, endDate: { gte: new Date() } },
          ],
        },
        orderBy: { order: 'asc' },
      }),
      db.navigationItem.findMany({
        where: { isActive: true, position: 'navbar', parentId: null },
        orderBy: { order: 'asc' },
        include: { children: { where: { isActive: true }, orderBy: { order: 'asc' } } },
      }),
      db.navigationItem.findMany({
        where: { isActive: true, position: 'footer', parentId: null },
        orderBy: { order: 'asc' },
        include: { children: { where: { isActive: true }, orderBy: { order: 'asc' } } },
      }),
      this.getPaymentMethods(),
      this.getSocialLinks(),
      this.getPageBackgrounds(),
      db.pageContent.findMany({ where: { status: 'published' } }),
    ]);

    return {
      homepageSections: homepageSections.map((s) => ({
        ...s,
        content: parseSectionContent(s.content),
      })),
      banners,
      navigation: { navbar: navbarItems, footer: footerItems },
      paymentMethods,
      socialLinks,
      pageBackgrounds,
      pages: pages.map((p) => ({
        slug: p.slug,
        title: p.title,
        seoTitle: p.seoTitle,
        seoDescription: p.seoDescription,
        content: parseSectionContent(p.content),
      })),
    };
  },
};
