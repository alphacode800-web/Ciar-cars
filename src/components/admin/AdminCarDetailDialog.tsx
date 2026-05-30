'use client';

import { useEffect, useState } from 'react';
import {
  Star,
  MapPin,
  Loader2,
  CheckCircle,
  XCircle,
  Trash2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImagePicker } from '@/components/ui/image-picker';
import { CURRENCY } from '@/lib/constants';
import { COUNTRY_NAMES } from '@/lib/countries';
import { useAdminTranslation } from '@/hooks/use-admin-translation';
import { updateCar } from '@/lib/admin-api';
import { toast } from 'sonner';
import type { AdminCarItem } from './AdminCarsGrid';

interface AdminCarDetailDialogProps {
  car: AdminCarItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionLoading: string | null;
  onApprove: (car: AdminCarItem) => void;
  onReject: (car: AdminCarItem) => void;
  onToggleFeatured: (car: AdminCarItem) => void;
  onMarkSold: (car: AdminCarItem) => void;
  onArchive: (car: AdminCarItem) => void;
  onDelete: (car: AdminCarItem) => void;
  onSaved: () => void;
}

function formatPrice(price: number) {
  return `${CURRENCY.symbol}${price.toLocaleString(CURRENCY.locale)}`;
}

export function AdminCarDetailDialog({
  car,
  open,
  onOpenChange,
  actionLoading,
  onApprove,
  onReject,
  onToggleFeatured,
  onMarkSold,
  onArchive,
  onDelete,
  onSaved,
}: AdminCarDetailDialogProps) {
  const { t } = useAdminTranslation();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);

  const [form, setForm] = useState({
    title: '',
    price: '',
    country: '',
    city: '',
    status: 'active',
    description: '',
    isFeatured: false,
    primaryImageUrl: '',
  });

  useEffect(() => {
    if (!car || !open) return;

    setForm({
      title: car.title,
      price: String(car.price),
      country: car.country,
      city: car.city,
      status: car.status,
      description: car.description || '',
      isFeatured: car.isFeatured,
      primaryImageUrl: car.primaryImage || '',
    });

    setLoading(true);
    fetch(`/api/cars/${car.id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setDetail(json.data);
          const d = json.data;
          setForm((prev) => ({
            ...prev,
            description: String(d.description || prev.description),
            primaryImageUrl:
              d.images?.[0]?.url || d.primaryImage || prev.primaryImageUrl,
          }));
        }
      })
      .finally(() => setLoading(false));
  }, [car, open]);

  const handleSave = async () => {
    if (!car) return;
    setSaving(true);
    try {
      const res = await updateCar(car.id, {
        title: form.title,
        price: parseFloat(form.price),
        country: form.country,
        city: form.city,
        status: form.status,
        description: form.description,
        isFeatured: form.isFeatured,
        featuredUntil: form.isFeatured
          ? new Date(Date.now() + 30 * 86400000).toISOString()
          : null,
        primaryImageUrl: form.primaryImageUrl,
      });
      if (res.success) {
        toast.success(t('common.saveChanges'));
        onSaved();
        onOpenChange(false);
      } else {
        toast.error(res.error || 'Error');
      }
    } catch {
      toast.error('Error');
    } finally {
      setSaving(false);
    }
  };

  if (!car) return null;

  const displayImage =
    form.primaryImageUrl ||
    car.primaryImage ||
    `https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=450&fit=crop&seed=${car.id}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            {t('carDialog.editCar')}
            <Badge variant="outline" className="font-normal">
              {car.brand} {car.model} · {car.year}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : (
          <div className="space-y-4">
            <ImagePicker
              label={t('carDialog.primaryImage')}
              value={form.primaryImageUrl}
              onChange={(url) => setForm((f) => ({ ...f, primaryImageUrl: url }))}
              uploadLabel={t('imagePicker.upload')}
              urlLabel={t('imagePicker.url')}
            />

            {!form.primaryImageUrl && (
              <div className="aspect-video rounded-lg overflow-hidden border">
                <img src={displayImage} alt="" className="h-full w-full object-cover" />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <Label>{t('carDialog.carTitle')}</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>{t('carDialog.price')}</Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">{formatPrice(Number(form.price) || 0)}</p>
              </div>
              <div className="space-y-1">
                <Label>{t('carDialog.status')}</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t('cars.active')}</SelectItem>
                    <SelectItem value="pending">{t('cars.pending')}</SelectItem>
                    <SelectItem value="sold">{t('cars.sold')}</SelectItem>
                    <SelectItem value="archived">{t('cars.archived')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>{t('carDialog.country')}</Label>
                <Select
                  value={form.country}
                  onValueChange={(v) => setForm((f) => ({ ...f, country: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[240px]">
                    {COUNTRY_NAMES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>{t('carDialog.city')}</Label>
                <Input
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                />
              </div>
              <div className="sm:col-span-2 flex items-center gap-2 pt-1">
                <Switch
                  checked={form.isFeatured}
                  onCheckedChange={(c) => setForm((f) => ({ ...f, isFeatured: !!c }))}
                />
                <Label>{t('carDialog.featured')}</Label>
              </div>
              <div className="sm:col-span-2 space-y-1">
                <Label>{t('carDialog.description')}</Label>
                <Textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
            </div>

            <div className="rounded-lg border p-3 text-sm space-y-1 bg-muted/30">
              <p className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {car.city}, {car.country}
              </p>
              {detail?.owner && (
                <p>
                  <span className="text-muted-foreground">{t('carDialog.seller')}: </span>
                  {(detail.owner as { name?: string }).name} ·{' '}
                  {(detail.owner as { email?: string }).email}
                </p>
              )}
              <p className="text-muted-foreground">
                {car.viewsCount} {t('common.views')}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t">
              {car.status === 'pending' && (
                <>
                  <Button
                    size="sm"
                    className="gap-1 bg-emerald-600 hover:bg-emerald-700"
                    disabled={actionLoading === car.id}
                    onClick={() => onApprove(car)}
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    {t('cars.approve')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 text-red-600"
                    disabled={actionLoading === car.id}
                    onClick={() => onReject(car)}
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    {t('cars.reject')}
                  </Button>
                </>
              )}
              <Button
                size="sm"
                variant="outline"
                className="gap-1"
                disabled={actionLoading === car.id}
                onClick={() => onToggleFeatured(car)}
              >
                <Star className="h-3.5 w-3.5" />
                {car.isFeatured ? t('cars.unfeature') : t('cars.feature')}
              </Button>
              {car.status === 'active' && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={actionLoading === car.id}
                  onClick={() => onMarkSold(car)}
                >
                  {t('cars.markSold')}
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                disabled={actionLoading === car.id}
                onClick={() => onArchive(car)}
              >
                {t('cars.archive')}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="gap-1 mr-auto"
                disabled={actionLoading === car.id}
                onClick={() => {
                  onDelete(car);
                  onOpenChange(false);
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
                {t('common.delete')}
              </Button>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.close')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || loading}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : t('common.saveChanges')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
