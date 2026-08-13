'use client';

import React, { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { getAiInsights } from '@/lib/admin-api';
import { useAdminTranslation } from '@/hooks/use-admin-translation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function AiInsightsPanel() {
  const { t } = useAdminTranslation();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const run = async () => {
    setLoading(true);
    const res = await getAiInsights({ kind: 'inventory_demand' });
    setLoading(false);
    if (res.success) {
      setData(res.data);
    } else {
      toast.error(res.error || t('aiSuite.error'));
    }
  };

  return (
    <Card className="border-emerald-500/20">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            {t('aiSuite.fIns')}
          </CardTitle>
          <CardDescription>{t('aiSuite.fInsDesc')}</CardDescription>
        </div>
        <Button size="sm" variant="outline" onClick={() => void run()} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('aiSuite.runInsights')}
        </Button>
      </CardHeader>
      {data && (
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <p className="font-semibold">{data.narrative?.headlineAr}</p>
            <Badge variant="secondary">{data.source}</Badge>
          </div>
          <ul className="list-disc ps-5 space-y-1 text-muted-foreground">
            {(data.narrative?.bulletsAr || []).map((b: string, i: number) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
          {(data.narrative?.actionsAr || []).length > 0 && (
            <div>
              <p className="text-xs font-medium mb-1">{t('aiSuite.tabTools')}</p>
              <ul className="list-disc ps-5 space-y-1">
                {data.narrative.actionsAr.map((a: string, i: number) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
