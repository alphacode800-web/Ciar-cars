import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { carService } from '@/services/car.service';
import { apiSuccess, handleApiError } from '@/lib/api-response';

export async function GET() {
  try {
    const started = Date.now();
    await db.$queryRaw`SELECT 1`;
    const carStats = await carService.getStats();
    const userCount = await db.user.count();

    return apiSuccess({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        connected: true,
        latencyMs: Date.now() - started,
        provider: 'sqlite',
      },
      stats: {
        users: userCount,
        ...carStats,
      },
      version: process.env.npm_package_version ?? '0.2.0',
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
