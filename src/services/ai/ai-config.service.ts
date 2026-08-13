import { db } from '@/lib/db';
import {
  DEFAULT_CHATBOT_SYSTEM,
  SEO_SYSTEM,
  SENTIMENT_SYSTEM,
} from '@/lib/ai/prompts';
import {
  aiSuiteConfigSchema,
  type AiSuiteConfig,
} from '@/validators/ai.schema';

export const AI_SUITE_SETTING_KEY = 'ai_suite_config';

const DEFAULT_CONFIG: AiSuiteConfig = {
  enabled: true,
  model: process.env.OLLAMA_MODEL || 'qwen2.5:7b',
  enableChatbot: true,
  enableRecommendations: true,
  enableSentiment: true,
  enableSeo: true,
  enableInsights: true,
  enablePaymentRisk: true,
  enableMarketing: true,
  chatbotSystemPrompt: DEFAULT_CHATBOT_SYSTEM,
  seoSystemPrompt: SEO_SYSTEM,
  sentimentSystemPrompt: SENTIMENT_SYSTEM,
};

export async function getAiSuiteConfig(): Promise<AiSuiteConfig> {
  try {
    const row = await db.siteSetting.findUnique({
      where: { key: AI_SUITE_SETTING_KEY },
    });
    if (!row?.value) return { ...DEFAULT_CONFIG };
    const parsed = JSON.parse(row.value);
    return aiSuiteConfigSchema.parse({ ...DEFAULT_CONFIG, ...parsed });
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export async function saveAiSuiteConfig(
  patch: Partial<AiSuiteConfig>
): Promise<AiSuiteConfig> {
  const current = await getAiSuiteConfig();
  const next = aiSuiteConfigSchema.parse({ ...current, ...patch });
  await db.siteSetting.upsert({
    where: { key: AI_SUITE_SETTING_KEY },
    create: {
      key: AI_SUITE_SETTING_KEY,
      value: JSON.stringify(next),
      type: 'json',
    },
    update: {
      value: JSON.stringify(next),
      type: 'json',
    },
  });
  return next;
}

export function assertFeatureEnabled(
  config: AiSuiteConfig,
  feature: keyof AiSuiteConfig
): void {
  if (!config.enabled) {
    throw new Error('AI suite is disabled in settings');
  }
  if (feature !== 'enabled' && feature !== 'model' && config[feature] === false) {
    throw new Error(`AI feature disabled: ${String(feature)}`);
  }
}
