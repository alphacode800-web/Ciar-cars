import { createHandler } from '@/lib/api-handler';
import { apiError, apiSuccess } from '@/lib/api-response';
import { aiPaymentScoreSchema } from '@/validators/ai.schema';
import { scorePaymentRisk, scoreRecentPayments } from '@/services/ai/risk.service';
import { auditService } from '@/services/audit.service';

export const POST = createHandler(
  async (_req, { user, body }) => {
    try {
      if (body!.paymentId) {
        const result = await scorePaymentRisk(body!.paymentId, user!.id);
        await auditService.log({
          userId: user!.id,
          action: 'ai.payment.score',
          entity: 'Payment',
          entityId: body!.paymentId,
          details: { level: result.riskLevel },
        });
        return apiSuccess(result);
      }
      const batch = await scoreRecentPayments(body!.limit || 15, user!.id);
      await auditService.log({
        userId: user!.id,
        action: 'ai.payment.score_batch',
        entity: 'Payment',
        details: { count: batch.scored },
      });
      return apiSuccess(batch);
    } catch (err) {
      return apiError(err instanceof Error ? err.message : 'Risk scoring failed', 400);
    }
  },
  { auth: 'admin', bodySchema: aiPaymentScoreSchema }
);
