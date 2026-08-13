'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Lock, ShieldCheck } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { useSiteContent } from '@/hooks/use-site-content';
import { DEFAULT_PAYMENT_METHODS, pickLocalized, type PaymentsSectionContent } from '@/lib/cms-content';

const FALLBACK_METHODS = DEFAULT_PAYMENT_METHODS.map((m) => ({
  id: m.id,
  name: m.name,
  src: m.imageUrl,
}));

function PaymentBanner({ name, src }: { name: string; src: string }) {
  return (
    <div
      className="relative shrink-0 w-[190px] aspect-[19/12] sm:w-[228px] rounded-md overflow-hidden shadow-lg transition-transform duration-300 hover:scale-[1.04] hover:shadow-xl"
      title={name}
      role="img"
      aria-label={name}
    >
      <Image
        src={src}
        alt={name}
        fill
        unoptimized
        className="h-full w-full object-cover object-center"
        sizes="(max-width: 640px) 190px, 228px"
      />
    </div>
  );
}

export function PaymentMethodsBanner({ cmsContent }: { cmsContent?: unknown } = {}) {
  const { t, isRTL, locale } = useTranslation();
  const { data } = useSiteContent();
  const content = (cmsContent || {}) as PaymentsSectionContent;

  const methods = useMemo(() => {
    if (data?.paymentMethods?.length) {
      return data.paymentMethods.map((m) => ({
        id: m.id,
        name: m.name,
        src: m.imageUrl,
      }));
    }
    return FALLBACK_METHODS;
  }, [data?.paymentMethods]);

  const doubled = [...methods, ...methods];
  const badge = pickLocalized(content.badge, locale, t('paymentMethods.badge'));
  const title = pickLocalized(content.title, locale, t('paymentMethods.title'));
  const subtitle = pickLocalized(content.subtitle, locale, t('paymentMethods.subtitle'));

  return (
    <section className="relative py-14 lg:py-16 overflow-hidden bg-muted/30 dark:bg-zinc-950/50">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.06)_0%,transparent_70%)] pointer-events-none" />

      <div className="container mx-auto px-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-4">
            <ShieldCheck className="h-3.5 w-3.5" />
            {badge}
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h2>
          <p className="text-muted-foreground text-sm sm:text-base mt-2">{subtitle}</p>
        </motion.div>
      </div>

      <div className="relative mb-4 overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-16 sm:w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-16 sm:w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        <motion.div
          className="flex gap-4 w-max"
          animate={{ x: isRTL ? ['0%', '50%'] : ['0%', '-50%'] }}
          transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
        >
          {doubled.map((method, i) => (
            <PaymentBanner key={`${method.id}-${i}`} {...method} />
          ))}
        </motion.div>
      </div>

      <div className="relative overflow-hidden hidden sm:block">
        <div className="absolute inset-y-0 left-0 w-16 sm:w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-16 sm:w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        <motion.div
          className="flex gap-4 w-max"
          animate={{ x: isRTL ? ['50%', '0%'] : ['-50%', '0%'] }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        >
          {[...doubled].reverse().map((method, i) => (
            <PaymentBanner key={`rev-${method.id}-${i}`} {...method} />
          ))}
        </motion.div>
      </div>

      <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mt-8 px-4">
        <Lock className="h-3.5 w-3.5" />
        {t('paymentMethods.secure')}
      </p>
    </section>
  );
}
