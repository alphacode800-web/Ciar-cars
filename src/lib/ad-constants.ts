export const AD_CATEGORIES = [
  { value: 'clothing', labelAr: 'ملابس', labelEn: 'Clothing' },
  { value: 'electronics', labelAr: 'إلكترونيات', labelEn: 'Electronics' },
  { value: 'services', labelAr: 'خدمات', labelEn: 'Services' },
  { value: 'home', labelAr: 'منزل ومفروشات', labelEn: 'Home' },
  { value: 'beauty', labelAr: 'تجميل وعناية', labelEn: 'Beauty' },
  { value: 'general', labelAr: 'عام', labelEn: 'General' },
] as const;

export const AD_STATUSES = [
  'draft',
  'pending_payment',
  'pending_review',
  'published',
  'rejected',
  'paused',
  'expired',
  'deleted',
] as const;

export type AdStatus = (typeof AD_STATUSES)[number];

export const AD_PAYMENT_STATUSES = ['unpaid', 'pending', 'paid', 'refunded'] as const;

export const CLOTHING_FABRICS = [
  'قطن',
  'كتان',
  'حرير',
  'صوف',
  'بوليستر',
  'دنيم',
  'جلد',
  'مزيج',
] as const;

export const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size'] as const;

export const DEFAULT_AD_PLANS = [
  {
    name: 'Basic',
    nameAr: 'أساسية',
    description: 'Standard listing for 15 days',
    descriptionAr: 'إعلان قياسي لمدة 15 يومًا',
    price: 50,
    currency: 'EGP',
    durationDays: 15,
    maxImages: 5,
    allowVideo: false,
    isFeatured: false,
    order: 1,
  },
  {
    name: 'Standard',
    nameAr: 'قياسية',
    description: 'More images and 30 days',
    descriptionAr: 'صور أكثر لمدة 30 يومًا',
    price: 100,
    currency: 'EGP',
    durationDays: 30,
    maxImages: 10,
    allowVideo: true,
    isFeatured: false,
    order: 2,
  },
  {
    name: 'Featured',
    nameAr: 'مميزة',
    description: 'Featured placement for 30 days with video',
    descriptionAr: 'ظهور مميز لمدة 30 يومًا مع فيديو',
    price: 200,
    currency: 'EGP',
    durationDays: 30,
    maxImages: 15,
    allowVideo: true,
    isFeatured: true,
    order: 3,
  },
] as const;

export function finalAdPrice(price: number, discountPercent = 0): number {
  const d = Math.min(100, Math.max(0, discountPercent || 0));
  return Math.round(price * (1 - d / 100) * 100) / 100;
}

export function isAdPubliclyVisible(ad: {
  status: string;
  paymentStatus: string;
  endsAt?: Date | string | null;
}): boolean {
  if (ad.status !== 'published' || ad.paymentStatus !== 'paid') return false;
  if (ad.endsAt && new Date(ad.endsAt).getTime() < Date.now()) return false;
  return true;
}
