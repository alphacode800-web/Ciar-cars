import { createHandler } from '@/lib/api-handler';
import { apiSuccess } from '@/lib/api-response';
import { dashboardService } from '@/services/dashboard.service';

export const GET = createHandler(async (_req, { user }) => {
  const data = await dashboardService.getUserDashboard(user!);
  return apiSuccess(data);
}, { auth: 'user' });
