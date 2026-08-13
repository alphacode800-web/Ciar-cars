'use client';

import { motion } from 'framer-motion';
import { Shield, FileText, Cookie, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PageHero } from '@/components/ui/page-hero';
import { useAppStore } from '@/store/app-store';
import { useSiteContent, getPageContent } from '@/hooks/use-site-content';
import { useTranslation } from '@/hooks/use-translation';
import {
  defaultLegalContent,
  pickLocalized,
  type LegalPageContent,
  type PageSlug,
} from '@/lib/cms-content';
import type { AppView } from '@/types';
import { cn } from '@/lib/utils';

type LegalSlug = Extract<PageSlug, 'privacy' | 'terms' | 'cookies'>;

const LEGAL_META: Record<
  LegalSlug,
  {
    icon: typeof Shield;
    footerKey: string;
    defaultTitleEn: string;
    defaultTitleAr: string;
    image: string;
  }
> = {
  privacy: {
    icon: Shield,
    footerKey: 'footer.privacyPolicy',
    defaultTitleEn: 'Privacy Policy',
    defaultTitleAr: 'سياسة الخصوصية',
    image:
      'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1600&h=600&fit=crop&q=80',
  },
  terms: {
    icon: FileText,
    footerKey: 'footer.termsOfService',
    defaultTitleEn: 'Terms of Service',
    defaultTitleAr: 'الشروط والأحكام',
    image:
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1600&h=600&fit=crop&q=80',
  },
  cookies: {
    icon: Cookie,
    footerKey: 'footer.cookiePolicy',
    defaultTitleEn: 'Cookie Policy',
    defaultTitleAr: 'سياسة ملفات تعريف الارتباط',
    image:
      'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1600&h=600&fit=crop&q=80',
  },
};

function isPlaceholderBody(body: string): boolean {
  return (
    !body.trim() ||
    body.includes('can be edited from the admin panel') ||
    body.includes('يمكن تحرير محتوى هذه الصفحة')
  );
}

function renderBody(body: string) {
  const blocks = body
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  return blocks.map((block, index) => {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    const isHeading =
      lines.length === 1 &&
      (/^\d+\.\s/.test(lines[0]) || lines[0].length < 80);

    if (isHeading && /^\d+\.\s/.test(lines[0])) {
      return (
        <h2
          key={index}
          className="text-xl font-semibold tracking-tight text-foreground mt-8 mb-3 first:mt-0"
        >
          {lines[0]}
        </h2>
      );
    }

    return (
      <p
        key={index}
        className="text-muted-foreground leading-relaxed whitespace-pre-line"
      >
        {lines.join('\n')}
      </p>
    );
  });
}

export default function LegalPageView({ slug }: { slug: LegalSlug }) {
  const { setView } = useAppStore();
  const { t, locale, isRTL } = useTranslation();
  const { data, loading } = useSiteContent();
  const meta = LEGAL_META[slug];
  const Icon = meta.icon;

  const defaults = defaultLegalContent(meta.defaultTitleEn, meta.defaultTitleAr);
  const cms = getPageContent<LegalPageContent>(data, slug);

  const title = pickLocalized(
    cms?.title,
    locale,
    pickLocalized(defaults.title, locale, t(meta.footerKey))
  );

  let body = pickLocalized(cms?.body, locale, '');
  if (isPlaceholderBody(body)) {
    body = pickLocalized(defaults.body, locale, '');
  }

  const related: { slug: LegalSlug; label: string }[] = (
    [
      { slug: 'privacy', label: t('footer.privacyPolicy') },
      { slug: 'terms', label: t('footer.termsOfService') },
      { slug: 'cookies', label: t('footer.cookiePolicy') },
    ] as const
  ).filter((item) => item.slug !== slug);

  return (
    <div className="min-h-screen bg-background">
      <PageHero title={title} image={meta.image} compact badge={t('common.appName')} />

      <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('common.appName')}
                </p>
                <h2 className="text-lg font-semibold">{title}</h2>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView('home')}
              className="gap-2"
            >
              <ArrowLeft className={cn('h-4 w-4', isRTL && 'rotate-180')} />
              {t('nav.home')}
            </Button>
          </div>

          <Separator className="mb-8" />

          {loading && !body ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-5/6" />
            </div>
          ) : (
            <article className="space-y-4 prose-legal">{renderBody(body)}</article>
          )}

          <Separator className="my-10" />

          <div className="flex flex-wrap gap-2">
            {related.map((item) => (
              <Button
                key={item.slug}
                variant="outline"
                size="sm"
                onClick={() => setView(item.slug as AppView)}
              >
                {item.label}
              </Button>
            ))}
            <Button variant="secondary" size="sm" onClick={() => setView('contact')}>
              {t('nav.contact')}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
