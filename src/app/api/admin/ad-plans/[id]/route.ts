import { createHandler } from '@/lib/api-handler';
import { apiSuccess } from '@/lib/api-response';
import { advertisementService } from '@/services/advertisement.service';
import { auditService } from '@/services/audit.service';
import { adPlanSchema } from '@/validators/advertisement.schema';

export const PUT = createHandler(
  async (req, { user, params, body }) => {
    const plan = await advertisementService.updatePlan(params.id, body!);
    await auditService
      .log({
        userId: user!.id,
        action: 'ad_plan.update',
        entity: 'AdPlan',
        entityId: params.id,
        details: body,
        ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
        userAgent: req.headers.get('user-agent') ?? undefined,
      })
      .catch(() => undefined);
    return apiSuccess(plan);
  },
  { auth: 'admin', bodySchema: adPlanSchema.partial() }
);

export const DELETE = createHandler(
  async (req, { user, params }) => {
    const plan = await advertisementService.deletePlan(params.id);
    await auditService
      .log({
        userId: user!.id,
        action: 'ad_plan.delete',
        entity: 'AdPlan',
        entityId: params.id,
        ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
        userAgent: req.headers.get('user-agent') ?? undefined,
      })
      .catch(() => undefined);
    return apiSuccess(plan);
  },
  { auth: 'admin' }
);
