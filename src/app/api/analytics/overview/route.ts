import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import { apiSuccess, handleApiError } from '@/lib/api-response';
import { carService } from '@/services/car.service';
import { db } from '@/lib/db';

import { getAnalyticsApiUrl } from '@/lib/analytics-url';

const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY ?? 'ciar-dev-internal-key';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    try {
      const res = await fetch(`${getAnalyticsApiUrl()}/analytics/overview`, {
        headers: { 'X-Api-Key': INTERNAL_API_KEY },
        next: { revalidate: 60 },
      });
      if (res.ok) {
        const data = await res.json();
        return apiSuccess({ source: 'python-analytics-api', ...data });
      }
    } catch {
      // Fall back to TypeScript services
    }

    const [carStats, userCount, paymentSum, topBrands] = await Promise.all([
      carService.getStats(),
      db.user.count(),
      db.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'completed' },
      }),
      db.car.groupBy({
        by: ['brand'],
        where: { status: 'active' },
        _count: true,
        orderBy: { _count: { brand: 'desc' } },
        take: 10,
      }),
    ]);

    return apiSuccess({
      source: 'nextjs-fallback',
      generated_at: new Date().toISOString(),
      users: userCount,
      cars_total: carStats.total,
      cars_active: carStats.active,
      cars_featured: carStats.featured,
      payments_total: paymentSum._sum.amount ?? 0,
      top_brands: topBrands.map((b) => ({ brand: b.brand, count: b._count })),
      price_stats: { avg: carStats.averagePrice },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
