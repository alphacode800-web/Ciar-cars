'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Check,
  Eye,
  Loader2,
  Megaphone,
  Pause,
  RefreshCcw,
  Star,
  Trash2,
  X,
  Plus,
  Banknote,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  advertisementAction,
  confirmAdPayment,
  createAdPlan,
  deleteAdPlan,
  getAdPlansAdmin,
  getAdminAdvertisements,
  updateAdPlan,
} from '@/lib/admin-api';
import { useAdminTranslation } from '@/hooks/use-admin-translation';
import { AdminPageHeader } from '@/components/admin/layout/admin-ui';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700',
  pending_payment: 'bg-yellow-100 text-yellow-800',
  pending_review: 'bg-blue-100 text-blue-800',
  published: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
  paused: 'bg-orange-100 text-orange-800',
  expired: 'bg-gray-100 text-gray-700',
};

export default function AdvertisementsAdminSection() {
  const { t } = useAdminTranslation();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const [plans, setPlans] = useState<any[]>([]);
  const [planForm, setPlanForm] = useState({
    name: '',
    nameAr: '',
    description: '',
    descriptionAr: '',
    price: '50',
    durationDays: '30',
    maxImages: '5',
    allowVideo: false,
    isFeatured: false,
    isActive: true,
    order: '0',
  });
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getAdminAdvertisements({
      page,
      limit: 20,
      status: status !== 'all' ? status : undefined,
      search: search || undefined,
    });
    setLoading(false);
    if (res.success && res.data) {
      setItems(res.data.items || []);
      setStats(res.data.stats || null);
      setTotalPages(res.pagination?.totalPages || 1);
    } else {
      toast.error(res.error || t('ads.loadError'));
    }
  }, [page, status, search, t]);

  const loadPlans = useCallback(async () => {
    const res = await getAdPlansAdmin();
    if (res.success && Array.isArray(res.data)) setPlans(res.data);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void loadPlans();
  }, [loadPlans]);

  const runAction = async (id: string, action: string, rejectedReason?: string) => {
    setBusyId(id);
    const res = await advertisementAction(id, { action, rejectedReason });
    setBusyId(null);
    if (res.success) {
      toast.success(t('ads.actionDone'));
      setDetail(null);
      void load();
    } else {
      toast.error(res.error || t('ads.error'));
    }
  };

  const confirmPayment = async (paymentId: string) => {
    setBusyId(paymentId);
    const res = await confirmAdPayment(paymentId);
    setBusyId(null);
    if (res.success) {
      toast.success(t('ads.paymentConfirmed'));
      setDetail(res.data?.advertisement || null);
      void load();
    } else toast.error(res.error || t('ads.error'));
  };

  const savePlan = async () => {
    const payload = {
      name: planForm.name,
      nameAr: planForm.nameAr || null,
      description: planForm.description || null,
      descriptionAr: planForm.descriptionAr || null,
      price: Number(planForm.price),
      currency: 'EGP',
      durationDays: Number(planForm.durationDays),
      maxImages: Number(planForm.maxImages),
      allowVideo: planForm.allowVideo,
      isFeatured: planForm.isFeatured,
      isActive: planForm.isActive,
      order: Number(planForm.order) || 0,
    };
    const res = editingPlanId
      ? await updateAdPlan(editingPlanId, payload)
      : await createAdPlan(payload);
    if (res.success) {
      toast.success(t('ads.planSaved'));
      setEditingPlanId(null);
      setPlanForm({
        name: '',
        nameAr: '',
        description: '',
        descriptionAr: '',
        price: '50',
        durationDays: '30',
        maxImages: '5',
        allowVideo: false,
        isFeatured: false,
        isActive: true,
        order: '0',
      });
      void loadPlans();
    } else toast.error(res.error || t('ads.error'));
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t('ads.title')}
        subtitle={t('ads.subtitle')}
        actions={
          <Button variant="outline" size="sm" onClick={() => void load()}>
            <RefreshCcw className="me-1 h-4 w-4" />
            {t('common.refresh')}
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          ['total', stats?.total],
          ['published', stats?.published],
          ['pendingReview', stats?.pendingReview],
          ['pendingPayment', stats?.pendingPayment],
          ['rejected', stats?.rejected],
          ['expired', stats?.expired],
        ].map(([key, val]) => (
          <Card key={String(key)}>
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">{t(`ads.stat.${key}`)}</p>
              <p className="text-xl font-bold">{val ?? 0}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">{t('ads.tabList')}</TabsTrigger>
          <TabsTrigger value="plans">{t('ads.tabPlans')}</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Input
              className="max-w-xs"
              placeholder={t('common.search')}
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
            />
            <Select
              value={status}
              onValueChange={(v) => {
                setPage(1);
                setStatus(v);
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                {[
                  'pending_review',
                  'pending_payment',
                  'published',
                  'rejected',
                  'paused',
                  'expired',
                  'draft',
                ].map((s) => (
                  <SelectItem key={s} value={s}>
                    {t(`ads.status.${s}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : items.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                {t('ads.empty')}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {items.map((ad) => (
                <Card key={ad.id}>
                  <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex gap-3 min-w-0">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                        {ad.media?.[0]?.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={ad.media[0].url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Megaphone className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{ad.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {ad.owner?.name || ad.owner?.email} · {ad.category} · {ad.price}{' '}
                          {ad.currency}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <Badge className={STATUS_COLORS[ad.status] || ''}>
                            {t(`ads.status.${ad.status}`)}
                          </Badge>
                          <Badge variant="outline">{t(`ads.pay.${ad.paymentStatus}`)}</Badge>
                          {ad.isFeatured && <Badge variant="secondary">{t('ads.featured')}</Badge>}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Button size="sm" variant="outline" onClick={() => setDetail(ad)}>
                        <Eye className="me-1 h-3.5 w-3.5" />
                        {t('common.view')}
                      </Button>
                      {ad.status === 'pending_review' && (
                        <>
                          <Button
                            size="sm"
                            disabled={busyId === ad.id}
                            onClick={() => void runAction(ad.id, 'approve')}
                          >
                            {busyId === ad.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Check className="me-1 h-3.5 w-3.5" />
                            )}
                            {t('ads.approve')}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setRejectTarget(ad.id);
                              setRejectOpen(true);
                            }}
                          >
                            <X className="me-1 h-3.5 w-3.5" />
                            {t('ads.reject')}
                          </Button>
                        </>
                      )}
                      {ad.status === 'published' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => void runAction(ad.id, 'pause')}
                        >
                          <Pause className="me-1 h-3.5 w-3.5" />
                          {t('ads.pause')}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          void runAction(ad.id, ad.isFeatured ? 'unfeature' : 'feature')
                        }
                      >
                        <Star className="me-1 h-3.5 w-3.5" />
                        {ad.isFeatured ? t('ads.unfeature') : t('ads.feature')}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => setDeleteTarget(ad.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                {t('common.prev')}
              </Button>
              <span className="text-sm text-muted-foreground">
                {page}/{totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                {t('common.next')}
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {editingPlanId ? t('ads.editPlan') : t('ads.addPlan')}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Name</Label>
                <Input
                  value={planForm.name}
                  onChange={(e) => setPlanForm((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>الاسم بالعربي</Label>
                <Input
                  value={planForm.nameAr}
                  onChange={(e) => setPlanForm((p) => ({ ...p, nameAr: e.target.value }))}
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label>{t('ads.descAr')}</Label>
                <Textarea
                  value={planForm.descriptionAr}
                  onChange={(e) =>
                    setPlanForm((p) => ({ ...p, descriptionAr: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>{t('ads.price')}</Label>
                <Input
                  type="number"
                  value={planForm.price}
                  onChange={(e) => setPlanForm((p) => ({ ...p, price: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>{t('ads.days')}</Label>
                <Input
                  type="number"
                  value={planForm.durationDays}
                  onChange={(e) => setPlanForm((p) => ({ ...p, durationDays: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>{t('ads.maxImages')}</Label>
                <Input
                  type="number"
                  value={planForm.maxImages}
                  onChange={(e) => setPlanForm((p) => ({ ...p, maxImages: e.target.value }))}
                />
              </div>
              <div className="flex items-center justify-between rounded-md border px-3">
                <Label>{t('ads.allowVideo')}</Label>
                <Switch
                  checked={planForm.allowVideo}
                  onCheckedChange={(v) => setPlanForm((p) => ({ ...p, allowVideo: v }))}
                />
              </div>
              <div className="flex items-center justify-between rounded-md border px-3">
                <Label>{t('ads.featured')}</Label>
                <Switch
                  checked={planForm.isFeatured}
                  onCheckedChange={(v) => setPlanForm((p) => ({ ...p, isFeatured: v }))}
                />
              </div>
              <div className="sm:col-span-2">
                <Button onClick={() => void savePlan()}>{t('common.save')}</Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            {plans.map((plan) => (
              <Card key={plan.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-2 p-4">
                  <div>
                    <p className="font-medium">
                      {plan.nameAr || plan.name}{' '}
                      {!plan.isActive && <Badge variant="outline">{t('ads.inactive')}</Badge>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {plan.price} {plan.currency} · {plan.durationDays} {t('ads.days')} ·{' '}
                      {plan.maxImages} {t('ads.images')}
                      {plan.allowVideo ? ` · ${t('ads.video')}` : ''}
                      {plan.isFeatured ? ` · ${t('ads.featured')}` : ''}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingPlanId(plan.id);
                        setPlanForm({
                          name: plan.name,
                          nameAr: plan.nameAr || '',
                          description: plan.description || '',
                          descriptionAr: plan.descriptionAr || '',
                          price: String(plan.price),
                          durationDays: String(plan.durationDays),
                          maxImages: String(plan.maxImages),
                          allowVideo: plan.allowVideo,
                          isFeatured: plan.isFeatured,
                          isActive: plan.isActive,
                          order: String(plan.order || 0),
                        });
                      }}
                    >
                      {t('common.edit')}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={async () => {
                        const res = await deleteAdPlan(plan.id);
                        if (res.success) {
                          toast.success(t('ads.planDeleted'));
                          void loadPlans();
                        }
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle>{detail.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {(detail.media || []).map((m: any) =>
                    m.type === 'video' ? (
                      <video key={m.id || m.url} src={m.url} controls className="rounded-md" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={m.id || m.url}
                        src={m.url}
                        alt=""
                        className="aspect-square rounded-md object-cover"
                      />
                    )
                  )}
                </div>
                <p className="whitespace-pre-wrap text-muted-foreground">{detail.description}</p>
                <p>
                  {t('ads.category')}: {detail.category} / {detail.subcategory || '—'}
                </p>
                <p>
                  {t('ads.price')}: {detail.price} {detail.currency} (−{detail.discountPercent || 0}
                  %)
                </p>
                {detail.fabricType && (
                  <p>
                    {t('ads.fabric')}: {detail.fabricType}
                  </p>
                )}
                <p>
                  {t('ads.quantity')}: {detail.quantity ?? '—'}
                </p>
                <p>
                  {t('ads.contact')}: {detail.phone || '—'} / {detail.whatsapp || '—'}
                </p>
                <p>
                  {t('ads.owner')}: {detail.owner?.name} ({detail.owner?.email})
                </p>
                {detail.rejectedReason && (
                  <p className="text-destructive">
                    {t('ads.rejectReason')}: {detail.rejectedReason}
                  </p>
                )}
                {(detail.payments || []).length > 0 && (
                  <div className="space-y-2 rounded-lg border p-3">
                    <p className="font-medium flex items-center gap-1">
                      <Banknote className="h-4 w-4" />
                      {t('ads.payments')}
                    </p>
                    {detail.payments.map((p: any) => (
                      <div
                        key={p.id}
                        className="flex flex-wrap items-center justify-between gap-2 text-xs"
                      >
                        <span>
                          {p.method} · {p.amount} · {p.status}
                        </span>
                        {p.status === 'pending' && p.method === 'bank_transfer' && (
                          <Button
                            size="sm"
                            disabled={busyId === p.id}
                            onClick={() => void confirmPayment(p.id)}
                          >
                            {t('ads.confirmPayment')}
                          </Button>
                        )}
                        {p.proofUrl && (
                          <a
                            href={p.proofUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary underline"
                          >
                            {t('ads.viewProof')}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <DialogFooter className="flex-wrap gap-2">
                {detail.status === 'pending_review' && (
                  <>
                    <Button onClick={() => void runAction(detail.id, 'approve')}>
                      {t('ads.approve')}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setRejectTarget(detail.id);
                        setRejectOpen(true);
                      }}
                    >
                      {t('ads.reject')}
                    </Button>
                  </>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('ads.reject')}</DialogTitle>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder={t('ads.rejectReasonPlaceholder')}
          />
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={() => {
                if (rejectTarget) {
                  void runAction(rejectTarget, 'reject', rejectReason);
                  setRejectOpen(false);
                  setRejectReason('');
                  setRejectTarget(null);
                }
              }}
            >
              {t('ads.confirmReject')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('ads.confirmDelete')}</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) void runAction(deleteTarget, 'delete');
                setDeleteTarget(null);
              }}
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
