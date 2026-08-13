// =============================================================================
// CIAR Cars — CMS content types, localization helpers, and safe defaults
// =============================================================================

export const CMS_LOCALES = ['en', 'ar', 'fr', 'de', 'es'] as const;
export type CmsLocale = (typeof CMS_LOCALES)[number];

export type LocalizedString = Partial<Record<CmsLocale, string>> & { en?: string };

export function pickLocalized(
  value: LocalizedString | string | null | undefined,
  locale: string,
  fallback = ''
): string {
  if (!value) return fallback;
  if (typeof value === 'string') return value || fallback;
  const loc = (CMS_LOCALES.includes(locale as CmsLocale) ? locale : 'en') as CmsLocale;
  return (
    value[loc] ||
    value.en ||
    value.ar ||
    Object.values(value).find((v) => typeof v === 'string' && v.trim()) ||
    fallback
  );
}

export function emptyLocalized(seed = ''): LocalizedString {
  return { en: seed, ar: seed, fr: seed, de: seed, es: seed };
}

export function localizedFromEn(en: string, ar?: string): LocalizedString {
  return {
    en,
    ar: ar || en,
    fr: en,
    de: en,
    es: en,
  };
}

export const HOMEPAGE_SECTION_TYPES = [
  'hero',
  'banner',
  'gallery',
  'featured_cars',
  'categories',
  'stats',
  'testimonials',
  'payments',
  'cta',
] as const;

export type HomepageSectionType = (typeof HOMEPAGE_SECTION_TYPES)[number];

export interface CmsCta {
  label: LocalizedString;
  url?: string;
  view?: string;
  params?: Record<string, string>;
}

export interface HeroSectionContent {
  title?: LocalizedString;
  subtitle?: LocalizedString;
  backgroundImage?: string;
  popularTags?: { label: LocalizedString; view?: string; params?: Record<string, string> }[];
  primaryCta?: CmsCta;
  secondaryCta?: CmsCta;
}

export interface StatsSectionContent {
  title?: LocalizedString;
  subtitle?: LocalizedString;
  backgroundImages?: string[];
  stats?: { label: LocalizedString; value: string; icon?: string }[];
}

export interface CategoryItem {
  label: LocalizedString;
  value: string;
  count?: number;
  image?: string;
}

export interface CategoriesSectionContent {
  title?: LocalizedString;
  subtitle?: LocalizedString;
  categories?: CategoryItem[];
}

export interface GallerySectionContent {
  title?: LocalizedString;
  subtitle?: LocalizedString;
  items?: { brand: string; model: string; image: string; year?: number }[];
}

export interface TestimonialItem {
  name: string;
  role?: LocalizedString | string;
  comment: LocalizedString | string;
  rating?: number;
  avatar?: string;
}

export interface TestimonialsSectionContent {
  title?: LocalizedString;
  subtitle?: LocalizedString;
  backgroundImage?: string;
  testimonials?: TestimonialItem[];
}

export interface CtaSectionContent {
  title?: LocalizedString;
  subtitle?: LocalizedString;
  backgroundImage?: string;
  primaryCta?: CmsCta;
  secondaryCta?: CmsCta;
}

export interface PaymentsSectionContent {
  title?: LocalizedString;
  subtitle?: LocalizedString;
  badge?: LocalizedString;
}

export interface FeaturedCarsSectionContent {
  title?: LocalizedString;
  subtitle?: LocalizedString;
  limit?: number;
}

export interface BannerSectionContent {
  useDbBanners?: boolean;
}

export type SectionContentMap = {
  hero: HeroSectionContent;
  banner: BannerSectionContent;
  gallery: GallerySectionContent;
  featured_cars: FeaturedCarsSectionContent;
  categories: CategoriesSectionContent;
  stats: StatsSectionContent;
  testimonials: TestimonialsSectionContent;
  payments: PaymentsSectionContent;
  cta: CtaSectionContent;
};

export function parseSectionContent<T = Record<string, unknown>>(
  raw: unknown
): T {
  if (!raw) return {} as T;
  if (typeof raw === 'object') return raw as T;
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return {} as T;
    }
  }
  return {} as T;
}

