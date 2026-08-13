import { createHandler } from '@/lib/api-handler';
import { apiError, apiSuccess } from '@/lib/api-response';
import { aiSentimentSchema } from '@/validators/ai.schema';
import {
  analyzePendingReviews,
  analyzeReviewSentiment,
  getSentimentSummary,
} from '@/services/ai/sentiment.service';
import { auditService } from '@/services/audit.service';

export const GET = createHandler(async () => {
  const summary = await getSentimentSummary();
  return apiSuccess(summary);
}, { auth: 'admin' });

export const POST = createHandler(
  async (_req, { user, body }) => {
    try {
      if (body!.reviewId) {
        const result = await analyzeReviewSentiment(body!.reviewId, user!.id);
        await auditService.log({
          userId: user!.id,
          action: 'ai.sentiment.analyze',
          entity: 'Review',
          entityId: body!.reviewId,
        });
        return apiSuccess(result);
      }
      const batch = await analyzePendingReviews(body!.limit || 20, user!.id);
      await auditService.log({
        userId: user!.id,
        action: 'ai.sentiment.batch',
        entity: 'Review',
        details: { count: batch.analyzed },
      });
      return apiSuccess(batch);
    } catch (err) {
      return apiError(err instanceof Error ? err.message : 'Sentiment failed', 400);
    }
  },
  { auth: 'admin', bodySchema: aiSentimentSchema }
);
