import { db } from '@/lib/db';
import { ollamaChat, OllamaUnavailableError, OllamaTimeoutError } from '@/lib/ai/ollama-client';
import {
  AI_BOT_EMAIL,
  AI_BOT_USER_ID,
  DEFAULT_CHATBOT_SYSTEM,
  buildChatUserPrompt,
} from '@/lib/ai/prompts';
import { getAiSuiteConfig, assertFeatureEnabled } from './ai-config.service';
import { logAiInteraction } from './ai-log.service';
import { localAssistantReply } from './local-assistant.service';

async function ensureAiBotUser() {
  const existing = await db.user.findUnique({ where: { id: AI_BOT_USER_ID } });
  if (existing) return existing;
  try {
    return await db.user.create({
      data: {
        id: AI_BOT_USER_ID,
        email: AI_BOT_EMAIL,
        name: 'مساعد CIAR',
        role: 'user',
        isActive: true,
        bio: 'مساعد الذكاء الاصطناعي التجريبي لمنصة CIAR Cars',
      },
    });
  } catch {
    const byEmail = await db.user.findUnique({ where: { email: AI_BOT_EMAIL } });
    if (byEmail) return byEmail;
    throw new Error('Could not create AI bot user');
  }
}

async function buildPlatformContext(maxCars: number): Promise<string> {
  const [cars, pages, siteName] = await Promise.all([
    db.car.findMany({
      where: { status: 'active' },
      orderBy: [{ isFeatured: 'desc' }, { viewsCount: 'desc' }],
      take: maxCars,
      select: {
        id: true,
        title: true,
        brand: true,
        model: true,
        year: true,
        price: true,
        city: true,
        country: true,
        condition: true,
      },
    }),
    db.pageContent.findMany({
      take: 6,
      select: { slug: true, title: true, seoDescription: true },
    }),
    db.siteSetting.findUnique({ where: { key: 'site_name' } }),
  ]);

  const carLines = cars
    .map(
      (c) =>
        `- ${c.id} | ${c.title} | ${c.brand} ${c.model} ${c.year} | ${c.price} | ${c.city}, ${c.country} | ${c.condition}`
    )
    .join('\n');

  const pageLines = pages
    .map((p) => `- ${p.slug}: ${p.title || ''} ${p.seoDescription || ''}`)
    .join('\n');

  return [
    `Site: ${siteName?.value || 'CIAR Cars'}`,
    'Active cars sample:',
    carLines || '(none)',
    'Pages:',
    pageLines || '(none)',
  ].join('\n');
}

/**
 * Stateless chat reply for guests (no login required).
 * Nothing is persisted; the client sends recent history with each request.
 */
export async function aiChatGuestReply(input: {
  message: string;
  locale?: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
}) {
  const config = await getAiSuiteConfig();
  assertFeatureEnabled(config, 'enableChatbot');

  const locale = input.locale || 'ar';
  const maxCars = Number(process.env.AI_MAX_CONTEXT_CARS) || 12;
  const context = await buildPlatformContext(maxCars);
  const system = config.chatbotSystemPrompt || DEFAULT_CHATBOT_SYSTEM;

  try {
    const result = await ollamaChat({
      model: config.model,
      messages: [
        { role: 'system', content: system },
        {
          role: 'user',
          content: buildChatUserPrompt({
            message: input.message,
            locale,
            context,
            history: (input.history || []).slice(-10),
          }),
        },
      ],
      temperature: 0.4,
    });
    await logAiInteraction({
      kind: 'chat',
      model: result.model,
      durationMs: result.durationMs,
      status: 'success',
    });
    return { reply: result.content, fallback: false };
  } catch (err) {
    const reply = await localAssistantReply({
      message: input.message,
      locale,
    });
    await logAiInteraction({
      kind: 'chat',
      status:
        err instanceof OllamaUnavailableError || err instanceof OllamaTimeoutError
          ? 'fallback'
          : 'error',
      error: err instanceof Error ? err.message : 'chat failed',
    });
    return {
      reply,
      fallback: true,
    };
  }
}

export async function aiChatReply(input: {
  userId: string;
  message: string;
  roomId?: string;
  locale?: string;
}) {
  const config = await getAiSuiteConfig();
  assertFeatureEnabled(config, 'enableChatbot');

  const bot = await ensureAiBotUser();
  const locale = input.locale || 'ar';
  const maxCars = Number(process.env.AI_MAX_CONTEXT_CARS) || 12;

  let roomId = input.roomId;
  if (roomId) {
    const room = await db.chatRoom.findUnique({
      where: { id: roomId },
      include: { participants: true },
    });
    if (!room || !room.participants.some((p) => p.userId === input.userId)) {
      throw new Error('Chat room not found');
    }
  } else {
    const existing = await db.chatRoom.findFirst({
      where: {
        type: 'support',
        isAiAssisted: true,
        participants: { some: { userId: input.userId } },
      },
      orderBy: { updatedAt: 'desc' },
    });
    if (existing) {
      roomId = existing.id;
    } else {
      const room = await db.chatRoom.create({
        data: {
          type: 'support',
          isAiAssisted: true,
          aiLocale: locale,
          lastMessage: input.message.slice(0, 120),
          lastMessageAt: new Date(),
          participants: {
            create: [{ userId: input.userId }, { userId: bot.id }],
          },
        },
      });
      roomId = room.id;
    }
  }

  await db.chatMessage.create({
    data: {
      roomId: roomId!,
      senderId: input.userId,
      receiverId: bot.id,
      content: input.message,
      type: 'text',
    },
  });

  const history = await db.chatMessage.findMany({
    where: { roomId: roomId! },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: { senderId: true, content: true },
  });

  const context = await buildPlatformContext(maxCars);
  const system = config.chatbotSystemPrompt || DEFAULT_CHATBOT_SYSTEM;

  let replyText: string;
  let model: string | null = null;
  let durationMs: number | null = null;
  let status: 'success' | 'error' | 'fallback' = 'success';

  try {
    const result = await ollamaChat({
      model: config.model,
      messages: [
        { role: 'system', content: system },
        {
          role: 'user',
          content: buildChatUserPrompt({
            message: input.message,
            locale,
            context,
            history: history
              .reverse()
              .map((h) => ({
                role: h.senderId === bot.id ? 'assistant' : 'user',
                content: h.content,
              })),
          }),
        },
      ],
      temperature: 0.4,
    });
    replyText = result.content;
    model = result.model;
    durationMs = result.durationMs;
  } catch (err) {
    status =
      err instanceof OllamaUnavailableError || err instanceof OllamaTimeoutError
        ? 'fallback'
        : 'error';
    replyText = await localAssistantReply({
      message: input.message,
      locale,
    });
    await logAiInteraction({
      kind: 'chat',
      userId: input.userId,
      status,
      error: err instanceof Error ? err.message : 'chat failed',
    });
  }

  if (status === 'success') {
    await logAiInteraction({
      kind: 'chat',
      userId: input.userId,
      model,
      durationMs,
      status: 'success',
    });
  }

  const botMsg = await db.chatMessage.create({
    data: {
      roomId: roomId!,
      senderId: bot.id,
      receiverId: input.userId,
      content: replyText,
      type: 'text',
    },
  });

  await db.chatRoom.update({
    where: { id: roomId! },
    data: {
      lastMessage: replyText.slice(0, 120),
      lastMessageAt: new Date(),
    },
  });

  return {
    roomId,
    reply: replyText,
    messageId: botMsg.id,
    fallback: status !== 'success',
  };
}
