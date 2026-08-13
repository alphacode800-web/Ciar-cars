import { createHandler } from '@/lib/api-handler';
import { apiError, apiSuccess } from '@/lib/api-response';
import { aiRecommendSchema } from '@/validators/ai.schema';
import { getAiRecommendations } from '@/services/ai/recommend.service';

export const GET = createHandler(async (req, { user }) => {
  const url = new URL(req.url);
  const parsed = aiRecommendSchema.safeParse({
    carId: url.searchParams.get('carId') || undefined,
    limit: url.searchParams.get('limit') || undefined,
    locale: url.searchParams.get('locale') || undefined,
  });
  if (!parsed.success) return apiError('Invalid query', 400);

  try {
    const data = await getAiRecommendations({
      userId: user?.id,
      carId: parsed.data.carId,
      limit: parsed.data.limit,
      locale: parsed.data.locale || 'ar',
    });
    return apiSuccess(data);
  } catch (err) {
    return apiError(err instanceof Error ? err.message : 'Recommendations failed', 400);
  }
}, { auth: 'public' });
