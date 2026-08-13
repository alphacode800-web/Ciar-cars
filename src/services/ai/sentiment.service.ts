import { db } from '@/lib/db';
import { ollamaChatJson, OllamaUnavailableError } from '@/lib/ai/ollama-client';
import { SENTIMENT_SYSTEM } from '@/lib/ai/prompts';
import { sentimentResultSchema } from '@/validators/ai.schema';
import { getAiSuiteConfig, assertFeatureEnabled } from './ai-config.service';
import { logAiInteraction } from './ai-log.service';

function heuristicSentiment(rating: number, comment?: string | null) {
  let label: 'positive' | 'neutral' | 'negative' = 'neutral';
  if (rating >= 4) label = 'positive';
  else if (rating <= 2) label = 'negative';
  const score = (rating - 3) / 2;
  return {
    label,
    score,
    confidence: comment ? 0.45 : 0.6,
    topics: [] as string[],
    summaryAr:
      label === 'positive'
        ? 'تقييم إيجابي'
        : label === 'negative'
          ? 'تقييم سلبي'
          : 'تقييم محايد',
  };
}

export async function analyzeReviewSentiment(reviewId: string, userId?: string) {
  const config = await getAiSuiteConfig();
  assertFeatureEnabled(config, 'enableSentiment');

  const review = await db.review.findUnique({
    where: { id: reviewId },
    include: { car: { select: { title: true, brand: true } } },
  });
  if (!review) throw new Error('Review not found');

  const fallback = heuristicSentiment(review.rating, review.comment);

  if (!review.comment?.trim()) {
    await db.review.update({
      where: { id: reviewId },
      data: {
        sentimentLabel: fallback.label,
        sentimentScore: fallback.score,
        sentimentTopics: JSON.stringify([]),
        sentimentAt: new Date(),
      },
    });
    await logAiInteraction({
      kind: 'sentiment',
      userId,
      status: 'fallback',
      meta: { reviewId, reason: 'no_comment' },
    });
    return { ...fallback, reviewId, source: 'heuristic' as const };
  }

  try {
    const { data, model, durationMs } = await ollamaChatJson(
      {
        model: config.model,
        messages: [
          { role: 'system', content: config.sentimentSystemPrompt || SENTIMENT_SYSTEM },
          {
            role: 'user',
            content: JSON.stringify({
              rating: review.rating,
              comment: review.comment,
              car: review.car.title,
              brand: review.car.brand,
            }),
          },
        ],
      },
      (raw) => sentimentResultSchema.parse(raw)
    );

    await db.review.update({
      where: { id: reviewId },
      data: {
        sentimentLabel: data.label,
        sentimentScore: data.score,
        sentimentTopics: JSON.stringify(data.topics || []),
        sentimentAt: new Date(),
      },
    });

    await logAiInteraction({
      kind: 'sentiment',
      userId,
      model,
      durationMs,
      status: 'success',
      meta: { reviewId, label: data.label },
    });

    return { ...data, reviewId, source: 'ai' as const };
  } catch (err) {
    await db.review.update({
      where: { id: reviewId },
      data: {
        sentimentLabel: fallback.label,
        sentimentScore: fallback.score,
        sentimentTopics: JSON.stringify([]),
        sentimentAt: new Date(),
      },
    });
    await logAiInteraction({
      kind: 'sentiment',
      userId,
      status: err instanceof OllamaUnavailableError ? 'fallback' : 'error',
      error: err instanceof Error ? err.message : 'sentiment failed',
      meta: { reviewId },
    });
    return { ...fallback, reviewId, source: 'heuristic' as const };
  }
}

export async function analyzePendingReviews(limit = 20, userId?: string) {
  const pending = await db.review.findMany({
    where: {
      OR: [{ sentimentLabel: null }, { sentimentAt: null }],
      comment: { not: null },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: { id: true },
  });

  const results = [];
  for (const r of pending) {
    results.push(await analyzeReviewSentiment(r.id, userId));
  }
  return { analyzed: results.length, results };
}

export async function getSentimentSummary() {
  const groups = await db.review.groupBy({
    by: ['sentimentLabel'],
    _count: { _all: true },
  });
  const map: Record<string, number> = { positive: 0, neutral: 0, negative: 0, unset: 0 };
  for (const g of groups) {
    const key = g.sentimentLabel || 'unset';
    map[key] = (map[key] || 0) + g._count._all;
  }
  return map;
}
