'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Bot, RefreshCcw, Save, Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import {
  getAiAdminSettings,
  saveAiAdminSettings,
  generateMarketingAi,
  getAiInsights,
} from '@/lib/admin-api';
import { useAdminTranslation } from '@/hooks/use-admin-translation';
import { AdminPageHeader } from '@/components/admin/layout/admin-ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

type AiConfig = {
  enabled: boolean;
  model?: string;
  enableChatbot: boolean;
  enableRecommendations: boolean;
  enableSentiment: boolean;
  enableSeo: boolean;
  enableInsights: boolean;
  enablePaymentRisk: boolean;
  enableMarketing: boolean;
  chatbotSystemPrompt?: string;
  seoSystemPrompt?: string;
  sentimentSystemPrompt?: string;
};

export default function AiSuiteSection() {
  const { t } = useAdminTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<AiConfig | null>(null);
  const [health, setHealth] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [marketing, setMarketing] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await getAiAdminSettings();
      if (res.success && res.data) {
        setConfig(res.data.config);
        setHealth(res.data.health);
        setStats(res.data.stats);
      } else {
        setLoadError(res.error || t('aiSuite.loadError'));
        toast.error(res.error || t('aiSuite.loadError'));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('aiSuite.loadError');
      setLoadError(msg);
      toast.error(msg);
    }
    setLoading(false);
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    if (!config) return;
    setSaving(true);
    const res = await saveAiAdminSettings(config);
    setSaving(false);
    if (res.success) {
      toast.success(t('aiSuite.saved'));
      setConfig(res.data);
    } else toast.error(res.error || t('aiSuite.saveError'));
  };

  const runMarketing = async () => {
    setBusy('marketing');
    const res = await generateMarketingAi({ locale: 'ar' });
    setBusy(null);
    if (res.success) {
      setMarketing(res.data);
      toast.success(t('aiSuite.marketingReady'));
    } else toast.error(res.error || t('aiSuite.error'));
  };

  const runInsights = async () => {
    setBusy('insights');
    const res = await getAiInsights({ kind: 'inventory_demand' });
    setBusy(null);
    if (res.success) {
      setInsights(res.data);
      toast.success(t('aiSuite.insightsReady'));
    } else toast.error(res.error || t('aiSuite.error'));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title={t('aiSuite.title')} subtitle={t('aiSuite.subtitle')} />
        <Card>
          <CardContent className="p-6 flex flex-col items-center gap-3 text-center">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
            <p className="text-sm text-muted-foreground">
              {loadError || t('aiSuite.loadError')}
            </p>
            <Button variant="outline" size="sm" onClick={() => void load()}>
              <RefreshCcw className="w-4 h-4 me-1" /> {t('common.refresh')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const featureToggle = (
    key: keyof AiConfig,
    label: string,
    desc: string
  ) => (
    <div className="flex items-center justify-between gap-4 py-3 border-b last:border-0">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch
        checked={Boolean(config[key])}
        onCheckedChange={(v) => setConfig((c) => (c ? { ...c, [key]: v } : c))}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t('aiSuite.title')}
        subtitle={t('aiSuite.subtitle')}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => void load()}>
              <RefreshCcw className="w-4 h-4 me-1" /> {t('common.refresh')}
            </Button>
            <Button size="sm" onClick={() => void save()} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 me-1 animate-spin" /> : <Save className="w-4 h-4 me-1" />}
              {t('common.save')}
            </Button>
          </div>
        }
      />

      <div className="grid sm:grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">{t('aiSuite.connection')}</p>
            <div className="flex items-center gap-2">
              <Badge variant={health?.ok ? 'default' : 'destructive'}>
                {health?.ok ? t('aiSuite.online') : t('aiSuite.offline')}
              </Badge>
              <span className="text-sm truncate">{health?.model}</span>
            </div>
            {health?.error && (
              <p className="text-xs text-amber-600 mt-2 flex items-start gap-1">
                <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                {health.error}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">{t('aiSuite.avgLatency')}</p>
            <p className="text-2xl font-bold">{stats?.avgDurationMs || 0}ms</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">{t('aiSuite.requests')}</p>
            <p className="text-sm">
              {t('aiSuite.success')}: {stats?.byStatus?.success || 0} · {t('aiSuite.errors')}:{' '}
              {(stats?.byStatus?.error || 0) + (stats?.byStatus?.fallback || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="features" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="features">{t('aiSuite.tabFeatures')}</TabsTrigger>
          <TabsTrigger value="prompts">{t('aiSuite.tabPrompts')}</TabsTrigger>
          <TabsTrigger value="tools">{t('aiSuite.tabTools')}</TabsTrigger>
          <TabsTrigger value="monitor">{t('aiSuite.tabMonitor')}</TabsTrigger>
        </TabsList>

        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Bot className="w-4 h-4" /> {t('aiSuite.featuresTitle')}
              </CardTitle>
              <CardDescription>{t('aiSuite.featuresDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between gap-4 py-3 border-b">
                <div>
                  <p className="text-sm font-medium">{t('aiSuite.master')}</p>
                  <p className="text-xs text-muted-foreground">{t('aiSuite.masterDesc')}</p>
                </div>
                <Switch
                  checked={config.enabled}
                  onCheckedChange={(v) => setConfig((c) => (c ? { ...c, enabled: v } : c))}
                />
              </div>
              <div className="space-y-2 py-2">
                <Label>{t('aiSuite.model')}</Label>
                <Input
                  value={config.model || ''}
                  onChange={(e) => setConfig((c) => (c ? { ...c, model: e.target.value } : c))}
                  placeholder="qwen2.5:7b"
                />
              </div>
              {featureToggle('enableChatbot', t('aiSuite.fChat'), t('aiSuite.fChatDesc'))}
              {featureToggle('enableRecommendations', t('aiSuite.fRec'), t('aiSuite.fRecDesc'))}
              {featureToggle('enableSentiment', t('aiSuite.fSent'), t('aiSuite.fSentDesc'))}
              {featureToggle('enableSeo', t('aiSuite.fSeo'), t('aiSuite.fSeoDesc'))}
              {featureToggle('enableInsights', t('aiSuite.fIns'), t('aiSuite.fInsDesc'))}
              {featureToggle('enablePaymentRisk', t('aiSuite.fRisk'), t('aiSuite.fRiskDesc'))}
              {featureToggle('enableMarketing', t('aiSuite.fMkt'), t('aiSuite.fMktDesc'))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prompts">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label>{t('aiSuite.promptChat')}</Label>
                <Textarea
                  className="min-h-[120px] text-sm"
                  value={config.chatbotSystemPrompt || ''}
                  onChange={(e) =>
                    setConfig((c) => (c ? { ...c, chatbotSystemPrompt: e.target.value } : c))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t('aiSuite.promptSeo')}</Label>
                <Textarea
                  className="min-h-[100px] text-sm"
                  value={config.seoSystemPrompt || ''}
                  onChange={(e) =>
                    setConfig((c) => (c ? { ...c, seoSystemPrompt: e.target.value } : c))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t('aiSuite.promptSent')}</Label>
                <Textarea
                  className="min-h-[100px] text-sm"
                  value={config.sentimentSystemPrompt || ''}
                  onChange={(e) =>
                    setConfig((c) => (c ? { ...c, sentimentSystemPrompt: e.target.value } : c))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> {t('aiSuite.toolsTitle')}
              </CardTitle>
              <CardDescription>{t('aiSuite.toolsDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button onClick={() => void runInsights()} disabled={busy === 'insights'}>
                {busy === 'insights' && <Loader2 className="w-4 h-4 me-1 animate-spin" />}
                {t('aiSuite.runInsights')}
              </Button>
              <Button variant="outline" onClick={() => void runMarketing()} disabled={busy === 'marketing'}>
                {busy === 'marketing' && <Loader2 className="w-4 h-4 me-1 animate-spin" />}
                {t('aiSuite.runMarketing')}
              </Button>
            </CardContent>
          </Card>

          {insights && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{insights.narrative?.headlineAr}</CardTitle>
                <CardDescription>
                  {t('aiSuite.source')}: {insights.source}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <ul className="list-disc ps-5 space-y-1">
                  {(insights.narrative?.bulletsAr || []).map((b: string, i: number) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground mt-2">
                  {t('aiSuite.statsHint')}: {insights.stats?.totalActive} /{' '}
                  {insights.stats?.staleListings?.length || 0}
                </p>
              </CardContent>
            </Card>
          )}

          {marketing && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{marketing.headlineAr}</CardTitle>
                <CardDescription>{marketing.audienceAr}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>{marketing.bodyAr}</p>
                <Badge>{marketing.ctaAr}</Badge>
                <p className="text-xs text-muted-foreground">{t('aiSuite.draftOnly')}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="monitor">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('aiSuite.recent')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(stats?.recent || []).length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('aiSuite.noLogs')}</p>
              ) : (
                (stats.recent as any[]).map((row) => (
                  <div
                    key={row.id}
                    className="flex items-center justify-between gap-2 text-xs border rounded-lg p-2"
                  >
                    <span className="font-medium">{row.kind}</span>
                    <Badge variant={row.status === 'success' ? 'default' : 'secondary'}>
                      {row.status}
                    </Badge>
                    <span className="text-muted-foreground">{row.durationMs ?? '—'}ms</span>
                    <span className="text-muted-foreground truncate max-w-[140px]">
                      {row.model || '—'}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
