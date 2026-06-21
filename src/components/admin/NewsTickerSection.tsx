'use client';

import { useCallback, useEffect, useState } from 'react';
import { Megaphone, Palette, Plus, Save, Trash2, GripVertical, Type } from 'lucide-react';
import { toast } from 'sonner';
import { getSettings, saveSettings } from '@/lib/admin-api';
import {
  DEFAULT_NEWS_TICKER,
  NEWS_TICKER_PRESETS,
  parseNewsTicker,
  serializeNewsTicker,
  type NewsTickerConfig,
  type NewsTickerItem,
  type NewsTickerStyle,
} from '@/lib/news-ticker';
import { NewsTickerBar } from '@/components/layout/NewsTickerBar';
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

function newItem(): NewsTickerItem {
  return { id: crypto.randomUUID(), text: '', link: '' };
}

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
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono text-xs h-9"
        />
      </div>
    </div>
  );
}

export default function NewsTickerSection() {
  const { t } = useAdminTranslation();
  const [config, setConfig] = useState<NewsTickerConfig>(DEFAULT_NEWS_TICKER);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    const res = await getSettings();
    if (res.success && res.data) {
      setConfig(parseNewsTicker(res.data as Record<string, string>));
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateStyle = (patch: Partial<NewsTickerStyle>) => {
    setConfig((prev) => ({ ...prev, style: { ...prev.style, ...patch } }));
  };

  const applyPreset = (key: keyof typeof NEWS_TICKER_PRESETS) => {
    setConfig((prev) => ({
      ...prev,
      style: { ...prev.style, ...NEWS_TICKER_PRESETS[key] },
    }));
  };

  const save = async () => {
    const cleaned: NewsTickerConfig = {
      ...config,
      items: config.items.filter((item) => item.text.trim()),
    };
    if (cleaned.enabled && cleaned.items.length === 0) {
      toast.error(t('newsTicker.itemsRequired'));
      return;
    }
    setSaving(true);
    const res = await saveSettings(serializeNewsTicker(cleaned));
    if (res.success) {
      setConfig(cleaned);
      toast.success(t('newsTicker.saved'));
    } else {
      toast.error(res.error || t('appearance.loadError'));
    }
    setSaving(false);
  };

  const updateItem = (id: string, patch: Partial<NewsTickerItem>) => {
    setConfig((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  };

  const removeItem = (id: string) => {
    setConfig((prev) => ({ ...prev, items: prev.items.filter((item) => item.id !== id) }));
  };

  const { style } = config;
  const hasPreview = config.enabled && config.items.some((i) => i.text.trim());

  if (!loaded) return null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-red-600" />
            {t('newsTicker.title')}
          </CardTitle>
          <CardDescription>{t('newsTicker.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium text-sm">{t('newsTicker.enable')}</p>
              <p className="text-xs text-muted-foreground">{t('newsTicker.enableDesc')}</p>
            </div>
            <Switch
              checked={config.enabled}
              onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, enabled: checked }))}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <Label>{t('newsTicker.speed')}</Label>
              <div className="flex items-center gap-4">
                <Slider
                  min={15}
                  max={120}
                  step={5}
                  value={[config.speedSeconds]}
                  onValueChange={([value]) =>
                    setConfig((prev) => ({ ...prev, speedSeconds: value ?? prev.speedSeconds }))
                  }
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground w-14 text-right">{config.speedSeconds}s</span>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border px-4 py-3">
              <div>
                <p className="text-sm font-medium">{t('newsTicker.pauseOnHover')}</p>
                <p className="text-xs text-muted-foreground">{t('newsTicker.pauseOnHoverDesc')}</p>
              </div>
              <Switch
                checked={style.pauseOnHover}
                onCheckedChange={(checked) => updateStyle({ pauseOnHover: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Palette className="h-4 w-4" />
            {t('newsTicker.appearance')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {(['classic', 'rcar', 'minimal', 'gold'] as const).map((key) => (
              <Button
                key={key}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyPreset(key)}
              >
                {t(`newsTicker.preset.${key}`)}
              </Button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ColorField
              label={t('newsTicker.bgStart')}
              value={style.backgroundColor}
              onChange={(v) => updateStyle({ backgroundColor: v })}
            />
            <ColorField
              label={t('newsTicker.bgEnd')}
              value={style.backgroundColorEnd}
              onChange={(v) => updateStyle({ backgroundColorEnd: v })}
            />
            <ColorField
              label={t('newsTicker.textColor')}
              value={style.textColor}
              onChange={(v) => updateStyle({ textColor: v })}
            />
            <ColorField
              label={t('newsTicker.accentColor')}
              value={style.accentColor}
              onChange={(v) => updateStyle({ accentColor: v })}
            />
            <ColorField
              label={t('newsTicker.labelBg')}
              value={style.labelBackgroundColor}
              onChange={(v) => updateStyle({ labelBackgroundColor: v })}
            />
            <ColorField
              label={t('newsTicker.labelTextColor')}
              value={style.labelTextColor}
              onChange={(v) => updateStyle({ labelTextColor: v })}
            />
            <ColorField
              label={t('newsTicker.borderColor')}
              value={style.borderColor}
              onChange={(v) => updateStyle({ borderColor: v })}
              allowAlpha
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>{t('newsTicker.height')}</Label>
              <div className="flex items-center gap-3">
                <Slider
                  min={32}
                  max={56}
                  step={2}
                  value={[style.height]}
                  onValueChange={([v]) => updateStyle({ height: v ?? style.height })}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-10">{style.height}px</span>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border px-3 py-2">
              <Label className="text-xs">{t('newsTicker.useGradient')}</Label>
              <Switch
                checked={style.useGradient}
                onCheckedChange={(checked) => updateStyle({ useGradient: checked })}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border px-3 py-2">
              <Label className="text-xs">{t('newsTicker.showShimmer')}</Label>
              <Switch
                checked={style.showShimmer}
                onCheckedChange={(checked) => updateStyle({ showShimmer: checked })}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border px-3 py-2">
              <Label className="text-xs">{t('newsTicker.showEdgeFade')}</Label>
              <Switch
                checked={style.showEdgeFade}
                onCheckedChange={(checked) => updateStyle({ showEdgeFade: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Type className="h-4 w-4" />
            {t('newsTicker.typography')}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label>{t('newsTicker.fontFamily')}</Label>
            <Select
              value={style.fontFamily}
              onValueChange={(v) => updateStyle({ fontFamily: v as NewsTickerStyle['fontFamily'] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sans">{t('newsTicker.fontSans')}</SelectItem>
                <SelectItem value="display">{t('newsTicker.fontDisplay')}</SelectItem>
                <SelectItem value="arabic">{t('newsTicker.fontArabic')}</SelectItem>
                <SelectItem value="mono">{t('newsTicker.fontMono')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t('newsTicker.fontWeight')}</Label>
            <Select
              value={style.fontWeight}
              onValueChange={(v) => updateStyle({ fontWeight: v as NewsTickerStyle['fontWeight'] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(['400', '500', '600', '700', '800'] as const).map((w) => (
                  <SelectItem key={w} value={w}>
                    {w}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t('newsTicker.textTransform')}</Label>
            <Select
              value={style.textTransform}
              onValueChange={(v) => updateStyle({ textTransform: v as 'none' | 'uppercase' })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('newsTicker.transformNone')}</SelectItem>
                <SelectItem value="uppercase">{t('newsTicker.transformUpper')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t('newsTicker.fontSize')}</Label>
            <div className="flex items-center gap-3">
              <Slider
                min={11}
                max={18}
                step={1}
                value={[style.fontSize]}
                onValueChange={([v]) => updateStyle({ fontSize: v ?? style.fontSize })}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-10">{style.fontSize}px</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t('newsTicker.letterSpacing')}</Label>
            <div className="flex items-center gap-3">
              <Slider
                min={0}
                max={4}
                step={0.1}
                value={[style.letterSpacing]}
                onValueChange={([v]) => updateStyle({ letterSpacing: v ?? style.letterSpacing })}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-10">{style.letterSpacing}px</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t('newsTicker.separator')}</Label>
            <Select
              value={style.separatorStyle}
              onValueChange={(v) => updateStyle({ separatorStyle: v as NewsTickerStyle['separatorStyle'] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">{t('newsTicker.sepLine')}</SelectItem>
                <SelectItem value="dot">{t('newsTicker.sepDot')}</SelectItem>
                <SelectItem value="diamond">{t('newsTicker.sepDiamond')}</SelectItem>
                <SelectItem value="none">{t('newsTicker.sepNone')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">{t('newsTicker.labelBadge')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-center justify-between rounded-lg border px-4 py-3 sm:col-span-2 lg:col-span-3">
            <div>
              <p className="text-sm font-medium">{t('newsTicker.showLabel')}</p>
              <p className="text-xs text-muted-foreground">{t('newsTicker.showLabelDesc')}</p>
            </div>
            <Switch
              checked={style.showLabel}
              onCheckedChange={(checked) => updateStyle({ showLabel: checked })}
            />
          </div>
          {style.showLabel && (
            <>
              <div className="space-y-2">
                <Label>{t('newsTicker.labelText')}</Label>
                <Input
                  value={style.labelText}
                  onChange={(e) => updateStyle({ labelText: e.target.value })}
                  placeholder="BREAKING"
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                <Label className="text-sm">{t('newsTicker.labelPulse')}</Label>
                <Switch
                  checked={style.labelPulse}
                  onCheckedChange={(checked) => updateStyle({ labelPulse: checked })}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                <Label className="text-sm">{t('newsTicker.showSeparator')}</Label>
                <Switch
                  checked={style.showSeparator}
                  onCheckedChange={(checked) => updateStyle({ showSeparator: checked })}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">{t('newsTicker.items')}</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => setConfig((prev) => ({ ...prev, items: [...prev.items, newItem()] }))}
            >
              <Plus className="h-3.5 w-3.5" />
              {t('newsTicker.addItem')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {config.items.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center border rounded-lg border-dashed">
              {t('newsTicker.noItems')}
            </p>
          ) : (
            config.items.map((item, index) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row gap-2 sm:items-start rounded-lg border p-3 bg-muted/30"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground mt-2.5 hidden sm:block shrink-0" />
                <div className="flex-1 grid gap-2 sm:grid-cols-2">
                  <Input
                    placeholder={t('newsTicker.textPlaceholder')}
                    value={item.text}
                    onChange={(e) => updateItem(item.id, { text: e.target.value })}
                  />
                  <Input
                    placeholder={t('newsTicker.linkPlaceholder')}
                    value={item.link ?? ''}
                    onChange={(e) => updateItem(item.id, { link: e.target.value })}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive shrink-0 self-end sm:self-start"
                  onClick={() => removeItem(item.id)}
                  aria-label={`Remove item ${index + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {hasPreview && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t('newsTicker.preview')}</CardTitle>
            <CardDescription>{t('newsTicker.previewDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="p-0 overflow-hidden rounded-b-lg">
            <NewsTickerBar config={config} preview />
          </CardContent>
        </Card>
      )}

      <Button
        type="button"
        onClick={save}
        disabled={saving}
        className="gap-1 bg-emerald-600 hover:bg-emerald-700"
      >
        <Save className="h-4 w-4" />
        {saving ? t('common.loading') : t('newsTicker.save')}
      </Button>
    </div>
  );
}
