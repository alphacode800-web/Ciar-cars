import { createHandler } from '@/lib/api-handler';
import { apiSuccess } from '@/lib/api-response';
import { advertisementService } from '@/services/advertisement.service';
import { auditService } from '@/services/audit.service';
import { adPlanSchema } from '@/validators/advertisement.schema';

export const GET = createHandler(
  async () => {
    const plans = await advertisementService.listPlans(false);
    return apiSuccess(plans);
  },
  { auth: 'admin' }
);

export const POST = createHandler(
  async (req, { user, body }) => {
    const plan = await advertisementService.createPlan(body!);
    await auditService
      .log({
        userId: user!.id,
        action: 'ad_plan.create',
        entity: 'AdPlan',
        entityId: plan.id,
        details: body,
        ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
        userAgent: req.headers.get('user-agent') ?? undefined,
      })
      .catch(() => undefined);
    return apiSuccess(plan, { status: 201 });
  },
  { auth: 'admin', bodySchema: adPlanSchema }
);
