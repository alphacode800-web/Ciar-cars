import { createHandler } from '@/lib/api-handler';
import { apiSuccess } from '@/lib/api-response';
import { statsService } from '@/services/stats.service';

export const GET = createHandler(async () => {
  const data = await statsService.getAdminStats();
  return apiSuccess(data);
}, { auth: 'admin' });
