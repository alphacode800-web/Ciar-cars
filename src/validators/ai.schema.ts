import { z } from 'zod';

export const aiChatSchema = z.object({
  message: z.string().min(1).max(2000),
  roomId: z.string().optional(),
  locale: z.string().max(10).optional(),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().max(2000),
      })
    )
    .max(10)
    .optional(),
});

export const aiRecommendSchema = z.object({
  carId: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(12).optional(),
  locale: z.string().max(10).optional(),
});

export const aiSentimentSchema = z.object({
  reviewId: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export const aiSeoSchema = z.object({
  target: z.enum(['page', 'section', 'car', 'homepage']),
  id: z.string().optional(),
  locale: z.string().max(10).optional(),
  title: z.string().max(300).optional(),
  subtitle: z.string().max(500).optional(),
  contentHint: z.string().max(4000).optional(),
});

export const aiInsightsSchema = z.object({
  kind: z.enum(['inventory_demand', 'market', 'overview']).default('inventory_demand'),
  country: z.string().max(80).optional(),
});

export const aiPaymentScoreSchema = z.object({
  paymentId: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(40).optional(),
});

export const aiMarketingSchema = z.object({
  goal: z.string().max(200).optional(),
  locale: z.string().max(10).optional(),
});

export const aiSuiteConfigSchema = z.object({
  enabled: z.boolean().default(true),
  model: z.string().max(80).optional(),
  enableChatbot: z.boolean().default(true),
  enableRecommendations: z.boolean().default(true),
  enableSentiment: z.boolean().default(true),
  enableSeo: z.boolean().default(true),
  enableInsights: z.boolean().default(true),
  enablePaymentRisk: z.boolean().default(true),
  enableMarketing: z.boolean().default(true),
  chatbotSystemPrompt: z.string().max(8000).optional(),
  seoSystemPrompt: z.string().max(8000).optional(),
  sentimentSystemPrompt: z.string().max(8000).optional(),
});

export type AiSuiteConfig = z.infer<typeof aiSuiteConfigSchema>;

export const sentimentResultSchema = z.object({
  label: z.enum(['positive', 'neutral', 'negative']),
  score: z.number().min(-1).max(1),
  confidence: z.number().min(0).max(1).optional().default(0.5),
  topics: z.array(z.string()).optional().default([]),
  summaryAr: z.string().optional().default(''),
});

export const seoResultSchema = z.object({
  seoTitle: z.string(),
  seoDescription: z.string(),
  keywords: z.array(z.string()).optional().default([]),
  titleAr: z.string().optional(),
  descriptionAr: z.string().optional(),
  keywordsAr: z.array(z.string()).optional(),
});

export const recommendResultSchema = z.object({
  ranked: z
    .array(
      z.object({
        id: z.string(),
        reasonAr: z.string().optional().default(''),
      })
    )
    .default([]),
  noteAr: z.string().optional().default(''),
});

export const insightsResultSchema = z.object({
  headlineAr: z.string(),
  bulletsAr: z.array(z.string()).default([]),
  actionsAr: z.array(z.string()).default([]),
  risksAr: z.array(z.string()).default([]),
});

export const riskResultSchema = z.object({
  level: z.enum(['low', 'medium', 'high']),
  score: z.number().min(0).max(1),
  reasonsAr: z.array(z.string()).default([]),
  adviceAr: z.string().optional().default(''),
});

export const marketingResultSchema = z.object({
  audienceAr: z.string(),
  headlineAr: z.string(),
  bodyAr: z.string(),
  ctaAr: z.string(),
  keywords: z.array(z.string()).default([]),
  suggestedCarIds: z.array(z.string()).default([]),
});
