'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCcw, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { adjustWallet, getWalletTransactions } from '@/lib/admin-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminPageHeader } from '@/components/admin/layout/admin-ui';
import { useAdminTranslation } from '@/hooks/use-admin-translation';

export default function WalletsSection() {
  const { t } = useAdminTranslation();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'credit' | 'debit'>('credit');
  const [description, setDescription] = useState('Admin adjustment');

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getWalletTransactions({ limit: 40 });
    if (res.success) setItems(res.data || []);
    else toast.error(res.error || t('wallets.loadError'));
    setLoading(false);
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const submit = async () => {
    const value = Number(amount);
    if (!userId || !Number.isFinite(value) || value <= 0) {
      toast.error(t('wallets.validation'));
      return;
    }
    const res = await adjustWallet({ userId, amount: value, type, description });
    if (res.success) {
      toast.success(t('wallets.updated'));
      setAmount('');
      void load();
    } else toast.error(res.error || 'Failed');
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t('wallets.title')}
        subtitle={t('wallets.subtitle')}
        actions={
          <Button variant="outline" size="sm" onClick={() => void load()}>
            <RefreshCcw className="w-4 h-4 mr-1" /> {t('common.refresh')}
          </Button>
        }
      />

      <Card>
        <CardHeader><CardTitle className="text-base">{t('wallets.adjust')}</CardTitle></CardHeader>
        <CardContent className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="space-y-1"><Label>{t('wallets.userId')}</Label><Input value={userId} onChange={(e) => setUserId(e.target.value)} /></div>
          <div className="space-y-1"><Label>{t('wallets.amount')}</Label><Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
          <div className="space-y-1">
            <Label>{t('wallets.type')}</Label>
            <Select value={type} onValueChange={(v) => setType(v as 'credit' | 'debit')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="credit">{t('wallets.credit')}</SelectItem>
                <SelectItem value="debit">{t('wallets.debit')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1"><Label>{t('wallets.description')}</Label><Input value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div className="flex items-end">
            <Button className="w-full" onClick={() => void submit()}><Plus className="w-4 h-4 mr-1" /> {t('wallets.apply')}</Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : (
        <div className="space-y-2">
          {items.map((tx) => (
            <Card key={tx.id}>
              <CardContent className="p-3 flex justify-between gap-3 text-sm">
                <div>
                  <p className="font-medium">{tx.user?.name || tx.userId} · {tx.type}</p>
                  <p className="text-muted-foreground">{tx.description || '—'}</p>
                </div>
                <div className="text-end">
                  <p className="font-semibold">{tx.amount}</p>
                  <p className="text-xs text-muted-foreground">Bal: {tx.balance}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
