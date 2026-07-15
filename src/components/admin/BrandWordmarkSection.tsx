'use client';

import { useCallback, useEffect, useState } from 'react';
import { Palette, Save, Sparkles, Type } from 'lucide-react';
import { toast } from 'sonner';
import { getSettings, saveSettings } from '@/lib/admin-api';
import {
  BRAND_WORDMARK_PRESETS,
  DEFAULT_BRAND_WORDMARK,
  parseBrandWordmark,
  serializeBrandWordmark,
  type BrandWordmarkConfig,
} from '@/lib/brand-wordmark';
import { BrandWordmark } from '@/components/brand/BrandWordmark';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdminTranslation } from '@/hooks/use-admin-translation';

function ColorField({
  label,
  value,
  onChange,
  allowAlpha,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  allowAlpha?: boolean;
}) {
  const pickerValue = value.startsWith('#') && value.length >= 7 ? value.slice(0, 7) : '#000000';
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <div className="flex gap-2">
        {!allowAlpha && (
          <input
            type="color"
            value={pickerValue}
            onChange={(e) => onChange(e.target.value)}
            className="h-9 w-11 shrink-0 cursor-pointer rounded-md border bg-background p-0.5"
          />
        )}
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="font-mono text-xs h-9" />
      </div>
    </div>
  );
}

