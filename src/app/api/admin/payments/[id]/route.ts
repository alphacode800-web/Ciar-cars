import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/api-auth';
import { auditService } from '@/services/audit.service';

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending: ['completed', 'failed', 'refunded'],
  completed: ['refunded'],
  failed: ['pending'],
  refunded: [],
};

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin(request);
    const { id } = await context.params;
    const body = await request.json();
    const status = String(body.status || '');

    const payment = await db.payment.findUnique({ where: { id } });
    if (!payment) {
      return NextResponse.json({ success: false, error: 'Payment not found' }, { status: 404 });
    }

    const allowed = ALLOWED_TRANSITIONS[payment.status] || [];
    if (!allowed.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot change status from ${payment.status} to ${status}`,
        },
        { status: 400 }
      );
    }

    const result = await db.$transaction(async (tx) => {
      const updated = await tx.payment.update({
        where: { id },
        data: { status },
      });

      if (status === 'refunded' && payment.status === 'completed') {
        const user = await tx.user.findUnique({ where: { id: payment.userId } });
        if (user) {
          const newBalance = (user.walletBalance || 0) + payment.amount;
          await tx.user.update({
            where: { id: user.id },
            data: { walletBalance: newBalance },
          });
          await tx.walletTransaction.create({
            data: {
              userId: user.id,
              type: 'refund',
              amount: payment.amount,
              balance: newBalance,
              description: `Refund for payment ${payment.id}`,
              referenceId: payment.id,
            },
          });
        }
      }

      return updated;
    });

    await auditService.log({
      userId: admin.id,
      action: `payment.${status}`,
      entity: 'Payment',
      entityId: id,
      details: { from: payment.status, to: status, amount: payment.amount },
      ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
    });

    return NextResponse.json({ success: true, data: result, message: 'Payment updated' });
  } catch (error: unknown) {
    console.error('[ADMIN_PAYMENT_PUT]', error);
    if (error instanceof Error && error.name === 'AuthError') {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to update payment' }, { status: 500 });
  }
}