export function serializeSectionContent(content: unknown): string {
  return JSON.stringify(content ?? {});
}

// ---------- Page content ----------

export interface AboutPageContent {
  heroTitle?: LocalizedString;
  heroSubtitle?: LocalizedString;
  heroImage?: string;
  storyTitle?: LocalizedString;
  storyBody?: LocalizedString;
  valuesTitle?: LocalizedString;
  values?: { title: LocalizedString; description: LocalizedString; icon?: string }[];
  teamTitle?: LocalizedString;
  team?: { name: string; role: LocalizedString; bio?: LocalizedString; image?: string }[];
  stats?: { label: LocalizedString; value: string }[];
}

export interface ContactPageContent {
  heroTitle?: LocalizedString;
  heroSubtitle?: LocalizedString;
  heroImage?: string;
  info?: {
    email?: string;
    phone?: string;
    address?: LocalizedString;
    hours?: LocalizedString;
  };
  faqTitle?: LocalizedString;
  faqs?: { question: LocalizedString; answer: LocalizedString }[];
}

export interface LegalPageContent {
  title?: LocalizedString;
  body?: LocalizedString;
}

export type PageSlug = 'about' | 'contact' | 'privacy' | 'terms' | 'cookies';

export interface PagePayload {
  about?: AboutPageContent;
  contact?: ContactPageContent;
  privacy?: LegalPageContent;
  terms?: LegalPageContent;
  cookies?: LegalPageContent;
}

export const CMS_SETTING_KEYS = {
  paymentMethods: 'payment_methods',
  pageBackgrounds: 'page_backgrounds',
  socialLinks: 'social_links',
  footerCopy: 'footer_copy',
} as const;

export interface SocialLinksConfig {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  linkedin?: string;
  whatsapp?: string;
  tiktok?: string;
  telegram?: string;
  snapchat?: string;
  pinterest?: string;
  threads?: string;
  discord?: string;
}

export interface PageBackgroundsConfig {
  about?: string;
  contact?: string;
  listing?: string;
  auth?: string;
  testimonials?: string;
  cta?: string;
}

export interface PaymentMethodConfig {
  id: string;
  name: string;
  imageUrl: string;
  isActive?: boolean;
}

export const DEFAULT_PAYMENT_METHODS: PaymentMethodConfig[] = [
  { id: 'visa', name: 'Visa', imageUrl: '/payments/visa.svg' },
  { id: 'mastercard', name: 'Mastercard', imageUrl: '/payments/mastercard.svg' },
  { id: 'wish', name: 'Wish', imageUrl: '/payments/wish.png' },
  { id: 'ciar-prepaid', name: 'CIAR Prepaid Card', imageUrl: '/payments/ciar-prepaid.png' },
  { id: 'mada', name: 'Mada', imageUrl: '/payments/mada.svg' },
  { id: 'applepay', name: 'Apple Pay', imageUrl: '/payments/apple-pay.svg' },
  { id: 'googlepay', name: 'Google Pay', imageUrl: '/payments/google-pay.svg' },
  { id: 'paypal', name: 'PayPal', imageUrl: '/payments/paypal.svg' },
  { id: 'amex', name: 'American Express', imageUrl: '/payments/amex.svg' },
  { id: 'fawry', name: 'Fawry', imageUrl: '/payments/fawry.svg' },
  { id: 'stcpay', name: 'stc pay', imageUrl: '/payments/stc-pay.svg' },
  { id: 'wallet', name: 'CIAR Wallet', imageUrl: '/payments/ciar-wallet.svg' },
  { id: 'bank', name: 'Bank Transfer', imageUrl: '/payments/bank-transfer.svg' },
  { id: 'cod', name: 'Cash on Delivery', imageUrl: '/payments/cod.svg' },
];

