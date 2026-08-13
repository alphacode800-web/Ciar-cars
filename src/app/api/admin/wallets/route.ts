import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/api-auth';
import { auditService } from '@/services/audit.service';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') || 20)));
    const userId = searchParams.get('userId') || undefined;
    const type = searchParams.get('type') || undefined;

    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    if (type && type !== 'all') where.type = type;

    const [total, items] = await Promise.all([
      db.walletTransaction.count({ where }),
      db.walletTransaction.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, walletBalance: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    });
  } catch (error: unknown) {
    console.error('[ADMIN_WALLETS_GET]', error);
    if (error instanceof Error && error.name === 'AuthError') {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to load wallets' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);
    if (admin.role !== 'super_admin' && admin.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const userId = String(body.userId || '');
    const amount = Number(body.amount);
    const description = String(body.description || 'Admin adjustment');
    const type = body.type === 'debit' ? 'purchase' : 'topup';

    if (!userId || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'userId and positive amount required' },
        { status: 400 }
      );
    }

    const result = await db.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error('USER_NOT_FOUND');

      const delta = type === 'purchase' ? -amount : amount;
      const newBalance = Math.max(0, (user.walletBalance || 0) + delta);

      await tx.user.update({
        where: { id: userId },
        data: { walletBalance: newBalance },
      });

      return tx.walletTransaction.create({
        data: {
          userId,
          type: type === 'purchase' ? 'withdrawal' : 'topup',
          amount,
          balance: newBalance,
          description,
          referenceId: `admin:${admin.id}`,
        },
      });
    });

    await auditService.log({
      userId: admin.id,
      action: 'wallet.adjust',
      entity: 'WalletTransaction',
      entityId: result.id,
      details: { userId, amount, type, description },
    });

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error: unknown) {
    console.error('[ADMIN_WALLETS_POST]', error);
    if (error instanceof Error && error.message === 'USER_NOT_FOUND') {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    if (error instanceof Error && error.name === 'AuthError') {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to adjust wallet' }, { status: 500 });
  }
}
