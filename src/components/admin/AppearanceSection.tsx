'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ImageIcon,
  LayoutDashboard,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  Settings,
  Layers,
  Pencil,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getSettings,
  saveSettings,
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  getHomepageSections,
} from '@/lib/admin-api';
import { DEFAULT_HERO_BACKGROUNDS } from '@/lib/countries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ImagePicker } from '@/components/ui/image-picker';
import { useAdminTranslation } from '@/hooks/use-admin-translation';
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
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  position: string;
  order: number;
  isActive: boolean;
}

interface HomepageSection {
  id: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  order: number;
  isActive: boolean;
}

export default function AppearanceSection() {
  const { t } = useAdminTranslation();
  const [loading, setLoading] = useState(true);
  const [savingHero, setSavingHero] = useState(false);
  const [heroUrls, setHeroUrls] = useState<string[]>([...DEFAULT_HERO_BACKGROUNDS]);
  const [pendingHeroUrl, setPendingHeroUrl] = useState('');
  const [banners, setBanners] = useState<Banner[]>([]);
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [allSettings, setAllSettings] = useState<Record<string, string>>({});

  const [bannerDialog, setBannerDialog] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Partial<Banner> | null>(null);
  const [deleteBannerId, setDeleteBannerId] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [settingsRes, bannersRes, sectionsRes] = await Promise.all([
        getSettings(),
        getBanners(undefined, true),
        getHomepageSections(),
      ]);

      if (settingsRes.success && settingsRes.data) {
        setAllSettings(settingsRes.data);
        const raw = settingsRes.data.hero_backgrounds;
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as string[];
            if (Array.isArray(parsed) && parsed.length) setHeroUrls(parsed);
          } catch {
            setHeroUrls([...DEFAULT_HERO_BACKGROUNDS]);
          }
        }
      }

      if (bannersRes.success && bannersRes.data) {
        setBanners(bannersRes.data as Banner[]);
      }

      if (sectionsRes.success && sectionsRes.data) {
        setSections(sectionsRes.data as HomepageSection[]);
      }
    } catch {
      toast.error(t('appearance.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const saveHeroBackgrounds = async () => {
    setSavingHero(true);
    const res = await saveSettings({ hero_backgrounds: JSON.stringify(heroUrls) });
    if (res.success) {
      toast.success(t('appearance.heroSaved'));
      setAllSettings((prev) => ({ ...prev, hero_backgrounds: JSON.stringify(heroUrls) }));
    } else {
      toast.error(res.error || t('appearance.loadError'));
    }
    setSavingHero(false);
  };

  const addHeroUrl = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return;
    setHeroUrls((prev) => [...prev, trimmed]);
    setPendingHeroUrl('');
  };

  const openBannerForm = (banner?: Banner) => {
    setEditingBanner(
      banner || {
        title: '',
        subtitle: '',
        imageUrl: '',
        linkUrl: '/listing',
        position: 'home',
        order: banners.length,
        isActive: true,
      }
    );
    setBannerDialog(true);
  };

  const saveBanner = async () => {
    if (!editingBanner?.title || !editingBanner.imageUrl) {
      toast.error(t('appearance.titleRequired'));
      return;
    }
    const payload = {
      title: editingBanner.title,
      subtitle: editingBanner.subtitle || '',
      imageUrl: editingBanner.imageUrl,
      linkUrl: editingBanner.linkUrl || '/listing',
      position: editingBanner.position || 'home',
      order: editingBanner.order ?? 0,
      isActive: editingBanner.isActive ?? true,
    };

    const res = editingBanner.id
      ? await updateBanner(editingBanner.id, payload)
      : await createBanner(payload);

    if (res.success) {
      toast.success(t('appearance.bannerSaved'));
      setBannerDialog(false);
      setEditingBanner(null);
      loadAll();
    } else {
      toast.error(res.error || t('appearance.loadError'));
    }
  };

  const confirmDeleteBanner = async () => {
    if (!deleteBannerId) return;
    const res = await deleteBanner(deleteBannerId);
    if (res.success) {
      toast.success(t('appearance.bannerDeleted'));
      loadAll();
    } else {
      toast.error(res.error || t('appearance.loadError'));
    }
    setDeleteBannerId(null);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">{t('appearance.title')}</h2>
          <p className="text-muted-foreground text-sm">{t('appearance.subtitle')}</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadAll} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          {t('common.refresh')}
        </Button>
      </div>

      <Tabs defaultValue="hero" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="hero" className="gap-1.5">
            <LayoutDashboard className="h-4 w-4" />
            {t('appearance.tabHero')}
          </TabsTrigger>
          <TabsTrigger value="banners" className="gap-1.5">
            <ImageIcon className="h-4 w-4" />
            {t('appearance.tabBanners')} ({banners.length})
          </TabsTrigger>
          <TabsTrigger value="homepage" className="gap-1.5">
            <Layers className="h-4 w-4" />
            {t('appearance.tabHomepage')}
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-1.5">
            <Settings className="h-4 w-4" />
            {t('appearance.tabSettings')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('appearance.heroTitle')}</CardTitle>
              <CardDescription>{t('appearance.heroDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {heroUrls.map((url, index) => (
                  <div
                    key={`${url}-${index}`}
                    className="group relative aspect-video rounded-lg overflow-hidden border bg-muted"
                  >
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setHeroUrls((prev) => prev.filter((_, i) => i !== index))}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
              <ImagePicker
                label={t('appearance.addImage')}
                value={pendingHeroUrl}
                onChange={(url) => {
                  addHeroUrl(url);
                }}
                uploadLabel={t('imagePicker.upload')}
                urlLabel={t('imagePicker.url')}
              />
              <Button
                type="button"
                onClick={saveHeroBackgrounds}
                disabled={savingHero}
                className="gap-1 bg-emerald-600 hover:bg-emerald-700"
              >
                <Save className="h-4 w-4" />
                {savingHero ? t('common.loading') : t('appearance.saveHero')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="banners" className="mt-4">
          <div className="flex justify-end mb-3">
            <Button onClick={() => openBannerForm()} className="gap-1 bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4" />
              {t('appearance.newBanner')}
            </Button>
          </div>
          {banners.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                {t('appearance.noBanners')}
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {banners.map((banner) => (
                <motion.div key={banner.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Card className="overflow-hidden">
                    <div className="aspect-[21/9] relative">
                      <img
                        src={banner.imageUrl}
                        alt={banner.title}
                        className="h-full w-full object-cover"
                      />
                      {!banner.isActive && (
                        <Badge className="absolute top-2 left-2" variant="secondary">
                          {t('common.inactive')}
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4 space-y-2">
                      <p className="font-medium text-sm line-clamp-1">{banner.title}</p>
                      {banner.subtitle && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{banner.subtitle}</p>
                      )}
                      <div className="flex gap-2 pt-1">
                        <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => openBannerForm(banner)}>
                          <Pencil className="h-3.5 w-3.5" />
                          {t('appearance.edit')}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive"
                          onClick={() => setDeleteBannerId(banner.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="homepage" className="mt-4">
          <div className="grid gap-3">
            {sections.map((section) => (
              <Card key={section.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium text-sm capitalize">{section.type.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-muted-foreground">
                      {section.title || '—'} · {t('appearance.order')} {section.order}
                    </p>
                  </div>
                  <Badge variant={section.isActive ? 'default' : 'secondary'}>
                    {section.isActive ? t('common.active') : t('appearance.hidden')}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            {t('appearance.homepageHint')}
          </p>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('appearance.allSettings')}</CardTitle>
              <CardDescription>{t('appearance.settingsReadonly')}</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(allSettings).length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('appearance.noSettings')}</p>
              ) : (
                <div className="divide-y max-h-[400px] overflow-y-auto">
                  {Object.entries(allSettings).map(([key, value]) => (
                    <div key={key} className="py-2 grid grid-cols-1 sm:grid-cols-3 gap-1 text-sm">
                      <span className="font-mono text-xs text-emerald-700 dark:text-emerald-400">{key}</span>
                      <span className="sm:col-span-2 text-muted-foreground break-all text-xs">
                        {value.length > 120 ? `${value.slice(0, 120)}…` : value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={bannerDialog} onOpenChange={setBannerDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingBanner?.id ? t('appearance.editBanner') : t('appearance.newBanner')}
            </DialogTitle>
          </DialogHeader>
          {editingBanner && (
            <div className="space-y-3">
              <div>
                <Label>{t('appearance.bannerTitle')}</Label>
                <Input
                  value={editingBanner.title || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                />
              </div>
              <div>
                <Label>{t('appearance.bannerSubtitle')}</Label>
                <Input
                  value={editingBanner.subtitle || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
                />
              </div>
              <ImagePicker
                label={t('appearance.bannerImage')}
                value={editingBanner.imageUrl || ''}
                onChange={(url) => setEditingBanner({ ...editingBanner, imageUrl: url })}
                uploadLabel={t('imagePicker.upload')}
                urlLabel={t('imagePicker.url')}
              />
              <div>
                <Label>{t('appearance.bannerLink')}</Label>
                <Input
                  value={editingBanner.linkUrl || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, linkUrl: e.target.value })}
                  dir="ltr"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editingBanner.isActive ?? true}
                  onCheckedChange={(c) => setEditingBanner({ ...editingBanner, isActive: !!c })}
                />
                <Label>{t('common.active')}</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setBannerDialog(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={saveBanner} className="bg-emerald-600 hover:bg-emerald-700">
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteBannerId} onOpenChange={() => setDeleteBannerId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('appearance.deleteBanner')}</AlertDialogTitle>
            <AlertDialogDescription>{t('appearance.deleteBannerDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteBanner} className="bg-destructive">
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
