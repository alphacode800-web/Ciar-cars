import { db } from '@/lib/db';
import { ollamaChatJson, OllamaUnavailableError } from '@/lib/ai/ollama-client';
import { SEO_SYSTEM } from '@/lib/ai/prompts';
import { seoResultSchema } from '@/validators/ai.schema';
import { getAiSuiteConfig, assertFeatureEnabled } from './ai-config.service';
import { logAiInteraction } from './ai-log.service';

export async function generateSeoDraft(input: {
  target: 'page' | 'section' | 'car' | 'homepage';
  id?: string;
  locale?: string;
  title?: string;
  subtitle?: string;
  contentHint?: string;
  userId?: string;
}) {
  const config = await getAiSuiteConfig();
  assertFeatureEnabled(config, 'enableSeo');

  let sourceTitle = input.title || '';
  let sourceSubtitle = input.subtitle || '';
  let sourceBody = input.contentHint || '';

  if (input.target === 'page' && input.id) {
    const page = await db.pageContent.findFirst({
      where: { OR: [{ id: input.id }, { slug: input.id }] },
    });
    if (page) {
      sourceTitle = sourceTitle || page.title || page.slug;
      sourceSubtitle = sourceSubtitle || page.seoDescription || '';
      sourceBody = sourceBody || (typeof page.content === 'string' ? page.content.slice(0, 1500) : '');
    }
  }

  if (input.target === 'car' && input.id) {
    const car = await db.car.findUnique({ where: { id: input.id } });
    if (car) {
      sourceTitle = sourceTitle || car.title;
      sourceSubtitle = sourceSubtitle || `${car.brand} ${car.model} ${car.year}`;
      sourceBody = sourceBody || car.description || '';
    }
  }

  if (input.target === 'section' && input.id) {
    const section = await db.homepageSection.findUnique({ where: { id: input.id } });
    if (section) {
      sourceTitle = sourceTitle || section.title || section.type;
      sourceSubtitle = sourceSubtitle || section.subtitle || '';
      sourceBody = sourceBody || section.content || '';
    }
  }

  if (input.target === 'homepage') {
    sourceTitle = sourceTitle || 'CIAR Cars — الصفحة الرئيسية';
    sourceSubtitle = sourceSubtitle || 'سوق السيارات للشراء والتأجير';
  }

  const fallback = {
    seoTitle: (sourceTitle || 'CIAR Cars').slice(0, 60),
    seoDescription: (sourceSubtitle || sourceBody || 'اكتشف سيارات مميزة للشراء والتأجير على CIAR Cars').slice(
      0,
      160
    ),
    keywords: ['سيارات', 'شراء سيارة', 'تأجير سيارات', 'CIAR Cars'],
    titleAr: sourceTitle,
    descriptionAr: sourceSubtitle,
    keywordsAr: ['سيارات', 'شراء سيارة', 'تأجير سيارات'],
  };

  try {
    const { data, model, durationMs } = await ollamaChatJson(
      {
        model: config.model,
        messages: [
          { role: 'system', content: config.seoSystemPrompt || SEO_SYSTEM },
          {
            role: 'user',
            content: JSON.stringify({
              locale: input.locale || 'ar',
              target: input.target,
              title: sourceTitle,
              subtitle: sourceSubtitle,
              content: sourceBody.slice(0, 2500),
            }),
          },
        ],
      },
      (raw) => seoResultSchema.parse(raw)
    );

    await logAiInteraction({
      kind: 'seo',
      userId: input.userId,
      model,
      durationMs,
      status: 'success',
      meta: { target: input.target, id: input.id },
    });

    return { ...data, source: 'ai' as const, draftOnly: true as const };
  } catch (err) {
    await logAiInteraction({
      kind: 'seo',
      userId: input.userId,
      status: err instanceof OllamaUnavailableError ? 'fallback' : 'error',
      error: err instanceof Error ? err.message : 'seo failed',
    });
    return { ...fallback, source: 'fallback' as const, draftOnly: true as const };
  }
}
