import { createHandler } from '@/lib/api-handler';
import { apiSuccess } from '@/lib/api-response';
import { aiSuiteConfigSchema } from '@/validators/ai.schema';
import {
  getAiSuiteConfig,
  saveAiSuiteConfig,
} from '@/services/ai/ai-config.service';
import { getAiInteractionStats } from '@/services/ai/ai-log.service';
import { ollamaHealth } from '@/lib/ai/ollama-client';
import { auditService } from '@/services/audit.service';

export const GET = createHandler(async (_req, { user }) => {
  const [config, health, stats] = await Promise.all([
    getAiSuiteConfig(),
    ollamaHealth(),
    getAiInteractionStats(40),
  ]);
  return apiSuccess({ config, health, stats, adminId: user?.id });
}, { auth: 'admin' });

export const PUT = createHandler(
  async (_req, { user, body }) => {
    const patch = body || {};
    const config = await saveAiSuiteConfig(patch);
    await auditService.log({
      userId: user!.id,
      action: 'ai.settings.update',
      entity: 'SiteSetting',
      entityId: 'ai_suite_config',
      details: { keys: Object.keys(patch) },
    });
    return apiSuccess(config, { message: 'AI settings saved' });
  },
  { auth: 'admin', bodySchema: aiSuiteConfigSchema.partial() }
);