export const DEFAULT_SOCIAL_LINKS: SocialLinksConfig = {
  facebook: 'https://facebook.com',
  twitter: 'https://x.com',
  instagram: 'https://instagram.com',
  youtube: 'https://youtube.com',
  linkedin: 'https://linkedin.com',
  whatsapp: '+963993153333',
  tiktok: 'https://tiktok.com',
  telegram: 'https://t.me',
  snapchat: 'https://snapchat.com',
  pinterest: 'https://pinterest.com',
  threads: 'https://threads.net',
  discord: 'https://discord.com',
};

export const DEFAULT_HOMEPAGE_ORDER: { type: HomepageSectionType; title?: string; subtitle?: string; content?: unknown }[] = [
  {
    type: 'hero',
    title: 'Find Your Perfect Car',
    subtitle: "The World's Premier Car Marketplace",
    content: {
      title: localizedFromEn('Find Your Perfect Car', 'اعثر على سيارتك المثالية'),
      subtitle: localizedFromEn(
        'Buy, sell, and rent cars with confidence across 80+ countries.',
        'اشترِ وبِع واستأجر السيارات بثقة في أكثر من 80 دولة.'
      ),
      primaryCta: {
        label: localizedFromEn('Browse Cars', 'تصفح السيارات'),
        view: 'listing',
      },
      secondaryCta: {
        label: localizedFromEn('Sell Your Car', 'بع سيارتك'),
        view: 'sell-car',
      },
    } satisfies HeroSectionContent,
  },
  {
    type: 'featured_cars',
    title: 'All Cars',
    subtitle: 'Browse the latest cars for sale and rent',
    content: {
      title: localizedFromEn('All Cars', 'جميع السيارات'),
      subtitle: localizedFromEn(
        'Browse the latest cars for sale and rent',
        'تصفّح أحدث السيارات المعروضة للبيع والإيجار'
      ),
      limit: 100,
    } satisfies FeaturedCarsSectionContent,
  },
  { type: 'banner', content: { useDbBanners: true } satisfies BannerSectionContent },
  {
    type: 'gallery',
    title: 'Luxury Gallery',
    content: {
      title: localizedFromEn('Luxury Gallery', 'معرض الفخامة'),
      items: [],
    } satisfies GallerySectionContent,
  },
  {
    type: 'stats',
    title: 'Trusted Worldwide',
    content: {
      title: localizedFromEn('Trusted Worldwide', 'موثوق عالميًا'),
      stats: [
        { label: localizedFromEn('Cars Listed', 'سيارات معروضة'), value: '100K+', icon: 'Car' },
        { label: localizedFromEn('Happy Customers', 'عملاء سعداء'), value: '250K+', icon: 'Users' },
        { label: localizedFromEn('Countries', 'دول'), value: '80+', icon: 'Globe' },
        { label: localizedFromEn('Verified Dealers', 'تجار موثوقون'), value: '5K+', icon: 'Store' },
      ],
    } satisfies StatsSectionContent,
  },
  {
    type: 'testimonials',
    title: 'What Our Customers Say',
    content: {
      title: localizedFromEn('What Our Customers Say', 'ماذا يقول عملاؤنا'),
      testimonials: [
        {
          name: 'Ahmed Hassan',
          role: localizedFromEn('Car Buyer', 'مشتري'),
          comment: localizedFromEn(
            'CIAR Cars made buying my dream car seamless and transparent.',
            'جعلت CIAR Cars شراء سيارة أحلامي سهلاً وشفافًا.'
          ),
          rating: 5,
        },
        {
          name: 'Sara Ali',
          role: localizedFromEn('Seller', 'بائعة'),
          comment: localizedFromEn(
            'Sold my car in days. Serious buyers and great support.',
            'بعت سيارتي خلال أيام. مشترين جادون ودعم ممتاز.'
          ),
          rating: 5,
        },
        {
          name: 'Omar Khalid',
          role: localizedFromEn('Renter', 'مستأجر'),
          comment: localizedFromEn(
            'Premium rental experience from booking to return.',
            'تجربة إيجار فاخرة من الحجز حتى الإرجاع.'
          ),
          rating: 5,
        },
      ],
    } satisfies TestimonialsSectionContent,
  },
  {
    type: 'payments',
    title: 'Secure Payments',
    content: {
      title: localizedFromEn('Pay Your Way', 'ادفع بطريقتك'),
      subtitle: localizedFromEn(
        'Trusted payment methods worldwide',
        'طرق دفع موثوقة حول العالم'
      ),
      badge: localizedFromEn('Secure checkout', 'دفع آمن'),
    } satisfies PaymentsSectionContent,
  },
  {
    type: 'cta',
    title: 'Ready to get started?',
    content: {
      title: localizedFromEn('Ready to get started?', 'هل أنت مستعد للبدء؟'),
      subtitle: localizedFromEn(
        'Join thousands of buyers and sellers on CIAR Cars.',
        'انضم إلى آلاف المشترين والبائعين على CIAR Cars.'
      ),
      primaryCta: {
        label: localizedFromEn('Browse Listings', 'تصفح الإعلانات'),
        view: 'listing',
      },
      secondaryCta: {
        label: localizedFromEn('Contact Us', 'تواصل معنا'),
        view: 'contact',
      },
    } satisfies CtaSectionContent,
  },
];

