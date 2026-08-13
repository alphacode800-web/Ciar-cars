/**
 * Add a rich, idempotent set of published demo advertisements.
 * Usage: npx tsx scripts/seed-demo-advertisements.ts
 */
import { db } from '../src/lib/db';
import { DEFAULT_AD_PLANS } from '../src/lib/ad-constants';

const demoAds = [
  ['فستان قطني صيفي فاخر', 'clothing', 'فساتين نسائية', 18500, 15, 24, 'قطن', ['أبيض', 'وردي', 'أزرق'], ['S', 'M', 'L', 'XL'], 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=900&h=700&fit=crop'],
  ['عباية سودانية مطرزة يدويًا', 'clothing', 'عبايات', 32000, 10, 12, 'حرير', ['أسود', 'ذهبي'], ['M', 'L', 'XL', 'XXL'], 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=900&h=700&fit=crop'],
  ['قميص رجالي كتان', 'clothing', 'ملابس رجالية', 12500, 20, 35, 'كتان', ['أبيض', 'بيج', 'سماوي'], ['M', 'L', 'XL'], 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=900&h=700&fit=crop'],
  ['طقم أطفال مريح', 'clothing', 'ملابس أطفال', 8500, 5, 40, 'قطن', ['أصفر', 'أزرق', 'وردي'], ['S', 'M', 'L'], 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=900&h=700&fit=crop'],
  ['حذاء رياضي أصلي', 'clothing', 'أحذية', 28000, 12, 18, 'مزيج', ['أبيض', 'أسود'], ['M', 'L', 'XL'], 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&h=700&fit=crop'],
  ['هاتف ذكي حديث 256GB', 'electronics', 'هواتف', 295000, 8, 9, null, ['أسود', 'فضي'], [], 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=900&h=700&fit=crop'],
  ['حاسوب محمول للأعمال', 'electronics', 'حاسوب', 485000, 10, 6, null, ['رمادي'], [], 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=900&h=700&fit=crop'],
  ['سماعات لاسلكية بعزل الضوضاء', 'electronics', 'صوتيات', 65000, 25, 15, null, ['أسود', 'أبيض'], [], 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&h=700&fit=crop'],
  ['ساعة ذكية رياضية', 'electronics', 'ساعات ذكية', 78000, 18, 20, null, ['أسود', 'أخضر'], [], 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&h=700&fit=crop'],
  ['أريكة عصرية ثلاثية', 'home', 'أثاث', 210000, 10, 4, null, ['رمادي', 'بيج'], [], 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&h=700&fit=crop'],
  ['طاولة طعام خشب طبيعي', 'home', 'أثاث', 175000, 7, 3, null, ['بني'], [], 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=900&h=700&fit=crop'],
  ['مصباح ديكور أنيق', 'home', 'إضاءة', 18000, 20, 22, null, ['ذهبي', 'أسود'], [], 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=900&h=700&fit=crop'],
  ['مجموعة عناية بالبشرة', 'beauty', 'عناية بالبشرة', 24500, 15, 30, null, [], [], 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=900&h=700&fit=crop'],
  ['عطر شرقي فاخر', 'beauty', 'عطور', 38000, 10, 14, null, [], [], 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=900&h=700&fit=crop'],
  ['تصميم شعارات وهوية بصرية', 'services', 'تصميم', 45000, 0, 99, null, [], [], 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=900&h=700&fit=crop'],
  ['خدمة تصوير منتجات احترافية', 'services', 'تصوير', 60000, 15, 20, null, [], [], 'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?w=900&h=700&fit=crop'],
  ['دراجة هوائية جبلية', 'general', 'رياضة', 95000, 12, 7, null, ['أحمر', 'أسود'], [], 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=900&h=700&fit=crop'],
  ['حقيبة سفر متينة', 'general', 'حقائب', 32000, 20, 16, null, ['أسود', 'أزرق'], [], 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900&h=700&fit=crop'],
] as const;

async function main() {
  const owner = await db.user.upsert({
    where: { email: 'demo.ads@ciar.local' },
    update: { isActive: true, role: 'seller' },
    create: {
      email: 'demo.ads@ciar.local',
      name: 'متجر CIAR التجريبي',
      role: 'seller',
      isActive: true,
      phone: '+249912345678',
      city: 'الخرطوم',
      country: 'Sudan',
      businessName: 'متجر CIAR التجريبي',
    },
  });

  let plan = await db.adPlan.findFirst({ where: { isFeatured: true, isActive: true } });
  if (!plan) {
    const source = DEFAULT_AD_PLANS.find((p) => p.isFeatured)!;
    plan = await db.adPlan.create({ data: { ...source } });
  }

  const now = new Date();
  const endsAt = new Date(now.getTime() + plan.durationDays * 86_400_000);
  let created = 0;

  for (let index = 0; index < demoAds.length; index++) {
    const [title, category, subcategory, price, discountPercent, quantity, fabricType, colors, sizes, image] =
      demoAds[index];
    const slug = `demo-ad-${String(index + 1).padStart(2, '0')}`;
    const existing = await db.advertisement.findUnique({ where: { slug } });
    if (existing) continue;

    await db.advertisement.create({
      data: {
        slug,
        title,
        description: `إعلان تجريبي مميز لـ ${title}. جودة ممتازة، تفاصيل واضحة، وإمكانية التواصل المباشر مع المعلن. الكمية محدودة والأسعار قابلة للتحديث.`,
        category,
        subcategory,
        fabricType,
        colors: JSON.stringify(colors),
        sizes: JSON.stringify(sizes),
        quantity,
        price,
        currency: 'SDG',
        discountPercent,
        shippingAvailable: true,
        shippingInfo: 'توصيل داخل الخرطوم وخيارات شحن إلى بقية الولايات خلال 2–5 أيام.',
        phone: '+249912345678',
        whatsapp: 'https://wa.me/249912345678',
        city: index % 3 === 0 ? 'أم درمان' : index % 3 === 1 ? 'الخرطوم' : 'بحري',
        country: 'Sudan',
        ownerId: owner.id,
        planId: plan.id,
        status: 'published',
        paymentStatus: 'paid',
        isFeatured: index < 8,
        startsAt: now,
        publishedAt: now,
        endsAt,
        viewsCount: 75 + index * 37,
        reviewedAt: now,
        media: {
          create: {
            url: image,
            type: 'image',
            mimeType: 'image/jpeg',
            alt: title,
            isPrimary: true,
            order: 0,
          },
        },
      },
    });
    created++;
  }

  console.log(`Demo advertisements: created ${created}, total template set ${demoAds.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
