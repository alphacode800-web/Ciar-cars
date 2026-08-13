'use client';

import { useCallback, useState } from 'react';

export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function useAiChat() {
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [roomId, setRoomId] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(
    async (text: string, locale = 'ar') => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userMsg: AiChatMessage = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: trimmed,
      };
      // Recent turns are sent so guests (no persisted room) keep conversation context
      const history = messages.slice(-8).map((m) => ({ role: m.role, content: m.content }));
      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: trimmed, roomId, locale, history }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || 'AI chat failed');
        }
        if (json.data?.roomId) setRoomId(json.data.roomId);
        setMessages((prev) => [
          ...prev,
          {
            id: json.data.messageId || `a-${Date.now()}`,
            role: 'assistant',
            content: json.data.reply,
          },
        ]);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'AI chat failed';
        setError(msg);
        setMessages((prev) => [
          ...prev,
          {
            id: `e-${Date.now()}`,
            role: 'assistant',
            content:
              locale === 'ar'
                ? 'تعذّر الرد حاليًا. حاول مجددًا لاحقًا أو تواصل مع الدعم.'
                : 'Could not reply right now. Please try again later or contact support.',
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, roomId, messages]
  );

  const reset = useCallback(() => {
    setMessages([]);
    setRoomId(undefined);
    setError(null);
  }, []);

  return { messages, loading, error, send, reset, roomId };
}
