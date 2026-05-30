import { createHandler } from '@/lib/api-handler';
import { apiSuccess } from '@/lib/api-response';
import { walletTopUpSchema } from '@/validators/auth.schema';
import { walletService } from '@/services/wallet.service';
import { auditService } from '@/services/audit.service';

export const POST = createHandler(
  async (req, { user, body }) => {
    const result = await walletService.topUp(user!.id, body!);

    await auditService.log({
      userId: user!.id,
      action: 'wallet.topup',
      entity: 'Payment',
      entityId: result.payment.id,
      details: { amount: body!.amount, method: body!.method },
      ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
    });

    return apiSuccess(
      {
        balance: result.balance,
        transaction: result.transaction,
        payment: result.payment,
      },
      { message: 'Wallet topped up successfully' }
    );
  },
  { auth: 'user', bodySchema: walletTopUpSchema }
);
