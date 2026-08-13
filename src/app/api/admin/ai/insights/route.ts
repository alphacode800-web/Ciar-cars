import { createHandler } from '@/lib/api-handler';
import { apiError, apiSuccess } from '@/lib/api-response';
import { aiInsightsSchema } from '@/validators/ai.schema';
import { getAiInsights } from '@/services/ai/insights.service';
import { auditService } from '@/services/audit.service';

export const GET = createHandler(async (req, { user }) => {
  const url = new URL(req.url);
  const parsed = aiInsightsSchema.safeParse({
    kind: url.searchParams.get('kind') || 'inventory_demand',
    country: url.searchParams.get('country') || undefined,
  });
  if (!parsed.success) return apiError('Invalid query', 400);

  try {
    const data = await getAiInsights({
      ...parsed.data,
      userId: user!.id,
    });
    await auditService.log({
      userId: user!.id,
      action: 'ai.insights',
      entity: 'Stats',
      details: { kind: parsed.data.kind },
    });
    return apiSuccess(data);
  } catch (err) {
    return apiError(err instanceof Error ? err.message : 'Insights failed', 400);
  }
}, { auth: 'admin' });
