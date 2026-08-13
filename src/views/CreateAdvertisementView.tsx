'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ImagePlus,
  Loader2,
  Megaphone,
  Trash2,
  Upload,
  Video,
  Wallet,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth-store';
import { useAppStore } from '@/store/app-store';
import { useTranslation } from '@/hooks/use-translation';
import {
  createAdvertisement,
  getAdPlans,
  payAdvertisement,
  uploadAdMedia,
} from '@/lib/client-api';
import {
  AD_CATEGORIES,
  CLOTHING_FABRICS,
  CLOTHING_SIZES,
  finalAdPrice,
} from '@/lib/ad-constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

type MediaItem = {
  url: string;
  type: 'image' | 'video';
  mimeType?: string;
  isPrimary?: boolean;
  order?: number;
};

type Plan = {
  id: string;
  name: string;
  nameAr?: string | null;
  description?: string | null;
  descriptionAr?: string | null;
  price: number;
  currency: string;
  durationDays: number;
  maxImages: number;
  allowVideo: boolean;
  isFeatured: boolean;
};

const STEPS = ['basics', 'details', 'media', 'plan'] as const;

export default function CreateAdvertisementView() {
  const { locale } = useTranslation();
  const { user, isAuthenticated } = useAuthStore();
  const { setView } = useAppStore();
  const isAr = locale === 'ar';

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [payMethod, setPayMethod] = useState<'wallet' | 'bank_transfer'>('wallet');
  const [proofUrl, setProofUrl] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'clothing',
    subcategory: '',
    fabricType: '',
    colors: '' as string,
    sizes: [] as string[],
    quantity: '',
    price: '',
    discountPercent: '0',
    shippingAvailable: false,
    shippingInfo: '',
    phone: user?.phone || '',
    whatsapp: '',
    city: user?.city || '',
    country: user?.country || 'Sudan',
    planId: '',
    media: [] as MediaItem[],
  });

  useEffect(() => {
    if (!isAuthenticated) {
      setView('auth');
      return;
    }
    void getAdPlans().then((res) => {
      if (res.success && Array.isArray(res.data)) {
        setPlans(res.data as Plan[]);
        if (res.data.length > 0) {
          setForm((f) => ({ ...f, planId: f.planId || (res.data as Plan[])[0].id }));
        }
      }
    });
  }, [isAuthenticated, setView]);

  const selectedPlan = useMemo(
    () => plans.find((p) => p.id === form.planId) || null,
    [plans, form.planId]
  );

  const previewPrice = useMemo(() => {
    const p = Number(form.price) || 0;
    const d = Number(form.discountPercent) || 0;
    return finalAdPrice(p, d);
  }, [form.price, form.discountPercent]);

  const setField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const toggleSize = (size: string) => {
    setForm((f) => ({
      ...f,
      sizes: f.sizes.includes(size) ? f.sizes.filter((s) => s !== size) : [...f.sizes, size],
    }));
  };

  const handleUpload = async (file: File, kind: 'image' | 'video') => {
    if (kind === 'image' && selectedPlan && form.media.filter((m) => m.type === 'image').length >= selectedPlan.maxImages) {
      toast.error(isAr ? `الحد الأقصى ${selectedPlan.maxImages} صور` : `Max ${selectedPlan.maxImages} images`);
      return;
    }
    if (kind === 'video' && selectedPlan && !selectedPlan.allowVideo) {
      toast.error(isAr ? 'هذه الباقة لا تدعم الفيديو' : 'This plan does not allow video');
      return;
    }
    if (kind === 'video' && form.media.some((m) => m.type === 'video')) {
      toast.error(isAr ? 'يُسمح بفيديو واحد فقط' : 'Only one video allowed');
      return;
    }
    setUploading(true);
    const res = await uploadAdMedia(file, kind);
    setUploading(false);
    if (!res.success || !res.url) {
      toast.error(res.error || (isAr ? 'فشل الرفع' : 'Upload failed'));
      return;
    }
    setForm((f) => ({
      ...f,
      media: [
        ...f.media,
        {
          url: res.url,
          type: kind,
          mimeType: file.type,
          isPrimary: f.media.length === 0,
          order: f.media.length,
        },
      ],
    }));
  };

  const removeMedia = (url: string) => {
    setForm((f) => ({ ...f, media: f.media.filter((m) => m.url !== url) }));
  };

  const validateStep = (index: number): boolean => {
    if (index === 0) {
      if (form.title.trim().length < 3) {
        toast.error(isAr ? 'أدخل عنوانًا صالحًا' : 'Enter a valid title');
        return false;
      }
      if (!form.category) {
        toast.error(isAr ? 'اختر الفئة' : 'Select a category');
        return false;
      }
      return true;
    }
    if (index === 1) {
      if (!Number(form.price) || Number(form.price) <= 0) {
        toast.error(isAr ? 'أدخل سعرًا صحيحًا' : 'Enter a valid price');
        return false;
      }
      return true;
    }
    if (index === 2) {
      if (form.media.length === 0) {
        toast.error(isAr ? 'أضف صورة واحدة على الأقل' : 'Add at least one image');
        return false;
      }
      return true;
    }
    if (index === 3) {
      if (!form.planId) {
        toast.error(isAr ? 'اختر باقة' : 'Select a plan');
        return false;
      }
      return true;
    }
    return true;
  };

  const buildPayload = (submit: boolean) => ({
    title: form.title.trim(),
    description: form.description.trim() || null,
    category: form.category,
    subcategory: form.subcategory.trim() || null,
    fabricType: form.category === 'clothing' ? form.fabricType || null : null,
    colors: form.colors
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean),
    sizes: form.category === 'clothing' ? form.sizes : [],
    quantity: form.quantity ? Number(form.quantity) : null,
    price: Number(form.price),
    currency: 'EGP',
    discountPercent: Number(form.discountPercent) || 0,
    shippingAvailable: form.shippingAvailable,
    shippingInfo: form.shippingInfo.trim() || null,
    phone: form.phone.trim() || null,
    whatsapp: form.whatsapp.trim() || null,
    city: form.city.trim() || null,
    country: form.country.trim() || null,
    planId: form.planId || null,
    media: form.media,
    submit,
  });

  const submitAndPay = useCallback(async () => {
    if (!validateStep(3)) return;
    setSaving(true);
    try {
      let adId = createdId;
      if (!adId) {
        const res = await createAdvertisement(buildPayload(true));
        if (!res.success || !(res.data as any)?.id) {
          toast.error(res.error || (isAr ? 'فشل إنشاء الإعلان' : 'Failed to create ad'));
          setSaving(false);
          return;
        }
        adId = (res.data as any).id as string;
        setCreatedId(adId);
      }

      if (payMethod === 'bank_transfer' && !proofUrl) {
        toast.error(isAr ? 'ارفع إثبات التحويل' : 'Upload transfer proof');
        setSaving(false);
        return;
      }

      const payRes = await payAdvertisement(adId!, {
        method: payMethod,
        proofUrl: payMethod === 'bank_transfer' ? proofUrl : undefined,
      });
      if (!payRes.success) {
        toast.error(payRes.error || (isAr ? 'فشل الدفع' : 'Payment failed'));
        setSaving(false);
        return;
      }

      toast.success(
        payMethod === 'wallet'
          ? isAr
            ? 'تم الدفع وإرسال الإعلان للمراجعة'
            : 'Paid and submitted for review'
          : isAr
            ? 'تم إرسال إثبات التحويل بانتظار التأكيد'
            : 'Transfer proof submitted, awaiting confirmation'
      );
      setView('dashboard');
    } finally {
      setSaving(false);
    }
  }, [createdId, payMethod, proofUrl, form, isAr, setView]);

  const saveDraft = async () => {
    setSaving(true);
    const res = await createAdvertisement(buildPayload(false));
    setSaving(false);
    if (res.success) {
      toast.success(isAr ? 'تم حفظ المسودة' : 'Draft saved');
      setView('dashboard');
    } else {
      toast.error(res.error || (isAr ? 'فشل الحفظ' : 'Save failed'));
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="mb-6 flex items-center gap-3">
        <Megaphone className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">{isAr ? 'إنشاء إعلان' : 'Create Advertisement'}</h1>
          <p className="text-sm text-muted-foreground">
            {isAr
              ? 'أضف منتجك أو خدمتك، ادفع الباقة، وانتظر موافقة الأدمن'
              : 'Add your product or service, pay the plan, and wait for admin approval'}
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {STEPS.map((s, i) => (
          <Badge key={s} variant={i === step ? 'default' : i < step ? 'secondary' : 'outline'}>
            {i < step ? <Check className="me-1 h-3 w-3" /> : null}
            {i + 1}.{' '}
            {isAr
              ? ['الأساسيات', 'التفاصيل', 'الوسائط', 'الباقة والدفع'][i]
              : ['Basics', 'Details', 'Media', 'Plan & Pay'][i]}
          </Badge>
        ))}
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          {step === 0 && (
            <>
              <div className="space-y-2">
                <Label>{isAr ? 'عنوان الإعلان' : 'Title'}</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setField('title', e.target.value)}
                  placeholder={isAr ? 'مثال: فستان قطني صيفي' : 'e.g. Summer cotton dress'}
                />
              </div>
              <div className="space-y-2">
                <Label>{isAr ? 'الوصف' : 'Description'}</Label>
                <Textarea
                  className="min-h-[120px]"
                  value={form.description}
                  onChange={(e) => setField('description', e.target.value)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{isAr ? 'الفئة' : 'Category'}</Label>
                  <Select value={form.category} onValueChange={(v) => setField('category', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AD_CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {isAr ? c.labelAr : c.labelEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{isAr ? 'التصنيف الفرعي' : 'Subcategory'}</Label>
                  <Input
                    value={form.subcategory}
                    onChange={(e) => setField('subcategory', e.target.value)}
                    placeholder={isAr ? 'مثال: رجالي / نسائي' : 'e.g. Men / Women'}
                  />
                </div>
              </div>

              {form.category === 'clothing' && (
                <div className="space-y-4 rounded-lg border p-4">
                  <p className="text-sm font-medium">{isAr ? 'خصائص الملابس' : 'Clothing attributes'}</p>
                  <div className="space-y-2">
                    <Label>{isAr ? 'نوع القماش' : 'Fabric type'}</Label>
                    <Select
                      value={form.fabricType || undefined}
                      onValueChange={(v) => setField('fabricType', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={isAr ? 'اختر' : 'Select'} />
                      </SelectTrigger>
                      <SelectContent>
                        {CLOTHING_FABRICS.map((f) => (
                          <SelectItem key={f} value={f}>
                            {f}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{isAr ? 'الألوان (مفصولة بفاصلة)' : 'Colors (comma separated)'}</Label>
                    <Input
                      value={form.colors}
                      onChange={(e) => setField('colors', e.target.value)}
                      placeholder={isAr ? 'أبيض، أسود، أزرق' : 'White, Black, Blue'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isAr ? 'المقاسات' : 'Sizes'}</Label>
                    <div className="flex flex-wrap gap-2">
                      {CLOTHING_SIZES.map((size) => (
                        <label
                          key={size}
                          className="flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1 text-sm"
                        >
                          <Checkbox
                            checked={form.sizes.includes(size)}
                            onCheckedChange={() => toggleSize(size)}
                          />
                          {size}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{isAr ? 'العدد المتبقي' : 'Remaining quantity'}</Label>
                    <Input
                      type="number"
                      min={0}
                      value={form.quantity}
                      onChange={(e) => setField('quantity', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {step === 1 && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{isAr ? 'السعر' : 'Price'}</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.price}
                    onChange={(e) => setField('price', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isAr ? 'نسبة الخصم %' : 'Discount %'}</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={form.discountPercent}
                    onChange={(e) => setField('discountPercent', e.target.value)}
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {isAr ? 'السعر بعد الخصم:' : 'Final price:'}{' '}
                <strong>
                  {previewPrice} EGP
                </strong>
              </p>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{isAr ? 'الشحن متاح' : 'Shipping available'}</p>
                  <p className="text-xs text-muted-foreground">
                    {isAr ? 'فعّل إن كنت تقدم توصيلًا' : 'Enable if you offer delivery'}
                  </p>
                </div>
                <Switch
                  checked={form.shippingAvailable}
                  onCheckedChange={(v) => setField('shippingAvailable', v)}
                />
              </div>
              {form.shippingAvailable && (
                <div className="space-y-2">
                  <Label>{isAr ? 'تفاصيل الشحن' : 'Shipping details'}</Label>
                  <Textarea
                    value={form.shippingInfo}
                    onChange={(e) => setField('shippingInfo', e.target.value)}
                    placeholder={isAr ? 'مدة التوصيل، التكلفة...' : 'Delivery time, cost...'}
                  />
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{isAr ? 'رقم الهاتف' : 'Phone'}</Label>
                  <Input value={form.phone} onChange={(e) => setField('phone', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{isAr ? 'واتساب / رابط واتساب' : 'WhatsApp / link'}</Label>
                  <Input
                    value={form.whatsapp}
                    onChange={(e) => setField('whatsapp', e.target.value)}
                    placeholder="+249... or https://wa.me/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isAr ? 'المدينة' : 'City'}</Label>
                  <Input value={form.city} onChange={(e) => setField('city', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{isAr ? 'الدولة' : 'Country'}</Label>
                  <Input value={form.country} onChange={(e) => setField('country', e.target.value)} />
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex flex-wrap gap-2">
                <label className="inline-flex cursor-pointer">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void handleUpload(f, 'image');
                      e.target.value = '';
                    }}
                  />
                  <Button type="button" variant="outline" asChild>
                    <span>
                      {uploading ? (
                        <Loader2 className="me-1 h-4 w-4 animate-spin" />
                      ) : (
                        <ImagePlus className="me-1 h-4 w-4" />
                      )}
                      {isAr ? 'رفع صورة' : 'Upload image'}
                    </span>
                  </Button>
                </label>
                <label className="inline-flex cursor-pointer">
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    className="hidden"
                    disabled={uploading || (selectedPlan ? !selectedPlan.allowVideo : false)}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void handleUpload(f, 'video');
                      e.target.value = '';
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={selectedPlan ? !selectedPlan.allowVideo : false}
                    asChild
                  >
                    <span>
                      <Video className="me-1 h-4 w-4" />
                      {isAr ? 'رفع فيديو' : 'Upload video'}
                    </span>
                  </Button>
                </label>
              </div>
              {selectedPlan && (
                <p className="text-xs text-muted-foreground">
                  {isAr
                    ? `الحد: ${selectedPlan.maxImages} صور${selectedPlan.allowVideo ? ' + فيديو' : ''}`
                    : `Limit: ${selectedPlan.maxImages} images${selectedPlan.allowVideo ? ' + video' : ''}`}
                </p>
              )}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {form.media.map((m) => (
                  <div key={m.url} className="relative overflow-hidden rounded-lg border">
                    {m.type === 'video' ? (
                      <video src={m.url} className="aspect-video w-full object-cover" controls />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.url} alt="" className="aspect-video w-full object-cover" />
                    )}
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute end-1 top-1 h-7 w-7"
                      onClick={() => removeMedia(m.url)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    <Badge className="absolute bottom-1 start-1 text-[10px]">
                      {m.type === 'video' ? (isAr ? 'فيديو' : 'Video') : isAr ? 'صورة' : 'Image'}
                    </Badge>
                  </div>
                ))}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="grid gap-3">
                {plans.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setField('planId', plan.id)}
                    className={`rounded-xl border p-4 text-start transition ${
                      form.planId === plan.id
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/30'
                        : 'hover:border-primary/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold">
                          {isAr ? plan.nameAr || plan.name : plan.name}
                          {plan.isFeatured && (
                            <Badge className="ms-2" variant="secondary">
                              {isAr ? 'مميز' : 'Featured'}
                            </Badge>
                          )}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {isAr ? plan.descriptionAr || plan.description : plan.description}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {plan.durationDays} {isAr ? 'يوم' : 'days'} · {plan.maxImages}{' '}
                          {isAr ? 'صور' : 'images'}
                          {plan.allowVideo ? (isAr ? ' · فيديو' : ' · video') : ''}
                        </p>
                      </div>
                      <p className="text-lg font-bold">
                        {plan.price} {plan.currency}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              <Card className="bg-muted/40">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    {isAr ? 'طريقة الدفع' : 'Payment method'}
                  </CardTitle>
                  <CardDescription>
                    {isAr
                      ? 'المحفظة تُخصم فورًا. التحويل يحتاج تأكيد الأدمن.'
                      : 'Wallet is charged immediately. Bank transfer needs admin confirmation.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant={payMethod === 'wallet' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPayMethod('wallet')}
                    >
                      {isAr ? 'المحفظة' : 'Wallet'}
                    </Button>
                    <Button
                      type="button"
                      variant={payMethod === 'bank_transfer' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPayMethod('bank_transfer')}
                    >
                      {isAr ? 'تحويل بنكي' : 'Bank transfer'}
                    </Button>
                  </div>
                  {payMethod === 'bank_transfer' && (
                    <div className="space-y-2">
                      <Label>{isAr ? 'إثبات التحويل' : 'Transfer proof'}</Label>
                      <label className="inline-flex cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            setUploading(true);
                            const res = await uploadAdMedia(f, 'image');
                            setUploading(false);
                            if (res.success && res.url) {
                              setProofUrl(res.url);
                              toast.success(isAr ? 'تم رفع الإثبات' : 'Proof uploaded');
                            } else {
                              toast.error(res.error || (isAr ? 'فشل رفع الملف' : 'Upload failed'));
                            }
                          }}
                        />
                        <Button type="button" variant="outline" size="sm" asChild>
                          <span>
                            <Upload className="me-1 h-4 w-4" />
                            {proofUrl
                              ? isAr
                                ? 'تم الرفع — استبدال'
                                : 'Uploaded — replace'
                              : isAr
                                ? 'رفع صورة الإثبات'
                                : 'Upload proof image'}
                          </span>
                        </Button>
                      </label>
                      {proofUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={proofUrl} alt="proof" className="mt-2 h-24 rounded-md border object-cover" />
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4">
            <Button
              type="button"
              variant="ghost"
              disabled={step === 0 || saving}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              {isAr ? (
                <ArrowRight className="me-1 h-4 w-4" />
              ) : (
                <ArrowLeft className="me-1 h-4 w-4" />
              )}
              {isAr ? 'السابق' : 'Back'}
            </Button>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" disabled={saving} onClick={() => void saveDraft()}>
                {isAr ? 'حفظ مسودة' : 'Save draft'}
              </Button>
              {step < STEPS.length - 1 ? (
                <Button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    if (validateStep(step)) setStep((s) => s + 1);
                  }}
                >
                  {isAr ? 'التالي' : 'Next'}
                  {isAr ? (
                    <ArrowLeft className="ms-1 h-4 w-4" />
                  ) : (
                    <ArrowRight className="ms-1 h-4 w-4" />
                  )}
                </Button>
              ) : (
                <Button type="button" disabled={saving || uploading} onClick={() => void submitAndPay()}>
                  {saving && <Loader2 className="me-1 h-4 w-4 animate-spin" />}
                  {isAr ? 'ادفع وأرسل للمراجعة' : 'Pay & submit'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
