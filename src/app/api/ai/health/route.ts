import { createHandler } from '@/lib/api-handler';
import { apiSuccess } from '@/lib/api-response';
import { ollamaHealth } from '@/lib/ai/ollama-client';
import { getAiSuiteConfig } from '@/services/ai/ai-config.service';
import { logAiInteraction } from '@/services/ai/ai-log.service';

export const GET = createHandler(async (_req, { user }) => {
  const [health, config] = await Promise.all([ollamaHealth(), getAiSuiteConfig()]);
  await logAiInteraction({
    kind: 'health',
    userId: user?.id,
    status: health.ok ? 'success' : 'error',
    error: health.error,
    meta: { models: health.models?.length },
  });
  return apiSuccess({
    ...health,
    config: {
      enabled: config.enabled,
      model: config.model,
      features: {
        chatbot: config.enableChatbot,
        recommendations: config.enableRecommendations,
        sentiment: config.enableSentiment,
        seo: config.enableSeo,
        insights: config.enableInsights,
        paymentRisk: config.enablePaymentRisk,
        marketing: config.enableMarketing,
      },
    },
  });
}, { auth: 'public' });
