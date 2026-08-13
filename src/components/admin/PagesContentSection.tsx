'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCcw, Save, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { generateSeoAi, getCmsPages, updateCmsPage } from '@/lib/admin-api';
import { LocalizedFields } from '@/components/admin/LocalizedFields';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import type { AboutPageContent, ContactPageContent, LegalPageContent, LocalizedString } from '@/lib/cms-content';
import { AdminPageHeader } from '@/components/admin/layout/admin-ui';
import { useAdminTranslation } from '@/hooks/use-admin-translation';

interface PageRow {
  id: string;
  slug: string;
  title: string | null;
  status: string;
  content: Record<string, unknown>;
  seoTitle?: string | null;
  seoDescription?: string | null;
}

export default function PagesContentSection() {
  const { t } = useAdminTranslation();
  const [pages, setPages] = useState<PageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSlug, setActiveSlug] = useState('about');

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getCmsPages();
    if (res.success && Array.isArray(res.data)) {
      setPages(res.data);
      if (!res.data.find((p: PageRow) => p.slug === activeSlug) && res.data[0]) {
        setActiveSlug(res.data[0].slug);
      }
    } else {
      toast.error(res.error || t('pages.loadError'));
    }
    setLoading(false);
  }, [activeSlug, t]);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const page = pages.find((p) => p.slug === activeSlug);

  const updateContent = (patch: Record<string, unknown>) => {
    setPages((prev) =>
      prev.map((p) =>
        p.slug === activeSlug ? { ...p, content: { ...p.content, ...patch } } : p
      )
    );
  };

  const save = async () => {
    if (!page) return;
    setSaving(true);
    const res = await updateCmsPage({
      slug: page.slug,
      title: page.title || page.slug,
      status: page.status,
      content: page.content,
      seoTitle: page.seoTitle,
      seoDescription: page.seoDescription,
    });
    setSaving(false);
    if (res.success) toast.success(t('pages.saved'));
    else toast.error(res.error || t('pages.saveFailed'));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const about = (page?.content || {}) as AboutPageContent;
  const contact = (page?.content || {}) as ContactPageContent;
  const legal = (page?.content || {}) as LegalPageContent;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t('pages.title')}
        subtitle={t('pages.subtitle')}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => void load()}>
              <RefreshCcw className="w-4 h-4 mr-1" /> {t('common.refresh')}
            </Button>
            <Button size="sm" onClick={() => void save()} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
              {t('common.save')}
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap gap-2">
        {pages.map((p) => (
          <Button
            key={p.slug}
            size="sm"
            variant={activeSlug === p.slug ? 'default' : 'outline'}
            onClick={() => setActiveSlug(p.slug)}
          >
            {p.title || p.slug}
            <Badge className="ms-2" variant="secondary">{p.status}</Badge>
          </Button>
        ))}
      </div>

      {page && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base capitalize">{page.slug}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('pages.internalTitle')}</Label>
                <Input
                  value={page.title || ''}
                  onChange={(e) =>
                    setPages((prev) =>
                      prev.map((p) => (p.slug === activeSlug ? { ...p, title: e.target.value } : p))
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t('pages.status')}</Label>
                <Select
                  value={page.status}
                  onValueChange={(v) =>
                    setPages((prev) =>
                      prev.map((p) => (p.slug === activeSlug ? { ...p, status: v } : p))
                    )
                  }
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">{t('pages.published')}</SelectItem>
                    <SelectItem value="draft">{t('pages.draft')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <Label className="text-sm font-medium">{t('aiSuite.seoAssist')}</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    const res = await generateSeoAi({
                      target: 'page',
                      id: page.slug,
                      locale: 'ar',
                      title: page.title || page.slug,
                    });
                    if (!res.success) {
                      toast.error(res.error || t('aiSuite.error'));
                      return;
                    }
                    const draft = res.data;
                    setPages((prev) =>
                      prev.map((p) =>
                        p.slug === activeSlug
                          ? {
                              ...p,
                              seoTitle: draft.seoTitle || draft.titleAr || p.seoTitle,
                              seoDescription:
                                draft.seoDescription || draft.descriptionAr || p.seoDescription,
                            }
                          : p
                      )
                    );
                    toast.success(t('aiSuite.seoApply'));
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5 me-1" />
                  {t('aiSuite.generate')}
                </Button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>SEO Title</Label>
                  <Input
                    value={page.seoTitle || ''}
                    onChange={(e) =>
                      setPages((prev) =>
                        prev.map((p) =>
                          p.slug === activeSlug ? { ...p, seoTitle: e.target.value } : p
                        )
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>SEO Description</Label>
                  <Textarea
                    value={page.seoDescription || ''}
                    onChange={(e) =>
                      setPages((prev) =>
                        prev.map((p) =>
                          p.slug === activeSlug ? { ...p, seoDescription: e.target.value } : p
                        )
                      )
                    }
                    rows={2}
                  />
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">{t('aiSuite.draftOnly')}</p>
            </div>

            {page.slug === 'about' && (
              <div className="space-y-4">
                <LocalizedFields
                  label="Hero title"
                  value={about.heroTitle}
                  onChange={(v) => updateContent({ heroTitle: v })}
                />
                <LocalizedFields
                  label="Hero subtitle"
                  value={about.heroSubtitle}
                  onChange={(v) => updateContent({ heroSubtitle: v })}
                  multiline
                />
                <LocalizedFields
                  label="Story title"
                  value={about.storyTitle}
                  onChange={(v) => updateContent({ storyTitle: v })}
                />
                <LocalizedFields
                  label="Story body"
                  value={about.storyBody}
                  onChange={(v) => updateContent({ storyBody: v })}
                  multiline
                />
                <div className="space-y-2">
                  <Label>Hero image URL</Label>
                  <Input
                    value={about.heroImage || ''}
                    onChange={(e) => updateContent({ heroImage: e.target.value })}
                  />
                </div>
              </div>
            )}

            {page.slug === 'contact' && (
              <div className="space-y-4">
                <LocalizedFields
                  label="Hero title"
                  value={contact.heroTitle}
                  onChange={(v) => updateContent({ heroTitle: v })}
                />
                <LocalizedFields
                  label="Hero subtitle"
                  value={contact.heroSubtitle}
                  onChange={(v) => updateContent({ heroSubtitle: v })}
                  multiline
                />
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Support email</Label>
                    <Input
                      value={contact.info?.email || ''}
                      onChange={(e) =>
                        updateContent({ info: { ...contact.info, email: e.target.value } })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Support phone</Label>
                    <Input
                      value={contact.info?.phone || ''}
                      onChange={(e) =>
                        updateContent({ info: { ...contact.info, phone: e.target.value } })
                      }
                    />
                  </div>
                </div>
                <LocalizedFields
                  label="Address"
                  value={contact.info?.address as LocalizedString}
                  onChange={(v) => updateContent({ info: { ...contact.info, address: v } })}
                />
                <LocalizedFields
                  label="Business hours"
                  value={contact.info?.hours as LocalizedString}
                  onChange={(v) => updateContent({ info: { ...contact.info, hours: v } })}
                />
              </div>
            )}

            {['privacy', 'terms', 'cookies'].includes(page.slug) && (
              <div className="space-y-4">
                <LocalizedFields
                  label="Title"
                  value={legal.title}
                  onChange={(v) => updateContent({ title: v })}
                />
                <LocalizedFields
                  label="Body"
                  value={legal.body}
                  onChange={(v) => updateContent({ body: v })}
                  multiline
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
