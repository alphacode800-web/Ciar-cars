'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Trash2, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import { deleteContactMessage, getContactMessages, updateContactMessage } from '@/lib/admin-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminPageHeader } from '@/components/admin/layout/admin-ui';
import { useAdminTranslation } from '@/hooks/use-admin-translation';

interface Message {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  status: string;
  createdAt: string;
}

export default function ContactMessagesSection() {
  const { t } = useAdminTranslation();
  const [items, setItems] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getContactMessages({
      status: status === 'all' ? undefined : status,
      search: search || undefined,
      limit: 50,
    });
    if (res.success) setItems(res.data || []);
    else toast.error(res.error || t('contactInbox.loadError'));
    setLoading(false);
  }, [status, search, t]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t('contactInbox.title')}
        subtitle={t('contactInbox.subtitle')}
        actions={
          <Button variant="outline" size="sm" onClick={() => void load()}>
            <RefreshCcw className="w-4 h-4 mr-1" /> {t('common.refresh')}
          </Button>
        }
      />

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder={t('contactInbox.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('contactInbox.all')}</SelectItem>
            <SelectItem value="new">{t('contactInbox.statusNew')}</SelectItem>
            <SelectItem value="read">{t('contactInbox.statusRead')}</SelectItem>
            <SelectItem value="archived">{t('contactInbox.statusArchived')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">{t('contactInbox.empty')}</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {items.map((m) => (
            <Card key={m.id}>
              <CardContent className="p-4 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{m.name} · {m.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.subject || 'No subject'} · {new Date(m.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={m.status === 'new' ? 'default' : 'secondary'}>{m.status}</Badge>
                    <Select
                      value={m.status}
                      onValueChange={async (v) => {
                        const res = await updateContactMessage(m.id, v);
                        if (res.success) {
                          setItems((prev) => prev.map((x) => (x.id === m.id ? { ...x, status: v } : x)));
                          toast.success(t('contactInbox.updated'));
                        } else toast.error(res.error || t('contactInbox.loadError'));
                      }}
                    >
                      <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">{t('contactInbox.statusNew')}</SelectItem>
                        <SelectItem value="read">{t('contactInbox.statusRead')}</SelectItem>
                        <SelectItem value="archived">{t('contactInbox.statusArchived')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={async () => {
                        if (!confirm(t('contactInbox.deleteConfirm'))) return;
                        const res = await deleteContactMessage(m.id);
                        if (res.success) {
                          setItems((prev) => prev.filter((x) => x.id !== m.id));
                          toast.success(t('contactInbox.deleted'));
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm whitespace-pre-wrap">{m.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
