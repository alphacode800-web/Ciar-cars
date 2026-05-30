'use client';

import React, { useRef, useState } from 'react';
import { Upload, Link2, Loader2, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ImagePickerProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
  uploadLabel?: string;
  urlLabel?: string;
  previewClassName?: string;
}

export function ImagePicker({
  value,
  onChange,
  label,
  className,
  uploadLabel = 'رفع من الجهاز',
  urlLabel = 'رابط الصورة',
  previewClassName,
}: ImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState(value);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success && data.url) {
        onChange(data.url);
        setUrlInput(data.url);
        toast.success('تم رفع الصورة بنجاح');
      } else {
        toast.error(data.error || 'فشل رفع الصورة');
      }
    } catch {
      toast.error('فشل رفع الصورة');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const applyUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      toast.error('أدخل رابط الصورة');
      return;
    }
    onChange(trimmed);
    toast.success('تم حفظ رابط الصورة');
  };

  return (
    <div className={cn('space-y-3', className)}>
      {label && <Label>{label}</Label>}

      {value && (
        <div
          className={cn(
            'relative aspect-video rounded-lg overflow-hidden border bg-muted',
            previewClassName
          )}
        >
          <img src={value} alt="" className="h-full w-full object-cover" />
        </div>
      )}

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="gap-1.5 text-xs sm:text-sm">
            <Upload className="h-3.5 w-3.5" />
            {uploadLabel}
          </TabsTrigger>
          <TabsTrigger value="url" className="gap-1.5 text-xs sm:text-sm">
            <Link2 className="h-3.5 w-3.5" />
            {urlLabel}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-3">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleUpload}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2 h-11"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImageIcon className="h-4 w-4" />
            )}
            {uploading ? 'جاري الرفع...' : 'اختر صورة من جهازك'}
          </Button>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            JPG, PNG, WebP — حتى 5 ميجابايت
          </p>
        </TabsContent>

        <TabsContent value="url" className="mt-3 space-y-2">
          <Input
            placeholder="https://example.com/image.jpg"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            dir="ltr"
          />
          <Button type="button" className="w-full" onClick={applyUrl}>
            استخدام هذا الرابط
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
