import { createHandler } from '@/lib/api-handler';
import { apiSuccess } from '@/lib/api-response';
import { AppError } from '@/lib/errors';
import { advertisementService } from '@/services/advertisement.service';
import { auditService } from '@/services/audit.service';
import {
  adminAdvertisementActionSchema,
  adminUpdateAdvertisementSchema,
} from '@/validators/advertisement.schema';

export const GET = createHandler(
  async (_req, { params }) => {
    const ad = await advertisementService.getById(params.id, { includePrivate: true });
    return apiSuccess(ad);
  },
  { auth: 'admin' }
);

export const PUT = createHandler(
  async (req, { user, params }) => {
    const raw = await req.json();

    if (raw && typeof raw === 'object' && 'action' in raw && raw.action) {
      const actionBody = adminAdvertisementActionSchema.parse(raw);
      let ad;
      switch (actionBody.action) {
        case 'approve':
          ad = await advertisementService.approve(params.id, user!.id);
          break;
        case 'reject':
          ad = await advertisementService.reject(
            params.id,
            user!.id,
            actionBody.rejectedReason
          );
          break;
        case 'pause':
          ad = await advertisementService.adminUpdate(params.id, { status: 'paused' });
          break;
        case 'resume':
          ad = await advertisementService.approve(params.id, user!.id);
          break;
        case 'feature':
          ad = await advertisementService.adminUpdate(params.id, { isFeatured: true });
          break;
        case 'unfeature':
          ad = await advertisementService.adminUpdate(params.id, { isFeatured: false });
          break;
        case 'delete':
          await advertisementService.softDelete(params.id, user!.id, true);
          ad = { id: params.id, status: 'deleted' };
          break;
        default:
          throw new AppError('Unknown action', 400);
      }
      await auditService
        .log({
          userId: user!.id,
          action: `advertisement.${actionBody.action}`,
          entity: 'Advertisement',
          entityId: params.id,
          details: actionBody,
          ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
          userAgent: req.headers.get('user-agent') ?? undefined,
        })
        .catch(() => undefined);
      return apiSuccess(ad);
    }

    const updateBody = adminUpdateAdvertisementSchema.parse(raw);
    const ad = await advertisementService.adminUpdate(params.id, updateBody);
    await auditService
      .log({
        userId: user!.id,
        action: 'advertisement.admin_update',
        entity: 'Advertisement',
        entityId: params.id,
        details: updateBody,
        ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
        userAgent: req.headers.get('user-agent') ?? undefined,
      })
      .catch(() => undefined);
    return apiSuccess(ad);
  },
  { auth: 'admin' }
);

export const DELETE = createHandler(
  async (req, { user, params }) => {
    await advertisementService.softDelete(params.id, user!.id, true);
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
    return apiSuccess({ id: params.id });
  },
  { auth: 'admin' }
);
