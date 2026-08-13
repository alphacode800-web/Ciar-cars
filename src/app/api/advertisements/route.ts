import { createHandler } from '@/lib/api-handler';
import { apiSuccess } from '@/lib/api-response';
import { advertisementService } from '@/services/advertisement.service';
import { auditService } from '@/services/audit.service';
import {
  advertisementListQuerySchema,
  createAdvertisementSchema,
} from '@/validators/advertisement.schema';

export const GET = createHandler(
  async (req, { user }) => {
    const url = new URL(req.url);
    const raw: Record<string, string> = {};
    url.searchParams.forEach((v, k) => {
      raw[k] = v;
    });
    const query = advertisementListQuerySchema.parse(raw);
    if (query.mine && !user) {
      return apiSuccess([], {
        pagination: { page: 1, limit: query.limit, total: 0, totalPages: 1, hasNext: false, hasPrev: false },
      });
    }
    const data = await advertisementService.list(query, {
      ownerId: user?.id,
      admin: false,
    });
    return apiSuccess(data.items, { pagination: data.pagination });
  },
  { auth: 'public' }
);

export const POST = createHandler(
  async (req, { user, body }) => {
    const ad = await advertisementService.create(user!.id, body!);
    await auditService
      .log({
        userId: user!.id,
        action: 'advertisement.create',
        entity: 'Advertisement',
        entityId: ad.id,
        details: { title: ad.title, status: ad.status },
        ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
        userAgent: req.headers.get('user-agent') ?? undefined,
      })
      .catch(() => undefined);
    return apiSuccess(ad, { status: 201, message: 'Advertisement created' });
  },
  { auth: 'user', bodySchema: createAdvertisementSchema }
);
