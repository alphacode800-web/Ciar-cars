'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Trash2, RefreshCcw, Save } from 'lucide-react';
import { toast } from 'sonner';
import {
  createPaymentMethodItem,
  deletePaymentMethodItem,
  getPaymentMethodItems,
  updatePaymentMethodItem,
  uploadMediaFile,
} from '@/lib/admin-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminPageHeader } from '@/components/admin/layout/admin-ui';
import { useAdminTranslation } from '@/hooks/use-admin-translation';

interface Item {
  id: string;
  name: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
}

export default function PaymentMethodsAdminSection() {
  const { t } = useAdminTranslation();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getPaymentMethodItems();
    if (res.success) setItems(res.data || []);
    else toast.error(res.error || t('paymentMethodsAdmin.loadError'));
    setLoading(false);
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const saveOrder = async () => {
    const res = await updatePaymentMethodItem({
      items: items.map((it, i) => ({ id: it.id, order: i, isActive: it.isActive })),
    });
    if (res.success) toast.success(t('paymentMethodsAdmin.saved'));
    else toast.error(res.error || t('paymentMethodsAdmin.loadError'));
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t('paymentMethodsAdmin.title')}
        subtitle={t('paymentMethodsAdmin.subtitle')}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => void load()}>
              <RefreshCcw className="w-4 h-4 mr-1" /> {t('common.refresh')}
            </Button>
            <Button size="sm" onClick={() => void saveOrder()}>
              <Save className="w-4 h-4 mr-1" /> {t('paymentMethodsAdmin.saveOrder')}
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="p-4 flex flex-wrap gap-2 items-end">
          <Input placeholder={t('paymentMethodsAdmin.name')} value={name} onChange={(e) => setName(e.target.value)} className="max-w-[180px]" />
          <Input placeholder={t('paymentMethodsAdmin.imageUrl')} value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="max-w-sm" />
          <label>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const res = await uploadMediaFile(file, 'payments');
                if (res.success && res.url) {
                  setImageUrl(res.url);
                  toast.success('Uploaded');
                }
              }}
            />
            <Button variant="outline" size="sm" asChild><span>{t('paymentMethodsAdmin.uploadImage')}</span></Button>
          </label>
          <Button
            size="sm"
            onClick={async () => {
              if (!name || !imageUrl) return toast.error('Name and image required');
              const res = await createPaymentMethodItem({ name, imageUrl });
              if (res.success) {
                toast.success('Added');
                setName('');
                setImageUrl('');
                void load();
              } else toast.error(res.error || t('paymentMethodsAdmin.loadError'));
            }}
          >
            <Plus className="w-4 h-4 mr-1" /> {t('paymentMethodsAdmin.add')}
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => (
            <Card key={item.id}>
              <CardContent className="p-3 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.imageUrl} alt={item.name} className="h-10 w-16 object-contain rounded bg-muted" />
                <Input
                  value={item.name}
                  onChange={(e) =>
                    setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, name: e.target.value } : x)))
                  }
                  className="max-w-[200px]"
                />
                <div className="flex items-center gap-2 ms-auto">
                  <Switch
                    checked={item.isActive}
                    onCheckedChange={(v) =>
                      setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, isActive: v } : x)))
                    }
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={index === 0}
                    onClick={() =>
                      setItems((prev) => {
                        const next = [...prev];
                        [next[index - 1], next[index]] = [next[index], next[index - 1]];
                        return next;
                      })
                    }
                  >
                    Up
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={index === items.length - 1}
                    onClick={() =>
                      setItems((prev) => {
                        const next = [...prev];
                        [next[index + 1], next[index]] = [next[index], next[index + 1]];
                        return next;
                      })
                    }
                  >
                    Down
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={async () => {
                      if (!confirm(t('paymentMethodsAdmin.deleteConfirm'))) return;
                      const res = await deletePaymentMethodItem(item.id);
                      if (res.success) {
                        setItems((prev) => prev.filter((x) => x.id !== item.id));
                        toast.success('Deleted');
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
