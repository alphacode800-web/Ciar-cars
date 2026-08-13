'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Trash2, RefreshCcw, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  analyzeReviewsAi,
  deleteReview,
  getReviews,
  getSentimentSummaryAi,
} from '@/lib/admin-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminPageHeader } from '@/components/admin/layout/admin-ui';
import { useAdminTranslation } from '@/hooks/use-admin-translation';

function sentimentBadge(
  label: string | null | undefined,
  t: (k: string) => string
) {
  if (!label) return null;
  const map: Record<string, { text: string; className: string }> = {
    positive: {
      text: t('aiSuite.sentimentPositive'),
      className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    },
    neutral: {
      text: t('aiSuite.sentimentNeutral'),
      className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    },
    negative: {
      text: t('aiSuite.sentimentNegative'),
      className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    },
  };
  const cfg = map[label] || map.neutral;
  return <Badge className={cfg.className}>{cfg.text}</Badge>;
}

export default function ReviewsSection() {
  const { t } = useAdminTranslation();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [search, setSearch] = useState('');
  const [summary, setSummary] = useState<Record<string, number>>({});

  const load = useCallback(async () => {
    setLoading(true);
    const [res, sum] = await Promise.all([
      getReviews({ search: search || undefined, limit: 50 }),
      getSentimentSummaryAi(),
    ]);
    if (res.success) setItems(res.data || []);
    else toast.error(res.error || t('reviews.loadError'));
    if (sum.success) setSummary(sum.data || {});
    setLoading(false);
  }, [search, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const runBatch = async () => {
    setAnalyzing(true);
    const res = await analyzeReviewsAi({ limit: 25 });
    setAnalyzing(false);
    if (res.success) {
      toast.success(`${t('aiSuite.sentimentAnalyze')}: ${res.data?.analyzed ?? 0}`);
      void load();
    } else toast.error(res.error || t('aiSuite.error'));
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t('reviews.title')}
        subtitle={t('reviews.subtitle')}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => void load()}>
              <RefreshCcw className="w-4 h-4 me-1" /> {t('common.refresh')}
            </Button>
            <Button size="sm" onClick={() => void runBatch()} disabled={analyzing}>
              {analyzing ? (
                <Loader2 className="w-4 h-4 me-1 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 me-1" />
              )}
              {t('aiSuite.sentimentAnalyze')}
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap gap-2 text-xs">
        <Badge variant="secondary">
          {t('aiSuite.sentimentPositive')}: {summary.positive || 0}
        </Badge>
        <Badge variant="secondary">
          {t('aiSuite.sentimentNeutral')}: {summary.neutral || 0}
        </Badge>
        <Badge variant="secondary">
          {t('aiSuite.sentimentNegative')}: {summary.negative || 0}
        </Badge>
      </div>

      <Input
        placeholder={t('common.search')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-xs"
      />
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {t('reviews.empty')}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-4 flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">
                      {r.user?.name || 'User'} · {r.car?.title || 'Car'} ·{' '}
                      {'★'.repeat(r.rating || 0)}
                    </p>
                    {sentimentBadge(r.sentimentLabel, t)}
                  </div>
                  <p className="text-sm text-muted-foreground">{r.comment || '—'}</p>
                  {r.sentimentTopics && (
                    <p className="text-[11px] text-muted-foreground">
                      {(() => {
                        try {
                          return (JSON.parse(r.sentimentTopics) as string[]).join(' · ');
                        } catch {
                          return '';
                        }
                      })()}
                    </p>
                  )}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={async () => {
                    if (!confirm(t('reviews.deleteConfirm'))) return;
                    const res = await deleteReview(r.id);
                    if (res.success) {
                      setItems((prev) => prev.filter((x) => x.id !== r.id));
                      toast.success(t('reviews.deleted'));
                    } else toast.error(res.error || 'Failed');
                  }}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
