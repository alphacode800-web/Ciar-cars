import { createHandler } from '@/lib/api-handler';
import { apiSuccess } from '@/lib/api-response';
import { advertisementService } from '@/services/advertisement.service';
import { auditService } from '@/services/audit.service';
import { payAdvertisementSchema } from '@/validators/advertisement.schema';

export const POST = createHandler(
  async (req, { user, params, body }) => {
    const result = await advertisementService.pay(params.id, user!.id, body!);
    await auditService
      .log({
        userId: user!.id,
        action: 'advertisement.pay',
        entity: 'Advertisement',
        entityId: params.id,
        details: {
          method: body!.method,
          paymentId: result.payment.id,
          status: result.payment.status,
        },
        ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
        userAgent: req.headers.get('user-agent') ?? undefined,
      })
      .catch(() => undefined);
    return apiSuccess(result, { message: 'Payment submitted' });
  },
  { auth: 'user', bodySchema: payAdvertisementSchema }
);
