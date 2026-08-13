import { createHandler } from '@/lib/api-handler';
import { apiSuccess } from '@/lib/api-response';
import { advertisementService } from '@/services/advertisement.service';
import { advertisementListQuerySchema } from '@/validators/advertisement.schema';

export const GET = createHandler(
  async (req) => {
    const url = new URL(req.url);
    const raw: Record<string, string> = {};
    url.searchParams.forEach((v, k) => {
      raw[k] = v;
    });
    const query = advertisementListQuerySchema.parse(raw);
    const [list, stats] = await Promise.all([
      advertisementService.list(query, { admin: true }),
      advertisementService.getStats(),
    ]);
    return apiSuccess({ items: list.items, stats }, { pagination: list.pagination });
  },
  { auth: 'admin' }
);
