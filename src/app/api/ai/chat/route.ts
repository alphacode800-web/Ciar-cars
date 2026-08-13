import { createHandler } from '@/lib/api-handler';
import { apiError, apiSuccess } from '@/lib/api-response';
import { aiChatSchema } from '@/validators/ai.schema';
import { checkAiRateLimit } from '@/lib/ai/rate-limit';
import { aiChatReply, aiChatGuestReply } from '@/services/ai/chatbot.service';

export const POST = createHandler(
  async (req, { user, body }) => {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'anon';
    const limit = checkAiRateLimit(user ? `chat:${user.id}` : `chat:ip:${ip}`);
    if (!limit.ok) {
      return apiError(`Too many AI requests. Retry in ${limit.retryAfterSec}s`, 429);
    }
    try {
      if (user) {
        const data = await aiChatReply({
          userId: user.id,
          message: body!.message,
          roomId: body!.roomId,
          locale: body!.locale || 'ar',
        });
        return apiSuccess(data);
      }
      // Guests can use the assistant without an account (stateless)
      const data = await aiChatGuestReply({
        message: body!.message,
        locale: body!.locale || 'ar',
        history: body!.history,
      });
      return apiSuccess(data);
    } catch (err) {
      return apiError(err instanceof Error ? err.message : 'AI chat failed', 400);
    }
  },
  { auth: 'public', bodySchema: aiChatSchema }
);