export function defaultAboutContent(): AboutPageContent {
  return {
    heroTitle: localizedFromEn('About CIAR Cars', 'عن CIAR Cars'),
    heroSubtitle: localizedFromEn(
      'The world\'s premier car marketplace',
      'سوق السيارات الأرقى في العالم'
    ),
    storyTitle: localizedFromEn('Our Story', 'قصتنا'),
    storyBody: localizedFromEn(
      'CIAR Cars connects buyers, sellers, and renters across continents with a trusted automotive marketplace.',
      'تربط CIAR Cars المشترين والبائعين والمستأجرين عبر القارات عبر سوق سيارات موثوق.'
    ),
    valuesTitle: localizedFromEn('Our Values', 'قيمنا'),
    values: [
      {
        title: localizedFromEn('Trust', 'الثقة'),
        description: localizedFromEn('Verified listings and secure payments.', 'إعلانات موثقة ومدفوعات آمنة.'),
        icon: 'Shield',
      },
      {
        title: localizedFromEn('Excellence', 'التميز'),
        description: localizedFromEn('Premium experience at every step.', 'تجربة فاخرة في كل خطوة.'),
        icon: 'Sparkles',
      },
      {
        title: localizedFromEn('Global Reach', 'انتشار عالمي'),
        description: localizedFromEn('Serving customers in 80+ countries.', 'نخدم العملاء في أكثر من 80 دولة.'),
        icon: 'Globe',
      },
    ],
    teamTitle: localizedFromEn('Our Team', 'فريقنا'),
    team: [],
    stats: [
      { label: localizedFromEn('Vehicles', 'مركبات'), value: '100K+' },
      { label: localizedFromEn('Customers', 'عملاء'), value: '250K+' },
      { label: localizedFromEn('Countries', 'دول'), value: '80+' },
    ],
  };
}

export function defaultContactContent(): ContactPageContent {
  return {
    heroTitle: localizedFromEn('Contact Us', 'تواصل معنا'),
    heroSubtitle: localizedFromEn(
      'We are here to help with sales, rentals, and partnerships.',
      'نحن هنا لمساعدتك في البيع والإيجار والشراكات.'
    ),
    info: {
      email: 'azasnaa628@gmail.com',
      phone: '+963993153333',
      address: localizedFromEn('Khartoum, Sudan', 'الخرطوم، السودان'),
      hours: localizedFromEn('Sun–Thu 9:00–18:00', 'الأحد–الخميس 9:00–18:00'),
    },
    faqTitle: localizedFromEn('FAQ', 'الأسئلة الشائعة'),
    faqs: [
      {
        question: localizedFromEn('How do I list my car?', 'كيف أعرض سيارتي؟'),
        answer: localizedFromEn(
          'Create an account, go to Sell Car, and follow the guided listing form.',
          'أنشئ حسابًا، ثم اذهب إلى بيع سيارة واتبع نموذج الإدراج.'
        ),
      },
      {
        question: localizedFromEn('Are payments secure?', 'هل المدفوعات آمنة؟'),
        answer: localizedFromEn(
          'Yes. We support trusted payment methods and wallet protection.',
          'نعم. ندعم طرق دفع موثوقة وحماية المحفظة.'
        ),
      },
    ],
  };
}

