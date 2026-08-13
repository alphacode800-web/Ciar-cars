import { createHandler } from '@/lib/api-handler';
import { apiSuccess } from '@/lib/api-response';
import { AppError } from '@/lib/errors';
import { advertisementService } from '@/services/advertisement.service';
import { auditService } from '@/services/audit.service';
import { updateAdvertisementSchema } from '@/validators/advertisement.schema';

export const GET = createHandler(
  async (_req, { user, params }) => {
    const id = params.id;
    let ad;
    try {
      ad = await advertisementService.getById(id, {
        increaseViews: true,
        includePrivate: false,
      });
    } catch {
      // Allow owner/admin to see private ads
      ad = await advertisementService.getById(id, { includePrivate: true });
      const isOwner = user?.id === ad.ownerId;
      const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
      if (!isOwner && !isAdmin) {
        throw new AppError('Advertisement not found', 404);
      }
    }
    return apiSuccess(ad);
  },
  { auth: 'public' }
);

export const PUT = createHandler(
  async (req, { user, params, body }) => {
    const isAdmin = user!.role === 'admin' || user!.role === 'super_admin';
    const ad = await advertisementService.update(params.id, user!.id, body!, isAdmin);
    await auditService
      .log({
        userId: user!.id,
        action: 'advertisement.update',
        entity: 'Advertisement',
        entityId: ad.id,
        details: { status: ad.status },
        ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
        userAgent: req.headers.get('user-agent') ?? undefined,
      })
      .catch(() => undefined);
    return apiSuccess(ad, { message: 'Advertisement updated' });
  },
  { auth: 'user', bodySchema: updateAdvertisementSchema }
);

export const DELETE = createHandler(
  async (req, { user, params }) => {
    const isAdmin = user!.role === 'admin' || user!.role === 'super_admin';
    await advertisementService.softDelete(params.id, user!.id, isAdmin);
    await auditService
      .log({
        userId: user!.id,
        action: 'advertisement.delete',
        entity: 'Advertisement',
        entityId: params.id,
        ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
        userAgent: req.headers.get('user-agent') ?? undefined,
      })
      .catch(() => undefined);
    return apiSuccess({ id: params.id }, { message: 'Advertisement deleted' });
  },
  { auth: 'user' }
);
