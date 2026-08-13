'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Bot, Loader2, MessageCircle, Send, X } from 'lucide-react';
import { useAiChat } from '@/hooks/use-ai-chat';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function AiChatbotWidget() {
  const { t, locale, isRTL } = useTranslation();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const { messages, loading, send } = useAiChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const title = t('aiChatbot.title') === 'aiChatbot.title' ? 'مساعد CIAR' : t('aiChatbot.title');
  const placeholder =
    t('aiChatbot.placeholder') === 'aiChatbot.placeholder'
      ? 'اسأل عن سيارة أو التأجير...'
      : t('aiChatbot.placeholder');
  const greeting =
    t('aiChatbot.greeting') === 'aiChatbot.greeting'
      ? 'مرحبًا! أنا مساعد CIAR Cars. كيف يمكنني مساعدتك؟'
      : t('aiChatbot.greeting');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void send(draft, locale || 'ar');
    setDraft('');
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'fixed z-[55] flex h-14 w-14 items-center justify-center rounded-full',
          'bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30',
          'hover:scale-105 transition-transform',
          'bottom-[calc(4.5rem+env(safe-area-inset-bottom))] md:bottom-6',
          'end-4'
        )}
        aria-label={title}
      >
        {open ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </button>

      {open && (
        <div
          className={cn(
            'fixed z-[55] flex w-[min(100vw-2rem,380px)] flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl',
            'bottom-[calc(12.5rem+env(safe-area-inset-bottom))] md:bottom-36',
            'end-4',
            'h-[min(70vh,520px)]'
          )}
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <div className="flex items-center gap-2 border-b bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-white">
            <MessageCircle className="h-5 w-5" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{title}</p>
              <p className="text-[11px] opacity-90">
                {t('aiChatbot.experimental') === 'aiChatbot.experimental'
                  ? 'مساعد ذكي للمنصة'
                  : t('aiChatbot.experimental')}
              </p>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-3">
            {messages.length === 0 && (
              <div className="rounded-xl bg-muted/60 p-3 text-sm text-muted-foreground">
                {greeting}
              </div>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  'max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap',
                  m.role === 'user'
                    ? 'ms-auto bg-emerald-600 text-white'
                    : 'me-auto bg-muted'
                )}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="me-auto flex items-center gap-2 rounded-2xl bg-muted px-3 py-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ...
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={onSubmit} className="flex gap-2 border-t p-3">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={placeholder}
              disabled={loading}
              className="text-sm"
            />
            <Button type="submit" size="icon" disabled={loading || !draft.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