export default function BrandWordmarkSection() {
  const { t } = useAdminTranslation();
  const [config, setConfig] = useState<BrandWordmarkConfig>(DEFAULT_BRAND_WORDMARK);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    const res = await getSettings();
    if (res.success && res.data) {
      setConfig(parseBrandWordmark(res.data as Record<string, string>));
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const update = (patch: Partial<BrandWordmarkConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  };

  const applyPreset = (key: keyof typeof BRAND_WORDMARK_PRESETS) => {
    setConfig((prev) => ({ ...prev, ...BRAND_WORDMARK_PRESETS[key] }));
  };

  const save = async () => {
    setSaving(true);
    const res = await saveSettings(serializeBrandWordmark(config));
    if (res.success) toast.success(t('brandWordmark.saved'));
    else toast.error(res.error || t('appearance.loadError'));
    setSaving(false);
  };

  if (!loaded) return null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            {t('brandWordmark.title')}
          </CardTitle>
          <CardDescription>{t('brandWordmark.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(['rcar', 'luxury', 'minimal', 'neon'] as const).map((key) => (
              <Button key={key} type="button" variant="outline" size="sm" onClick={() => applyPreset(key)}>
                {t(`brandWordmark.preset.${key}`)}
              </Button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t('brandWordmark.primaryTextEn')}</Label>
              <Input
                value={config.primaryText}
                onChange={(e) => update({ primaryText: e.target.value })}
                placeholder="RCiAR"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('brandWordmark.secondaryTextEn')}</Label>
              <Input
                value={config.secondaryText}
                onChange={(e) => update({ secondaryText: e.target.value })}
                placeholder="Cars"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t('brandWordmark.primaryTextAr')}</Label>
              <Input
                value={config.primaryTextAr}
                onChange={(e) => update({ primaryTextAr: e.target.value })}
                placeholder="سيّار"
                dir="rtl"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('brandWordmark.secondaryTextAr')}</Label>
              <Input
                value={config.secondaryTextAr}
                onChange={(e) => update({ secondaryTextAr: e.target.value })}
                placeholder="كارز"
                dir="rtl"
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border px-4 py-3">
            <div>
              <p className="text-sm font-medium">{t('brandWordmark.showSecondary')}</p>
              <p className="text-xs text-muted-foreground">{t('brandWordmark.showSecondaryDesc')}</p>
            </div>
            <Switch checked={config.showSecondary} onCheckedChange={(v) => update({ showSecondary: v })} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Type className="h-4 w-4" />
            {t('brandWordmark.typography')}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label>{t('brandWordmark.fontFamily')}</Label>
            <Select value={config.fontFamily} onValueChange={(v) => update({ fontFamily: v as BrandWordmarkConfig['fontFamily'] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="display">{t('brandWordmark.fontDisplay')}</SelectItem>
                <SelectItem value="sans">{t('brandWordmark.fontSans')}</SelectItem>
                <SelectItem value="arabic">{t('brandWordmark.fontArabic')}</SelectItem>
                <SelectItem value="mono">{t('brandWordmark.fontMono')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t('brandWordmark.fontWeight')}</Label>
            <Select value={config.fontWeight} onValueChange={(v) => update({ fontWeight: v as BrandWordmarkConfig['fontWeight'] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(['300', '400', '500', '600', '700', '800', '900'] as const).map((w) => (
                  <SelectItem key={w} value={w}>{w}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t('brandWordmark.textTransform')}</Label>
            <Select value={config.textTransform} onValueChange={(v) => update({ textTransform: v as BrandWordmarkConfig['textTransform'] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('brandWordmark.transformNone')}</SelectItem>
                <SelectItem value="uppercase">{t('brandWordmark.transformUpper')}</SelectItem>
                <SelectItem value="capitalize">{t('brandWordmark.transformCap')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t('brandWordmark.fontSize')}</Label>
            <div className="flex items-center gap-3">
              <Slider min={16} max={42} step={1} value={[config.fontSize]} onValueChange={([v]) => update({ fontSize: v ?? config.fontSize })} className="flex-1" />
              <span className="text-xs text-muted-foreground w-10">{config.fontSize}px</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t('brandWordmark.letterSpacing')}</Label>
            <div className="flex items-center gap-3">
              <Slider min={-1} max={6} step={0.1} value={[config.letterSpacing]} onValueChange={([v]) => update({ letterSpacing: v ?? config.letterSpacing })} className="flex-1" />
              <span className="text-xs text-muted-foreground w-10">{config.letterSpacing}px</span>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border px-4 py-3">
            <Label className="text-sm">{t('brandWordmark.italic')}</Label>
            <Switch checked={config.italic} onCheckedChange={(v) => update({ italic: v })} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Palette className="h-4 w-4" />
            {t('brandWordmark.colors')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border px-4 py-3">
            <Label className="text-sm">{t('brandWordmark.useGradient')}</Label>
            <Switch checked={config.useGradient} onCheckedChange={(v) => update({ useGradient: v })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {config.useGradient ? (
              <>
                <ColorField label={t('brandWordmark.gradientStart')} value={config.gradientStart} onChange={(v) => update({ gradientStart: v })} />
                <ColorField label={t('brandWordmark.gradientEnd')} value={config.gradientEnd} onChange={(v) => update({ gradientEnd: v })} />
              </>
            ) : (
              <ColorField label={t('brandWordmark.solidColor')} value={config.solidColor} onChange={(v) => update({ solidColor: v })} />
            )}
            <ColorField label={t('brandWordmark.secondaryColor')} value={config.secondaryColor} onChange={(v) => update({ secondaryColor: v })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t('brandWordmark.secondaryFontSize')}</Label>
              <div className="flex items-center gap-3">
                <Slider min={12} max={28} step={1} value={[config.secondaryFontSize]} onValueChange={([v]) => update({ secondaryFontSize: v ?? config.secondaryFontSize })} className="flex-1" />
                <span className="text-xs text-muted-foreground w-10">{config.secondaryFontSize}px</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('brandWordmark.secondaryFontWeight')}</Label>
              <Select value={config.secondaryFontWeight} onValueChange={(v) => update({ secondaryFontWeight: v as BrandWordmarkConfig['secondaryFontWeight'] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(['300', '400', '500', '600', '700'] as const).map((w) => (
                    <SelectItem key={w} value={w}>{w}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">{t('brandWordmark.effects')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg border px-4 py-3">
              <Label className="text-sm">{t('brandWordmark.showGlow')}</Label>
              <Switch checked={config.showGlow} onCheckedChange={(v) => update({ showGlow: v })} />
            </div>
            <div className="flex items-center justify-between rounded-lg border px-4 py-3">
              <Label className="text-sm">{t('brandWordmark.showUnderline')}</Label>
              <Switch checked={config.showUnderline} onCheckedChange={(v) => update({ showUnderline: v })} />
            </div>
            <div className="flex items-center justify-between rounded-lg border px-4 py-3">
              <Label className="text-sm">{t('brandWordmark.showShimmer')}</Label>
              <Switch checked={config.showShimmer} onCheckedChange={(v) => update({ showShimmer: v })} />
            </div>
          </div>
          {config.showGlow && (
            <ColorField label={t('brandWordmark.glowColor')} value={config.glowColor} onChange={(v) => update({ glowColor: v })} allowAlpha />
          )}
          {config.showUnderline && (
            <div className="grid gap-4 sm:grid-cols-2">
              <ColorField label={t('brandWordmark.underlineStart')} value={config.underlineStart} onChange={(v) => update({ underlineStart: v })} />
              <ColorField label={t('brandWordmark.underlineEnd')} value={config.underlineEnd} onChange={(v) => update({ underlineEnd: v })} />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{t('brandWordmark.preview')}</CardTitle>
          <CardDescription>{t('brandWordmark.previewDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 rounded-b-lg bg-muted/30 py-10 px-6">
          <BrandWordmark config={config} size="lg" preview />
          <BrandWordmark config={config} size="md" preview />
          <BrandWordmark config={config} size="sm" showSecondary={false} preview />
        </CardContent>
      </Card>

      <Button type="button" onClick={save} disabled={saving} className="gap-1 bg-emerald-600 hover:bg-emerald-700">
        <Save className="h-4 w-4" />
        {saving ? t('common.loading') : t('brandWordmark.save')}
      </Button>
    </div>
  );
}
