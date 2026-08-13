import { createHandler } from '@/lib/api-handler';
import { apiSuccess } from '@/lib/api-response';
import { advertisementService } from '@/services/advertisement.service';

export const GET = createHandler(
  async () => {
    const plans = await advertisementService.listPlans(true);
    return apiSuccess(plans);
  },
  { auth: 'public' }
);
