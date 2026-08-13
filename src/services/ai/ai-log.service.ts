import { db } from '@/lib/db';

export type AiInteractionKind =
  | 'chat'
  | 'recommend'
  | 'sentiment'
  | 'seo'
  | 'insights'
  | 'risk'
  | 'marketing'
  | 'health';

export async function logAiInteraction(input: {
  kind: AiInteractionKind;
  userId?: string | null;
  model?: string | null;
  durationMs?: number | null;
  status: 'success' | 'error' | 'fallback';
  error?: string | null;
  meta?: Record<string, unknown> | null;
}) {
  try {
    await db.aiInteraction.create({
      data: {
        kind: input.kind,
        userId: input.userId || null,
        model: input.model || null,
        durationMs: input.durationMs ?? null,
        status: input.status,
        error: input.error ? input.error.slice(0, 500) : null,
        meta: input.meta ? JSON.stringify(input.meta).slice(0, 4000) : null,
      },
    });
  } catch {
    // Never break primary flows because of logging
  }
}

const EMPTY_STATS = {
  recent: [] as {
    id: string;
    kind: string;
    status: string;
    model: string | null;
    durationMs: number | null;
    error: string | null;
    createdAt: Date;
  }[],
  byStatus: {} as Record<string, number>,
  byKind: {} as Record<string, number>,
  avgDurationMs: 0,
};

export async function getAiInteractionStats(limit = 30) {
  try {
    const [recent, byStatus, byKind] = await Promise.all([
      db.aiInteraction.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          kind: true,
          status: true,
          model: true,
          durationMs: true,
          error: true,
          createdAt: true,
        },
      }),
      db.aiInteraction.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      db.aiInteraction.groupBy({
        by: ['kind'],
        _count: { _all: true },
      }),
    ]);

    const avgDuration = await db.aiInteraction.aggregate({
      where: { status: 'success', durationMs: { not: null } },
      _avg: { durationMs: true },
    });

    return {
      recent,
      byStatus: Object.fromEntries(byStatus.map((r) => [r.status, r._count._all])),
      byKind: Object.fromEntries(byKind.map((r) => [r.kind, r._count._all])),
      avgDurationMs: Math.round(avgDuration._avg.durationMs || 0),
    };
  } catch {
    // Telemetry must never break the admin UI (e.g. stale Prisma client)
    return { ...EMPTY_STATS };
  }
}