export function defaultLegalContent(titleEn: string, titleAr: string): LegalPageContent {
  const bodies: Record<string, { en: string; ar: string }> = {
    'Privacy Policy': {
      en: [
        'At CIAR Cars, we respect your privacy and are committed to protecting your personal data.',
        '',
        '1. Information We Collect',
        'We collect information you provide when creating an account, listing a vehicle, booking a rental, contacting support, or using our marketplace — including name, email, phone number, location, and payment-related details.',
        '',
        '2. How We Use Your Information',
        'We use your data to operate the platform, process transactions, verify listings, improve our services, send important notifications, and keep the marketplace secure.',
        '',
        '3. Sharing of Information',
        'We do not sell your personal information. We may share data with trusted service providers (such as payment processors) or when required by law.',
        '',
        '4. Data Security',
        'We apply reasonable technical and organizational measures to protect your information. No method of transmission over the internet is fully secure, so please use strong passwords and keep your credentials private.',
        '',
        '5. Your Rights',
        'Depending on applicable law, you may request access, correction, or deletion of your personal data by contacting us through the Contact page.',
        '',
        '6. Updates',
        'We may update this Privacy Policy from time to time. Continued use of CIAR Cars after changes means you accept the updated policy.',
      ].join('\n'),
      ar: [
        'في CIAR Cars نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية.',
        '',
        '1. المعلومات التي نجمعها',
        'نجمع المعلومات التي تقدّمها عند إنشاء حساب، أو إدراج سيارة، أو حجز إيجار، أو التواصل مع الدعم، أو استخدام السوق — بما في ذلك الاسم والبريد الإلكتروني ورقم الهاتف والموقع وتفاصيل متعلقة بالدفع.',
        '',
        '2. كيف نستخدم معلوماتك',
        'نستخدم بياناتك لتشغيل المنصة، ومعالجة المعاملات، والتحقق من الإعلانات، وتحسين خدماتنا، وإرسال الإشعارات المهمة، والحفاظ على أمان السوق.',
        '',
        '3. مشاركة المعلومات',
        'لا نبيع معلوماتك الشخصية. قد نشارك البيانات مع مزوّدي خدمات موثوقين (مثل معالجي الدفع) أو عندما يقتضي القانون ذلك.',
        '',
        '4. أمن البيانات',
        'نطبّق إجراءات تقنية وتنظيمية معقولة لحماية معلوماتك. لا توجد وسيلة نقل عبر الإنترنت آمنة بالكامل، لذا يُرجى استخدام كلمات مرور قوية والحفاظ على بيانات الدخول.',
        '',
        '5. حقوقك',
        'حسب القانون المعمول به، يمكنك طلب الوصول إلى بياناتك أو تصحيحها أو حذفها عبر صفحة اتصل بنا.',
        '',
        '6. التحديثات',
        'قد نحدّث سياسة الخصوصية من وقت لآخر. استمرارك في استخدام CIAR Cars بعد التحديث يعني موافقتك على السياسة المحدّثة.',
      ].join('\n'),
    },
    'Terms of Service': {
      en: [
        'Welcome to CIAR Cars. By accessing or using our platform, you agree to these Terms of Service.',
        '',
        '1. Platform Role',
        'CIAR Cars is a marketplace that connects buyers, sellers, and rental providers. Unless stated otherwise, we are not the owner or seller of listed vehicles.',
        '',
        '2. Accounts',
        'You must provide accurate information and keep your account secure. You are responsible for activity under your account. We may suspend accounts that violate these terms or harm other users.',
        '',
        '3. Listings & Rentals',
        'Sellers and lessors must ensure listings are truthful, lawful, and properly described. Buyers and renters must use the service in good faith and comply with booking and payment rules.',
        '',
        '4. Payments & Fees',
        'Fees, commissions, and payment methods may apply as shown in the app or admin-configured plans. Completed transactions may be subject to applicable taxes and processing rules.',
        '',
        '5. Prohibited Conduct',
        'You may not misuse the platform, post fraudulent listings, harass users, attempt unauthorized access, or violate applicable laws.',
        '',
        '6. Limitation of Liability',
        'To the fullest extent permitted by law, CIAR Cars is not liable for disputes between users, vehicle condition issues outside our control, or indirect damages arising from platform use.',
        '',
        '7. Changes',
        'We may update these terms periodically. Continued use after updates constitutes acceptance of the revised Terms of Service.',
      ].join('\n'),
      ar: [
        'مرحبًا بك في CIAR Cars. باستخدامك للمنصة فإنك توافق على هذه الشروط والأحكام.',
        '',
        '1. دور المنصة',
        'CIAR Cars سوق يربط المشترين والبائعين ومقدّمي الإيجار. ما لم يُذكر خلاف ذلك، لسنا مالكًا أو بائعًا للسيارات المدرجة.',
        '',
        '2. الحسابات',
        'يجب تقديم معلومات دقيقة والحفاظ على أمان حسابك. أنت مسؤول عن النشاط عبر حسابك. قد نعلّق الحسابات التي تنتهك هذه الشروط أو تضر بالمستخدمين.',
        '',
        '3. الإعلانات والإيجار',
        'يجب على البائعين والمؤجرين ضمان أن الإعلانات صادقة وقانونية وموصوفة بدقة. ويجب على المشترين والمستأجرين استخدام الخدمة بحسن نية والالتزام بقواعد الحجز والدفع.',
        '',
        '4. المدفوعات والرسوم',
        'قد تُطبَّق رسوم أو عمولات أو وسائل دفع كما تظهر في التطبيق أو خطط الإدارة. وقد تخضع المعاملات المكتملة للضرائب وقواعد المعالجة المعمول بها.',
        '',
        '5. السلوك المحظور',
        'يُحظر إساءة استخدام المنصة، أو نشر إعلانات احتيالية، أو مضايقة المستخدمين، أو محاولة الوصول غير المصرح به، أو مخالفة القوانين.',
        '',
        '6. حدود المسؤولية',
        'إلى أقصى حد يسمح به القانون، لا تتحمل CIAR Cars مسؤولية النزاعات بين المستخدمين أو مشاكل حالة السيارة خارج نطاق سيطرتنا أو الأضرار غير المباشرة الناتجة عن استخدام المنصة.',
        '',
        '7. التعديلات',
        'قد نحدّث هذه الشروط دوريًا. استمرار الاستخدام بعد التحديث يُعد قبولًا للشروط المحدّثة.',
      ].join('\n'),
    },
    'Cookie Policy': {
      en: [
        'This Cookie Policy explains how CIAR Cars uses cookies and similar technologies.',
        '',
        '1. What Are Cookies',
        'Cookies are small text files stored on your device to remember preferences, keep you signed in, and help us understand how the site is used.',
        '',
        '2. How We Use Cookies',
        'We use essential cookies for authentication and security, and optional analytics cookies to improve performance and user experience.',
        '',
        '3. Managing Cookies',
        'You can control cookies through your browser settings. Disabling some cookies may affect certain features of the platform.',
        '',
        '4. Updates',
        'We may update this Cookie Policy as our practices evolve. Please review this page periodically.',
      ].join('\n'),
      ar: [
        'توضح سياسة ملفات تعريف الارتباط كيف تستخدم CIAR Cars ملفات تعريف الارتباط والتقنيات المشابهة.',
        '',
        '1. ما هي ملفات تعريف الارتباط',
        'هي ملفات نصية صغيرة تُحفظ على جهازك لتذكّر التفضيلات وإبقائك مسجّل الدخول ومساعدتنا على فهم كيفية استخدام الموقع.',
        '',
        '2. كيف نستخدمها',
        'نستخدم ملفات أساسية للمصادقة والأمان، وملفات تحليل اختيارية لتحسين الأداء وتجربة الاستخدام.',
        '',
        '3. إدارة ملفات تعريف الارتباط',
        'يمكنك التحكم بها عبر إعدادات المتصفح. تعطيل بعضها قد يؤثر على بعض ميزات المنصة.',
        '',
        '4. التحديثات',
        'قد نحدّث هذه السياسة مع تطور ممارساتنا. يُرجى مراجعة هذه الصفحة دوريًا.',
      ].join('\n'),
    },
  };

  const body = bodies[titleEn] ?? {
    en: 'This page content can be edited from the admin panel.',
    ar: 'يمكن تحرير محتوى هذه الصفحة من لوحة التحكم.',
  };

  return {
    title: localizedFromEn(titleEn, titleAr),
    body: localizedFromEn(body.en, body.ar),
  };
}

