import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { AppError } from '@/lib/errors';
import { buildPagination } from '@/lib/api-response';
import { DEFAULT_AD_PLANS, finalAdPrice, isAdPubliclyVisible } from '@/lib/ad-constants';
import type {
  AdvertisementListQuery,
  CreateAdvertisementInput,
  PayAdvertisementInput,
  UpdateAdvertisementInput,
  AdPlanInput,
} from '@/validators/advertisement.schema';

function slugify(text: string): string {
  const base = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
  return base || `ad-${Date.now()}`;
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  let i = 0;
  while (await db.advertisement.findUnique({ where: { slug } })) {
    i += 1;
    slug = `${base}-${i}`;
  }
  return slug;
}

function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function serializeMedia(
  media: CreateAdvertisementInput['media'] | undefined
): Prisma.AdvertisementMediaCreateWithoutAdvertisementInput[] {
  return (media || []).map((m, index) => ({
    url: m.url,
    type: m.type || 'image',
    mimeType: m.mimeType ?? null,
    alt: m.alt ?? null,
    isPrimary: m.isPrimary ?? index === 0,
    order: m.order ?? index,
  }));
}

function mapAd(ad: any) {
  if (!ad) return ad;
  return {
    ...ad,
    colors: parseJsonArray(ad.colors),
    sizes: parseJsonArray(ad.sizes),
    finalPrice: finalAdPrice(ad.price, ad.discountPercent || 0),
    isPublic: isAdPubliclyVisible(ad),
  };
}

const ownerSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  avatar: true,
  city: true,
  country: true,
} as const;

