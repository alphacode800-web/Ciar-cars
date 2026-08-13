import { z } from 'zod';
import { createHandler } from '@/lib/api-handler';
import { apiSuccess } from '@/lib/api-response';
import { advertisementService } from '@/services/advertisement.service';
import { auditService } from '@/services/audit.service';

const confirmSchema = z.object({
  paymentId: z.string().min(1),
});

export const POST = createHandler(
  async (req, { user, body }) => {
    const result = await advertisementService.confirmBankPayment(body!.paymentId, user!.id);
    await auditService
      .log({
        userId: user!.id,
        action: 'advertisement.confirm_payment',
        entity: 'Payment',
        entityId: body!.paymentId,
        details: { advertisementId: result.advertisement.id },
        ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
        userAgent: req.headers.get('user-agent') ?? undefined,
      })
      .catch(() => undefined);
    return apiSuccess(result, { message: 'Payment confirmed' });
  },
  { auth: 'admin', bodySchema: confirmSchema }
);