export function normalizeNavLabel(label: string): LocalizedString {
  try {
    const parsed = JSON.parse(label);
    if (parsed && typeof parsed === 'object') return parsed as LocalizedString;
  } catch {
    // plain string
  }
  return localizedFromEn(label);
}

export function stringifyNavLabel(label: LocalizedString | string): string {
  if (typeof label === 'string') {
    try {
      JSON.parse(label);
      return label;
    } catch {
      return JSON.stringify(localizedFromEn(label));
    }
  }
  return JSON.stringify(label);
}

/** True when label is a multilingual JSON object (not a plain string). */
export function isLocalizedNavLabel(label: string): boolean {
  try {
    const parsed = JSON.parse(label);
    return !!parsed && typeof parsed === 'object' && !Array.isArray(parsed);
  } catch {
    return false;
  }
}

const VIEW_I18N_KEYS: Record<string, string> = {
  home: 'nav.home',
  listing: 'nav.listing',
  rental: 'nav.rental',
  'sell-car': 'nav.sell',
  about: 'nav.about',
  contact: 'nav.contact',
  advertisements: 'nav.advertisements',
  privacy: 'footer.privacyPolicy',
  terms: 'footer.termsOfService',
  cookies: 'footer.cookiePolicy',
};

/**
 * Display label for a nav item: use CMS locale text when present,
 * otherwise fall back to site i18n for the resolved view.
 */
