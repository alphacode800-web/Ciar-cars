import { db } from '@/lib/db';
import { AppError } from '@/lib/errors';
import type { WalletTopUpInput } from '@/validators/auth.schema';

export const walletService = {
  async getWallet(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [user, transactions, total] = await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        select: { walletBalance: true },
      }),
      db.walletTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.walletTransaction.count({ where: { userId } }),
    ]);

    if (!user) throw new AppError('User not found', 404);

    return {
      balance: user.walletBalance,
      transactions,
      total,
      page,
      limit,
    };
  },

  async topUp(userId: string, input: WalletTopUpInput) {
    return db.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new AppError('User not found', 404);

      const newBalance = user.walletBalance + input.amount;

      const payment = await tx.payment.create({
        data: {
          userId,
          amount: input.amount,
          currency: 'EGP',
          type: 'wallet_topup',
          status: 'completed',
          method: input.method,
          description: input.description ?? 'Wallet top-up',
        },
      });

      const transaction = await tx.walletTransaction.create({
        data: {
          userId,
          type: 'topup',
          amount: input.amount,
          balance: newBalance,
          description: input.description ?? `Top-up via ${input.method}`,
          referenceId: payment.id,
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { walletBalance: newBalance },
      });

      return {
        balance: newBalance,
        payment,
        transaction,
      };
    });
  },
};
