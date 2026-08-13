import { db } from '@/lib/db';
import { ollamaChatJson, OllamaUnavailableError } from '@/lib/ai/ollama-client';
import { INSIGHTS_SYSTEM } from '@/lib/ai/prompts';
import { insightsResultSchema } from '@/validators/ai.schema';
import { getAiSuiteConfig, assertFeatureEnabled } from './ai-config.service';
import { logAiInteraction } from './ai-log.service';

async function collectDeterministicStats(country?: string) {
  const carWhere = country ? { country } : {};

  const [
    totalActive,
    totalPending,
    staleListings,
    topBrands,
    topCities,
    recentBookings,
    avgViews,
  ] = await Promise.all([
    db.car.count({ where: { status: 'active', ...carWhere } }),
    db.car.count({ where: { status: 'pending', ...carWhere } }),
    db.car.findMany({
      where: {
        status: 'active',
        viewsCount: { lt: 5 },
        createdAt: { lt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
        ...carWhere,
      },
      take: 8,
      orderBy: { createdAt: 'asc' },
      select: { id: true, title: true, brand: true, city: true, viewsCount: true },
    }),
    db.car.groupBy({
      by: ['brand'],
      where: { status: 'active', ...carWhere },
      _count: { _all: true },
      orderBy: { _count: { brand: 'desc' } },
      take: 8,
    }),
    db.car.groupBy({
      by: ['city'],
      where: { status: 'active', ...carWhere },
      _count: { _all: true },
      orderBy: { _count: { city: 'desc' } },
      take: 8,
    }),
    db.rentalBooking.count({
      where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
    }),
    db.car.aggregate({
      where: { status: 'active', ...carWhere },
      _avg: { viewsCount: true },
    }),
  ]);

  return {
    country: country || 'all',
    totalActive,
    totalPending,
    recentBookings30d: recentBookings,
    avgViews: Math.round(avgViews._avg.viewsCount || 0),
    staleListings: staleListings.map((c) => ({
      id: c.id,
      title: c.title,
      brand: c.brand,
      city: c.city,
      views: c.viewsCount,
    })),
    topBrands: topBrands.map((b) => ({ brand: b.brand, count: b._count._all })),
    topCities: topCities.map((c) => ({ city: c.city, count: c._count._all })),
  };
}

export async function getAiInsights(input: {
  kind?: string;
  country?: string;
  userId?: string;
}) {
  const config = await getAiSuiteConfig();
  assertFeatureEnabled(config, 'enableInsights');

  const stats = await collectDeterministicStats(input.country);

  const fallback = {
    headlineAr: `تحليل المخزون: ${stats.totalActive} إعلان نشط`,
    bulletsAr: [
      `${stats.totalPending} إعلان بانتظار المراجعة`,
      `${stats.staleListings.length} إعلان راكد (مشاهدات منخفضة)`,
      `${stats.recentBookings30d} حجز خلال 30 يومًا`,
      `أعلى الماركات: ${stats.topBrands
        .slice(0, 3)
        .map((b) => b.brand)
        .join('، ') || '—'}`,
    ],
    actionsAr: [
      'راجع الإعلانات الراكدة وحسّن العناوين والصور',
      'ركّز الحملات على المدن الأعلى نشاطًا',
    ],
    risksAr:
      stats.staleListings.length > 5
        ? ['تراكم إعلانات قليلة المشاهدات قد يضعف جودة الكتالوج']
        : [],
  };

  try {
    const { data, model, durationMs } = await ollamaChatJson(
      {
        model: config.model,
        messages: [
          { role: 'system', content: INSIGHTS_SYSTEM },
          {
            role: 'user',
            content: JSON.stringify({
              kind: input.kind || 'inventory_demand',
              stats,
              instruction: 'Use ONLY these numbers. Write Arabic insights for admins.',
            }),
          },
        ],
      },
      (raw) => insightsResultSchema.parse(raw)
    );

    await logAiInteraction({
      kind: 'insights',
      userId: input.userId,
      model,
      durationMs,
      status: 'success',
    });

    return { stats, narrative: data, source: 'ai' as const };
  } catch (err) {
    await logAiInteraction({
      kind: 'insights',
      userId: input.userId,
      status: err instanceof OllamaUnavailableError ? 'fallback' : 'error',
      error: err instanceof Error ? err.message : 'insights failed',
    });
    return { stats, narrative: fallback, source: 'fallback' as const };
  }
}
