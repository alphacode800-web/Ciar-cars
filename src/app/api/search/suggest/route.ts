import { NextRequest } from 'next/server';
import { apiSuccess, handleApiError } from '@/lib/api-response';

import { getAnalyticsApiUrl } from '@/lib/analytics-url';

export async function GET(request: NextRequest) {
  try {
    const q = new URL(request.url).searchParams.get('q') ?? '';
    if (q.length < 1) {
      return apiSuccess({ query: '', brands: [], models: [], cities: [] });
    }

    try {
      const res = await fetch(
        `${getAnalyticsApiUrl()}/search/suggest?q=${encodeURIComponent(q)}`,
        { next: { revalidate: 30 } }
      );
      if (res.ok) {
        const data = await res.json();
        return apiSuccess(data);
      }
    } catch {
      // fallback below
    }

    const { db } = await import('@/lib/db');
    const pattern = q;
    const [brands, models, cities] = await Promise.all([
      db.car.findMany({
        where: { brand: { contains: pattern }, status: 'active' },
        select: { brand: true },
        distinct: ['brand'],
        take: 8,
      }),
      db.car.findMany({
        where: { model: { contains: pattern }, status: 'active' },
        select: { model: true },
        distinct: ['model'],
        take: 8,
      }),
      db.car.findMany({
        where: { city: { contains: pattern }, status: 'active' },
        select: { city: true },
        distinct: ['city'],
        take: 8,
      }),
    ]);

    return apiSuccess({
      query: q,
      brands: brands.map((b) => b.brand),
      models: models.map((m) => m.model),
      cities: cities.map((c) => c.city),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
