import { db } from '@/lib/db';
import { ollamaChatJson, OllamaUnavailableError } from '@/lib/ai/ollama-client';
import { MARKETING_SYSTEM } from '@/lib/ai/prompts';
import { marketingResultSchema } from '@/validators/ai.schema';
import { getAiSuiteConfig, assertFeatureEnabled } from './ai-config.service';
import { logAiInteraction } from './ai-log.service';

export async function generateMarketingDraft(input: {
  goal?: string;
  locale?: string;
  userId?: string;
}) {
  const config = await getAiSuiteConfig();
  assertFeatureEnabled(config, 'enableMarketing');

  const [cars, brandGroups, cities] = await Promise.all([
    db.car.findMany({
      where: { status: 'active', isFeatured: true },
      take: 8,
      select: { id: true, title: true, brand: true, price: true, city: true },
    }),
    db.car.groupBy({
      by: ['brand'],
      where: { status: 'active' },
      _count: { _all: true },
      orderBy: { _count: { brand: 'desc' } },
      take: 5,
    }),
    db.car.groupBy({
      by: ['city'],
      where: { status: 'active' },
      _count: { _all: true },
      orderBy: { _count: { city: 'desc' } },
      take: 5,
    }),
  ]);

  const carIds = cars.map((c) => c.id);
  const fallback = {
    audienceAr: `مهتمون بسيارات ${brandGroups[0]?.brand || 'مميزة'} في ${cities[0]?.city || 'المدن الرئيسية'}`,
    headlineAr: 'اعثر على سيارتك التالية مع CIAR Cars',
    bodyAr:
      'تصفح سيارات مختارة للشراء والتأجير بأسعار واضحة ودعم محلي. ابدأ البحث الآن واحفظ إعلاناتك المفضلة.',
    ctaAr: 'تصفح السيارات الآن',
    keywords: ['سيارات', 'شراء سيارة', 'تأجير', 'CIAR'],
    suggestedCarIds: carIds.slice(0, 3),
  };

  try {
    const { data, model, durationMs } = await ollamaChatJson(
      {
        model: config.model,
        messages: [
          { role: 'system', content: MARKETING_SYSTEM },
          {
            role: 'user',
            content: JSON.stringify({
              goal: input.goal || 'زيادة زيارات صفحة السيارات',
              locale: input.locale || 'ar',
              topBrands: brandGroups.map((b) => ({ brand: b.brand, count: b._count._all })),
              topCities: cities.map((c) => ({ city: c.city, count: c._count._all })),
              featuredCars: cars,
              note: 'Experimental draft only. Do not send ads externally.',
            }),
          },
        ],
      },
      (raw) => marketingResultSchema.parse(raw)
    );

    const suggested = (data.suggestedCarIds || []).filter((id) => carIds.includes(id));
    await logAiInteraction({
      kind: 'marketing',
      userId: input.userId,
      model,
      durationMs,
      status: 'success',
    });

    return {
      ...data,
      suggestedCarIds: suggested.length ? suggested : carIds.slice(0, 3),
      source: 'ai' as const,
      draftOnly: true as const,
    };
  } catch (err) {
    await logAiInteraction({
      kind: 'marketing',
      userId: input.userId,
      status: err instanceof OllamaUnavailableError ? 'fallback' : 'error',
      error: err instanceof Error ? err.message : 'marketing failed',
    });
    return { ...fallback, source: 'fallback' as const, draftOnly: true as const };
  }
}
