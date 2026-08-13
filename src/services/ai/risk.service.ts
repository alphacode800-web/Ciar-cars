import { db } from '@/lib/db';
import { ollamaChatJson, OllamaUnavailableError } from '@/lib/ai/ollama-client';
import { RISK_SYSTEM } from '@/lib/ai/prompts';
import { riskResultSchema } from '@/validators/ai.schema';
import { getAiSuiteConfig, assertFeatureEnabled } from './ai-config.service';
import { logAiInteraction } from './ai-log.service';

async function computeHeuristics(paymentId: string) {
  const payment = await db.payment.findUnique({
    where: { id: paymentId },
    include: {
      user: {
        select: {
          id: true,
          createdAt: true,
          isBanned: true,
          walletBalance: true,
        },
      },
    },
  });
  if (!payment) throw new Error('Payment not found');

  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [userPayments24h, failedCount, avgAmount] = await Promise.all([
    db.payment.count({
      where: { userId: payment.userId, createdAt: { gte: since24h } },
    }),
    db.payment.count({
      where: { userId: payment.userId, status: 'failed' },
    }),
    db.payment.aggregate({
      where: { status: 'completed' },
      _avg: { amount: true },
    }),
  ]);

  const accountAgeDays =
    (Date.now() - new Date(payment.user.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  const platformAvg = avgAmount._avg.amount || payment.amount;
  const flags: string[] = [];
  let score = 0;

  if (payment.amount > platformAvg * 3) {
    flags.push('amount_outlier');
    score += 0.35;
  }
  if (userPayments24h >= 5) {
    flags.push('velocity');
    score += 0.3;
  }
  if (accountAgeDays < 2) {
    flags.push('new_account');
    score += 0.25;
  }
  if (failedCount >= 2) {
    flags.push('failed_history');
    score += 0.2;
  }
  if (payment.user.isBanned) {
    flags.push('banned_user');
    score += 0.5;
  }

  score = Math.min(1, score);
  const level = score >= 0.65 ? 'high' : score >= 0.35 ? 'medium' : 'low';

  return {
    payment,
    heuristics: {
      amount: payment.amount,
      type: payment.type,
      status: payment.status,
      method: payment.method,
      accountAgeDays: Math.round(accountAgeDays * 10) / 10,
      userPayments24h,
      failedCount,
      platformAvgAmount: Math.round(platformAvg),
      flags,
      score,
      level: level as 'low' | 'medium' | 'high',
    },
  };
}

export async function scorePaymentRisk(paymentId: string, userId?: string) {
  const config = await getAiSuiteConfig();
  assertFeatureEnabled(config, 'enablePaymentRisk');

  const { payment, heuristics } = await computeHeuristics(paymentId);

  let explanation = {
    level: heuristics.level,
    score: heuristics.score,
    reasonsAr: heuristics.flags.map((f) => {
      switch (f) {
        case 'amount_outlier':
          return 'مبلغ أعلى من متوسط المنصة';
        case 'velocity':
          return 'عدد معاملات مرتفع خلال 24 ساعة';
        case 'new_account':
          return 'حساب حديث التسجيل';
        case 'failed_history':
          return 'سجل فشل مدفوعات سابق';
        case 'banned_user':
          return 'حساب محظور';
        default:
          return f;
      }
    }),
    adviceAr: 'مراجعة يدوية موصى بها — لا يوجد حظر تلقائي في المرحلة التجريبية',
  };

  try {
    const { data, model, durationMs } = await ollamaChatJson(
      {
        model: config.model,
        messages: [
          { role: 'system', content: RISK_SYSTEM },
          {
            role: 'user',
            content: JSON.stringify({
              heuristics,
              note: 'Advisory only. Do not invent facts.',
            }),
          },
        ],
      },
      (raw) => riskResultSchema.parse(raw)
    );
    explanation = data;
    await logAiInteraction({
      kind: 'risk',
      userId,
      model,
      durationMs,
      status: 'success',
      meta: { paymentId, level: data.level },
    });
  } catch (err) {
    await logAiInteraction({
      kind: 'risk',
      userId,
      status: err instanceof OllamaUnavailableError ? 'fallback' : 'error',
      error: err instanceof Error ? err.message : 'risk failed',
      meta: { paymentId },
    });
  }

  const updated = await db.payment.update({
    where: { id: payment.id },
    data: {
      riskScore: explanation.score,
      riskLevel: explanation.level,
      riskFlags: JSON.stringify(heuristics.flags),
      riskNotes: explanation.adviceAr,
      riskReviewedAt: new Date(),
    },
  });

  return {
    paymentId: updated.id,
    riskScore: updated.riskScore,
    riskLevel: updated.riskLevel,
    riskFlags: heuristics.flags,
    reasonsAr: explanation.reasonsAr,
    adviceAr: explanation.adviceAr,
    advisoryOnly: true as const,
  };
}

export async function scoreRecentPayments(limit = 20, userId?: string) {
  const payments = await db.payment.findMany({
    where: {
      OR: [{ riskLevel: null }, { riskReviewedAt: null }],
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: { id: true },
  });
  const results = [];
  for (const p of payments) {
    results.push(await scorePaymentRisk(p.id, userId));
  }
  return { scored: results.length, results };
}
