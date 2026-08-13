'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import { getChatRooms } from '@/lib/admin-api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { AdminPageHeader } from '@/components/admin/layout/admin-ui';
import { useAdminTranslation } from '@/hooks/use-admin-translation';

export default function ChatAdminSection() {
  const { t } = useAdminTranslation();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getChatRooms({ limit: 40 });
    if (res.success) setItems(res.data || []);
    else toast.error(res.error || t('chatAdmin.loadError'));
    setLoading(false);
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t('chatAdmin.title')}
        subtitle={t('chatAdmin.subtitle')}
        actions={
          <Button variant="outline" size="sm" onClick={() => void load()}>
            <RefreshCcw className="w-4 h-4 mr-1" /> {t('common.refresh')}
          </Button>
        }
      />
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : items.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">{t('chatAdmin.empty')}</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {items.map((room) => (
            <Card key={room.id}>
              <CardContent className="p-4 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">
                    {(room.participants || []).map((p: any) => p.user?.name || p.user?.email).filter(Boolean).join(' · ') || room.id}
                  </p>
                  <Badge variant="secondary">{room._count?.messages ?? 0} {t('chatAdmin.messages')}</Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {room.messages?.[0]?.content || room.lastMessage || 'No messages'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
