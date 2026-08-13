import { db } from '@/lib/db';
import { ollamaChatJson, OllamaUnavailableError } from '@/lib/ai/ollama-client';
import { RECOMMEND_SYSTEM } from '@/lib/ai/prompts';
import { recommendResultSchema } from '@/validators/ai.schema';
import { getAiSuiteConfig, assertFeatureEnabled } from './ai-config.service';
import { logAiInteraction } from './ai-log.service';

type CarRow = {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  city: string | null;
  country: string | null;
  bodyType: string | null;
  condition: string;
  isFeatured: boolean;
  viewsCount: number;
  images?: { url: string }[];
};

async function loadCandidates(input: {
  userId?: string | null;
  carId?: string;
  limit: number;
}): Promise<{ seed?: CarRow; candidates: CarRow[] }> {
  let seed: CarRow | undefined;
  if (input.carId) {
    seed = (await db.car.findUnique({
      where: { id: input.carId },
      select: {
        id: true,
        title: true,
        brand: true,
        model: true,
        year: true,
        price: true,
        city: true,
        country: true,
        bodyType: true,
        condition: true,
        isFeatured: true,
        viewsCount: true,
        images: { take: 1, select: { url: true } },
      },
    })) as CarRow | undefined;
  }

  const user = input.userId
    ? await db.user.findUnique({
        where: { id: input.userId },
        select: { city: true, country: true },
      })
    : null;

  const saved = input.userId
    ? await db.savedSearch.findMany({
        where: { userId: input.userId },
        take: 3,
        orderBy: { updatedAt: 'desc' },
      })
    : [];

  let filterBrand: string | undefined;
  try {
    const filters = saved[0]?.filters ? JSON.parse(saved[0].filters) : {};
    filterBrand = typeof filters.brand === 'string' ? filters.brand : undefined;
  } catch {
    /* ignore */
  }

  const where: Record<string, unknown> = {
    status: 'active',
    ...(input.carId ? { id: { not: input.carId } } : {}),
  };

  if (seed?.brand) where.brand = seed.brand;
  else if (filterBrand) where.brand = filterBrand;

  let candidates = (await db.car.findMany({
    where,
    orderBy: [{ isFeatured: 'desc' }, { viewsCount: 'desc' }],
    take: Math.max(input.limit * 3, 12),
    select: {
      id: true,
      title: true,
      brand: true,
      model: true,
      year: true,
      price: true,
      city: true,
      country: true,
      bodyType: true,
      condition: true,
      isFeatured: true,
      viewsCount: true,
      images: { take: 1, select: { url: true } },
    },
  })) as CarRow[];

  if (candidates.length < input.limit) {
    const more = (await db.car.findMany({
      where: {
        status: 'active',
        ...(input.carId ? { id: { not: input.carId } } : {}),
        id: { notIn: candidates.map((c) => c.id) },
        ...(user?.country ? { country: user.country } : {}),
      },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      take: input.limit * 2,
      select: {
        id: true,
        title: true,
        brand: true,
        model: true,
        year: true,
        price: true,
        city: true,
        country: true,
        bodyType: true,
        condition: true,
        isFeatured: true,
        viewsCount: true,
        images: { take: 1, select: { url: true } },
      },
    })) as CarRow[];
    candidates = [...candidates, ...more];
  }

  return { seed, candidates };
}

function fallbackRank(candidates: CarRow[], limit: number) {
  return candidates.slice(0, limit).map((c) => ({
    ...c,
    reasonAr: c.isFeatured ? 'سيارة مميزة على المنصة' : 'من الإعلانات النشطة المناسبة',
  }));
}

export async function getAiRecommendations(input: {
  userId?: string | null;
  carId?: string;
  limit?: number;
  locale?: string;
}) {
  const config = await getAiSuiteConfig();
  assertFeatureEnabled(config, 'enableRecommendations');

  const limit = input.limit || 5;
  const { seed, candidates } = await loadCandidates({
    userId: input.userId,
    carId: input.carId,
    limit,
  });

  if (candidates.length === 0) {
    return { cars: [], noteAr: 'لا توجد توصيات متاحة حاليًا', source: 'empty' as const };
  }

  const candidateMap = new Map(candidates.map((c) => [c.id, c]));

  try {
    const { data, model, durationMs } = await ollamaChatJson(
      {
        model: config.model,
        messages: [
          { role: 'system', content: RECOMMEND_SYSTEM },
          {
            role: 'user',
            content: JSON.stringify({
              locale: input.locale || 'ar',
              seedCar: seed
                ? {
                    id: seed.id,
                    brand: seed.brand,
                    model: seed.model,
                    price: seed.price,
                    bodyType: seed.bodyType,
                    city: seed.city,
                  }
                : null,
              candidates: candidates.slice(0, 12).map((c) => ({
                id: c.id,
                title: c.title,
                brand: c.brand,
                model: c.model,
                year: c.year,
                price: c.price,
                city: c.city,
                bodyType: c.bodyType,
                condition: c.condition,
                featured: c.isFeatured,
              })),
            }),
          },
        ],
      },
      (raw) => recommendResultSchema.parse(raw)
    );

    const ranked = data.ranked
      .map((r) => {
        const car = candidateMap.get(r.id);
        if (!car) return null;
        return { ...car, reasonAr: r.reasonAr || '' };
      })
      .filter(Boolean)
      .slice(0, limit) as (CarRow & { reasonAr: string })[];

    const cars = ranked.length > 0 ? ranked : fallbackRank(candidates, limit);

    await logAiInteraction({
      kind: 'recommend',
      userId: input.userId,
      model,
      durationMs,
      status: ranked.length > 0 ? 'success' : 'fallback',
    });

    return {
      cars,
      noteAr: data.noteAr || 'توصيات مخصصة لك',
      source: ranked.length > 0 ? ('ai' as const) : ('fallback' as const),
    };
  } catch (err) {
    await logAiInteraction({
      kind: 'recommend',
      userId: input.userId,
      status: err instanceof OllamaUnavailableError ? 'fallback' : 'error',
      error: err instanceof Error ? err.message : 'recommend failed',
    });
    return {
      cars: fallbackRank(candidates, limit),
      noteAr: 'توصيات احتياطية (المساعد غير متصل)',
      source: 'fallback' as const,
    };
  }
}
