import { createHandler } from '@/lib/api-handler';
import { apiError, apiSuccess } from '@/lib/api-response';
import { aiMarketingSchema } from '@/validators/ai.schema';
import { generateMarketingDraft } from '@/services/ai/marketing.service';
import { auditService } from '@/services/audit.service';

export const POST = createHandler(
  async (_req, { user, body }) => {
    try {
      const data = await generateMarketingDraft({
        goal: body?.goal,
        locale: body?.locale || 'ar',
        userId: user!.id,
      });
      await auditService.log({
        userId: user!.id,
        action: 'ai.marketing.draft',
        entity: 'Marketing',
      });
      return apiSuccess(data);
    } catch (err) {
      return apiError(err instanceof Error ? err.message : 'Marketing draft failed', 400);
    }
  },
  { auth: 'admin', bodySchema: aiMarketingSchema }
);