export function resolveNavDisplayLabel(
  label: string,
  locale: string,
  view: string | null | undefined,
  t: (key: string) => string
): string {
  if (isLocalizedNavLabel(label)) {
    const localized = normalizeNavLabel(label);
    const loc = (CMS_LOCALES.includes(locale as CmsLocale) ? locale : 'en') as CmsLocale;
    if (localized[loc]?.trim()) return localized[loc]!.trim();
  }

  const i18nKey = view ? VIEW_I18N_KEYS[view] : undefined;
  if (i18nKey) {
    const translated = t(i18nKey);
    if (translated && translated !== i18nKey) return translated;
  }

  return pickLocalized(normalizeNavLabel(label), locale, label);
}

export function resolveAppViewFromUrl(url?: string | null): string | null {
  if (!url) return null;
  if (url.startsWith('view:')) return url.slice(5);
  const lower = url.toLowerCase();
  if (lower.includes('advertis') || lower.includes('ads') || lower.includes('view:advertisements')) {
    return 'advertisements';
  }
  if (lower.includes('for-rent') || lower.includes('rental') || lower.includes('view:rental')) {
    return 'rental';
  }
  if (lower.includes('sell')) return 'sell-car';
  if (lower.includes('about')) return 'about';
  if (lower.includes('contact')) return 'contact';
  if (lower.includes('privacy')) return 'privacy';
  if (lower.includes('terms') || lower.includes('conditions')) return 'terms';
  if (lower.includes('cookie')) return 'cookies';
  if (lower.includes('listing') || lower.includes('for-sale') || lower.includes('cars')) {
    return 'listing';
  }
  if (lower === '/' || lower === '#home' || lower === '' || lower.includes('view:home')) {
    return 'home';
  }
  return null;
}
