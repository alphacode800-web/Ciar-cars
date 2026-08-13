import { createHandler } from '@/lib/api-handler';
import { apiError, apiSuccess } from '@/lib/api-response';
import { aiSeoSchema } from '@/validators/ai.schema';
import { generateSeoDraft } from '@/services/ai/seo.service';
import { auditService } from '@/services/audit.service';

export const POST = createHandler(
  async (_req, { user, body }) => {
    try {
      const data = await generateSeoDraft({
        ...body!,
        userId: user!.id,
      });
      await auditService.log({
        userId: user!.id,
        action: 'ai.seo.draft',
        entity: body!.target,
        entityId: body!.id,
      });
      return apiSuccess(data);
    } catch (err) {
      return apiError(err instanceof Error ? err.message : 'SEO failed', 400);
    }
  },
  { auth: 'admin', bodySchema: aiSeoSchema }
);
