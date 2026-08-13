'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Trash2, Upload, RefreshCcw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { deleteMediaAsset, getMediaAssets, uploadMediaFile } from '@/lib/admin-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminPageHeader } from '@/components/admin/layout/admin-ui';
import { useAdminTranslation } from '@/hooks/use-admin-translation';

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  originalName?: string | null;
  folder: string;
  mimeType: string;
  size: number;
}

export default function MediaLibrarySection() {
  const { t } = useAdminTranslation();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState('general');

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getMediaAssets({ search: search || undefined, folder, limit: 60 });
    if (res.success) setItems(res.data || []);
    else toast.error(res.error || t('media.loadError'));
    setLoading(false);
  }, [search, folder, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const onUpload = async (file?: File | null) => {
    if (!file) return;
    setUploading(true);
    const res = await uploadMediaFile(file, folder);
    setUploading(false);
    if (res.success) {
      toast.success(t('media.uploaded'));
      void load();
    } else toast.error(res.error || t('media.uploadFailed'));
  };

  const onDelete = async (id: string) => {
    if (!confirm(t('media.deleteConfirm'))) return;
    const res = await deleteMediaAsset(id);
    if (res.success) {
      toast.success(t('media.deleted'));
      setItems((prev) => prev.filter((i) => i.id !== id));
    } else toast.error(res.error || t('media.deleteFailed'));
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t('media.title')}
        subtitle={t('media.subtitle')}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => void load()}>
              <RefreshCcw className="w-4 h-4 mr-1" /> {t('common.refresh')}
            </Button>
            <Button size="sm" disabled={uploading} asChild>
              <label className="cursor-pointer inline-flex items-center">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => void onUpload(e.target.files?.[0])}
                />
                {uploading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
                {t('media.upload')}
              </label>
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder={t('media.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Input
          placeholder={t('media.folder')}
          value={folder}
          onChange={(e) => setFolder(e.target.value || 'general')}
          className="max-w-[160px]"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            {t('media.empty')}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden group">
              <div className="aspect-square relative bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt={item.originalName || item.filename} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      void navigator.clipboard.writeText(item.url);
                      toast.success(t('media.copied'));
                    }}
                  >
                    {t('media.copyUrl')}
                  </Button>
                  <Button size="icon" variant="destructive" onClick={() => void onDelete(item.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-2 text-xs truncate text-muted-foreground">
                {item.originalName || item.filename}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