export const advertisementService = {
  async ensureDefaultPlans() {
    const count = await db.adPlan.count();
    if (count > 0) return;
    await db.adPlan.createMany({
      data: DEFAULT_AD_PLANS.map((p) => ({ ...p })),
    });
  },

  async listPlans(activeOnly = true) {
    await this.ensureDefaultPlans();
    return db.adPlan.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: [{ order: 'asc' }, { price: 'asc' }],
    });
  },

  async createPlan(input: AdPlanInput) {
    return db.adPlan.create({ data: input });
  },

  async updatePlan(id: string, input: Partial<AdPlanInput>) {
    const plan = await db.adPlan.findUnique({ where: { id } });
    if (!plan) throw new AppError('Plan not found', 404);
    return db.adPlan.update({ where: { id }, data: input });
  },

  async deletePlan(id: string) {
    const used = await db.advertisement.count({ where: { planId: id } });
    if (used > 0) {
      return db.adPlan.update({ where: { id }, data: { isActive: false } });
    }
    return db.adPlan.delete({ where: { id } });
  },

  async create(ownerId: string, input: CreateAdvertisementInput) {
    const slug = await uniqueSlug(slugify(input.title));
    let plan: {
      id: string;
      maxImages: number;
      allowVideo: boolean;
      isFeatured: boolean;
      price: number;
      currency: string;
      durationDays: number;
    } | null = null;
    if (input.planId) {
      plan = await db.adPlan.findFirst({ where: { id: input.planId, isActive: true } });
      if (!plan) throw new AppError('Invalid ad plan', 400);
      const images = (input.media || []).filter((m) => m.type !== 'video');
      const videos = (input.media || []).filter((m) => m.type === 'video');
      if (images.length > plan.maxImages) {
        throw new AppError(`Maximum ${plan.maxImages} images allowed for this plan`, 400);
      }
      if (videos.length > 0 && !plan.allowVideo) {
        throw new AppError('This plan does not allow video', 400);
      }
      if (videos.length > 1) {
        throw new AppError('Only one video is allowed', 400);
      }
    }

    const status = input.submit
      ? input.planId
        ? 'pending_payment'
        : 'draft'
      : 'draft';

    const ad = await db.advertisement.create({
      data: {
        slug,
        title: input.title,
        description: input.description ?? null,
        category: input.category,
        subcategory: input.subcategory ?? null,
        fabricType: input.fabricType ?? null,
        colors: JSON.stringify(input.colors || []),
        sizes: JSON.stringify(input.sizes || []),
        quantity: input.quantity ?? null,
        price: input.price,
        currency: input.currency || 'EGP',
        discountPercent: input.discountPercent || 0,
        shippingInfo: input.shippingInfo ?? null,
        shippingAvailable: input.shippingAvailable || false,
        phone: input.phone ?? null,
        whatsapp: input.whatsapp ?? null,
        city: input.city ?? null,
        country: input.country ?? null,
        planId: plan?.id ?? null,
        isFeatured: plan?.isFeatured ?? false,
        status,
        paymentStatus: 'unpaid',
        ownerId,
        media: {
          create: serializeMedia(input.media),
        },
      },
      include: {
        media: { orderBy: { order: 'asc' } },
        plan: true,
        owner: { select: ownerSelect },
      },
    });

    return mapAd(ad);
  },

  async update(id: string, ownerId: string | null, input: UpdateAdvertisementInput, isAdmin = false) {
    const existing = await db.advertisement.findUnique({
      where: { id },
      include: { media: true, plan: true },
    });
    if (!existing || existing.status === 'deleted') {
      throw new AppError('Advertisement not found', 404);
    }
    if (!isAdmin && existing.ownerId !== ownerId) {
      throw new AppError('Forbidden', 403);
    }

    const contentChanged = Boolean(
      input.title ||
        input.description !== undefined ||
        input.category ||
        input.price !== undefined ||
        input.media ||
        input.colors ||
        input.sizes ||
        input.fabricType !== undefined ||
        input.quantity !== undefined
    );

    let nextStatus = existing.status;
    if (!isAdmin && contentChanged && existing.status === 'published') {
      nextStatus = 'pending_review';
    }
    if (!isAdmin && input.submit) {
      nextStatus = existing.paymentStatus === 'paid' ? 'pending_review' : 'pending_payment';
    }

    const planId = input.planId === undefined ? existing.planId : input.planId;
    let plan = existing.plan;
    if (planId && planId !== existing.planId) {
      const found = await db.adPlan.findFirst({ where: { id: planId, isActive: true } });
      if (!found) throw new AppError('Invalid ad plan', 400);
      plan = found;
    }

    if (input.media && plan) {
      const images = input.media.filter((m) => m.type !== 'video');
      const videos = input.media.filter((m) => m.type === 'video');
      if (images.length > plan.maxImages) {
        throw new AppError(`Maximum ${plan.maxImages} images allowed`, 400);
      }
      if (videos.length > 0 && !plan.allowVideo) {
        throw new AppError('This plan does not allow video', 400);
      }
    }

    const data: Prisma.AdvertisementUpdateInput = {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.category !== undefined ? { category: input.category } : {}),
      ...(input.subcategory !== undefined ? { subcategory: input.subcategory } : {}),
      ...(input.fabricType !== undefined ? { fabricType: input.fabricType } : {}),
      ...(input.colors !== undefined ? { colors: JSON.stringify(input.colors) } : {}),
      ...(input.sizes !== undefined ? { sizes: JSON.stringify(input.sizes) } : {}),
      ...(input.quantity !== undefined ? { quantity: input.quantity } : {}),
      ...(input.price !== undefined ? { price: input.price } : {}),
      ...(input.currency !== undefined ? { currency: input.currency } : {}),
      ...(input.discountPercent !== undefined ? { discountPercent: input.discountPercent } : {}),
      ...(input.shippingInfo !== undefined ? { shippingInfo: input.shippingInfo } : {}),
      ...(input.shippingAvailable !== undefined
        ? { shippingAvailable: input.shippingAvailable }
        : {}),
      ...(input.phone !== undefined ? { phone: input.phone } : {}),
      ...(input.whatsapp !== undefined ? { whatsapp: input.whatsapp } : {}),
      ...(input.city !== undefined ? { city: input.city } : {}),
      ...(input.country !== undefined ? { country: input.country } : {}),
      ...(planId !== undefined
        ? { plan: planId ? { connect: { id: planId } } : { disconnect: true } }
        : {}),
      status: nextStatus,
    };

    if (input.media) {
      await db.advertisementMedia.deleteMany({ where: { advertisementId: id } });
      data.media = { create: serializeMedia(input.media) };
    }

    const ad = await db.advertisement.update({
      where: { id },
      data,
      include: {
        media: { orderBy: { order: 'asc' } },
        plan: true,
        owner: { select: ownerSelect },
      },
    });
    return mapAd(ad);
  },

  async getById(idOrSlug: string, opts?: { increaseViews?: boolean; includePrivate?: boolean }) {
    const ad = await db.advertisement.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        status: { not: 'deleted' },
      },
      include: {
        media: { orderBy: { order: 'asc' } },
        plan: true,
        owner: { select: ownerSelect },
        payments: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });
    if (!ad) throw new AppError('Advertisement not found', 404);

    if (!opts?.includePrivate && !isAdPubliclyVisible(ad)) {
      throw new AppError('Advertisement not found', 404);
    }

    if (opts?.increaseViews && isAdPubliclyVisible(ad)) {
      await db.advertisement.update({
        where: { id: ad.id },
        data: { viewsCount: { increment: 1 } },
      });
      ad.viewsCount += 1;
    }

    return mapAd(ad);
  },

  async list(query: AdvertisementListQuery, opts?: { ownerId?: string; admin?: boolean }) {
    const { page, limit, sortBy, sortOrder, mine, ...filters } = query;
    const skip = (page - 1) * limit;
    const where: Prisma.AdvertisementWhereInput = {
      status: { not: 'deleted' },
    };

    if (opts?.admin) {
      if (filters.status) where.status = filters.status;
    } else if (mine && opts?.ownerId) {
      where.ownerId = opts.ownerId;
      if (filters.status) where.status = filters.status;
    } else {
      where.status = 'published';
      where.paymentStatus = 'paid';
      where.OR = [{ endsAt: null }, { endsAt: { gt: new Date() } }];
      if (filters.status && filters.status !== 'published') {
        // public list ignores non-published status
      }
    }

    if (filters.ownerId && opts?.admin) where.ownerId = filters.ownerId;
    if (filters.category) where.category = filters.category;
    if (filters.city) where.city = { contains: filters.city };
    if (filters.isFeatured !== undefined) where.isFeatured = filters.isFeatured;
    if (filters.shippingAvailable !== undefined) {
      where.shippingAvailable = filters.shippingAvailable;
    }
    if (filters.search) {
      where.AND = [
        ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
        {
          OR: [
            { title: { contains: filters.search } },
            { description: { contains: filters.search } },
            { subcategory: { contains: filters.search } },
            { fabricType: { contains: filters.search } },
          ],
        },
      ];
    }
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
      if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
    }

    const orderBy: Prisma.AdvertisementOrderByWithRelationInput[] = opts?.admin
      ? [{ [sortBy]: sortOrder }]
      : [{ isFeatured: 'desc' }, { [sortBy]: sortOrder }];

    const [rows, total] = await Promise.all([
      db.advertisement.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          media: { orderBy: { order: 'asc' }, take: 3 },
          plan: true,
          owner: { select: ownerSelect },
        },
      }),
      db.advertisement.count({ where }),
    ]);

    // Soft-expire published ads that passed endsAt
    const now = Date.now();
    for (const row of rows) {
      if (row.status === 'published' && row.endsAt && row.endsAt.getTime() < now) {
        await db.advertisement
          .update({ where: { id: row.id }, data: { status: 'expired' } })
          .catch(() => undefined);
        row.status = 'expired';
      }
    }

    return {
      items: rows.map(mapAd),
      pagination: buildPagination(page, limit, total),
    };
  },

  async pay(advertisementId: string, userId: string, input: PayAdvertisementInput) {
    const ad = await db.advertisement.findUnique({
      where: { id: advertisementId },
      include: { plan: true },
    });
    if (!ad || ad.status === 'deleted') throw new AppError('Advertisement not found', 404);
    if (ad.ownerId !== userId) throw new AppError('Forbidden', 403);
    if (!ad.planId || !ad.plan) throw new AppError('Please select a plan first', 400);
    if (ad.paymentStatus === 'paid') throw new AppError('Already paid', 400);

    if (input.method === 'wallet') {
      return db.$transaction(async (tx) => {
        const user = await tx.user.findUnique({ where: { id: userId } });
        if (!user) throw new AppError('User not found', 404);
        if (user.walletBalance < ad.plan!.price) {
          throw new AppError('Insufficient wallet balance', 400);
        }
        const newBalance = user.walletBalance - ad.plan!.price;
        const payment = await tx.payment.create({
          data: {
            userId,
            amount: ad.plan!.price,
            currency: ad.plan!.currency,
            type: 'ad_fee',
            status: 'completed',
            method: 'wallet',
            advertisementId: ad.id,
            description: `Ad fee: ${ad.title}`,
          },
        });
        await tx.walletTransaction.create({
          data: {
            userId,
            type: 'purchase',
            amount: -ad.plan!.price,
            balance: newBalance,
            description: `Advertisement fee: ${ad.title}`,
            referenceId: payment.id,
          },
        });
        await tx.user.update({
          where: { id: userId },
          data: { walletBalance: newBalance },
        });
        const updated = await tx.advertisement.update({
          where: { id: ad.id },
          data: {
            paymentStatus: 'paid',
            status: 'pending_review',
          },
          include: {
            media: { orderBy: { order: 'asc' } },
            plan: true,
            owner: { select: ownerSelect },
          },
        });
        return { advertisement: mapAd(updated), payment, balance: newBalance };
      });
    }

    // bank transfer — pending until admin confirms
    if (!input.proofUrl) {
      throw new AppError('Transfer proof is required', 400);
    }
    const payment = await db.payment.create({
      data: {
        userId,
        amount: ad.plan.price,
        currency: ad.plan.currency,
        type: 'ad_fee',
        status: 'pending',
        method: 'bank_transfer',
        advertisementId: ad.id,
        description: `Ad fee (bank transfer): ${ad.title}`,
        proofUrl: input.proofUrl,
      },
    });
    const updated = await db.advertisement.update({
      where: { id: ad.id },
      data: {
        paymentStatus: 'pending',
        status: 'pending_payment',
      },
      include: {
        media: { orderBy: { order: 'asc' } },
        plan: true,
        owner: { select: ownerSelect },
      },
    });
    return { advertisement: mapAd(updated), payment };
  },

  async confirmBankPayment(paymentId: string, adminId: string) {
    const payment = await db.payment.findUnique({ where: { id: paymentId } });
    if (!payment || payment.type !== 'ad_fee') {
      throw new AppError('Payment not found', 404);
    }
    if (payment.status !== 'pending') {
      throw new AppError('Payment is not pending', 400);
    }
    if (!payment.advertisementId) {
      throw new AppError('Payment has no advertisement', 400);
    }

    return db.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: { status: 'completed' },
      });
      const ad = await tx.advertisement.update({
        where: { id: payment.advertisementId! },
        data: {
          paymentStatus: 'paid',
          status: 'pending_review',
        },
        include: {
          media: { orderBy: { order: 'asc' } },
          plan: true,
          owner: { select: ownerSelect },
        },
      });
      return { payment: updatedPayment, advertisement: mapAd(ad), confirmedBy: adminId };
    });
  },

  async approve(id: string, adminId: string) {
    const ad = await db.advertisement.findUnique({
      where: { id },
      include: { plan: true },
    });
    if (!ad) throw new AppError('Advertisement not found', 404);
    if (ad.paymentStatus !== 'paid') {
      throw new AppError('Advertisement is not paid yet', 400);
    }
    const days = ad.plan?.durationDays || 30;
    const startsAt = new Date();
    const endsAt = new Date(Date.now() + days * 86400000);
    const updated = await db.advertisement.update({
      where: { id },
      data: {
        status: 'published',
        startsAt,
        endsAt,
        publishedAt: startsAt,
        reviewedAt: startsAt,
        reviewedBy: adminId,
        rejectedReason: null,
        isFeatured: ad.plan?.isFeatured || ad.isFeatured,
      },
      include: {
        media: { orderBy: { order: 'asc' } },
        plan: true,
        owner: { select: ownerSelect },
      },
    });
    return mapAd(updated);
  },

  async reject(id: string, adminId: string, reason?: string | null) {
    const updated = await db.advertisement.update({
      where: { id },
      data: {
        status: 'rejected',
        rejectedReason: reason || 'Rejected by admin',
        reviewedAt: new Date(),
        reviewedBy: adminId,
      },
      include: {
        media: { orderBy: { order: 'asc' } },
        plan: true,
        owner: { select: ownerSelect },
      },
    });
    return mapAd(updated);
  },

  async softDelete(id: string, actorId: string, isAdmin = false) {
    const ad = await db.advertisement.findUnique({ where: { id } });
    if (!ad || ad.status === 'deleted') throw new AppError('Advertisement not found', 404);
    if (!isAdmin && ad.ownerId !== actorId) throw new AppError('Forbidden', 403);
    return db.advertisement.update({
      where: { id },
      data: { status: 'deleted' },
    });
  },

  async adminUpdate(id: string, data: Record<string, unknown>) {
    const existing = await db.advertisement.findUnique({ where: { id } });
    if (!existing) throw new AppError('Advertisement not found', 404);

    const updateData: Prisma.AdvertisementUpdateInput = {};
    const assignable = [
      'title',
      'description',
      'category',
      'subcategory',
      'fabricType',
      'quantity',
      'price',
      'currency',
      'discountPercent',
      'shippingInfo',
      'shippingAvailable',
      'phone',
      'whatsapp',
      'city',
      'country',
      'status',
      'isFeatured',
      'rejectedReason',
    ] as const;

    for (const key of assignable) {
      if (data[key] !== undefined) {
        (updateData as any)[key] = data[key];
      }
    }
    if (data.colors !== undefined) {
      updateData.colors = JSON.stringify(data.colors);
    }
    if (data.sizes !== undefined) {
      updateData.sizes = JSON.stringify(data.sizes);
    }
    if (data.startsAt !== undefined) {
      updateData.startsAt = data.startsAt ? new Date(String(data.startsAt)) : null;
    }
    if (data.endsAt !== undefined) {
      updateData.endsAt = data.endsAt ? new Date(String(data.endsAt)) : null;
    }

    const ad = await db.advertisement.update({
      where: { id },
      data: updateData,
      include: {
        media: { orderBy: { order: 'asc' } },
        plan: true,
        owner: { select: ownerSelect },
        payments: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });
    return mapAd(ad);
  },

  async getStats() {
    const [total, published, pendingReview, pendingPayment, rejected, expired] =
      await Promise.all([
        db.advertisement.count({ where: { status: { not: 'deleted' } } }),
        db.advertisement.count({ where: { status: 'published' } }),
        db.advertisement.count({ where: { status: 'pending_review' } }),
        db.advertisement.count({
          where: { status: 'pending_payment', paymentStatus: 'pending' },
        }),
        db.advertisement.count({ where: { status: 'rejected' } }),
        db.advertisement.count({ where: { status: 'expired' } }),
      ]);
    return { total, published, pendingReview, pendingPayment, rejected, expired };
  },
};
