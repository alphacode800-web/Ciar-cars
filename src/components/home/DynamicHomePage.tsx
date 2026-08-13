'use client';

import React from 'react';
import { HeroSection } from '@/components/home/HeroSection';
import { BannerSection } from '@/components/home/BannerSection';
import { LuxuryGalleryStrip } from '@/components/home/LuxuryGalleryStrip';
import { FeaturedCarsSection } from '@/components/home/FeaturedCarsSection';
import { StatsSection } from '@/components/home/StatsSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { CTASection } from '@/components/home/CTASection';
import { PaymentMethodsBanner } from '@/components/home/PaymentMethodsBanner';
import { AiRecommendationsStrip } from '@/components/ai/AiRecommendationsStrip';
import { FeaturedAdsSection } from '@/components/home/FeaturedAdsSection';
import { useSiteContent } from '@/hooks/use-site-content';
import { Skeleton } from '@/components/ui/skeleton';
import type { HomepageSectionType } from '@/lib/cms-content';

const FALLBACK_ORDER: HomepageSectionType[] = [
  'hero',
  'featured_cars',
  'banner',
  'gallery',
  'stats',
  'testimonials',
  'payments',
  'cta',
];

function renderSection(type: string, key: string, content?: unknown) {
  switch (type) {
    case 'hero':
      return <HeroSection key={key} cmsContent={content} />;
    case 'banner':
      return <BannerSection key={key} />;
    case 'gallery':
      return <LuxuryGalleryStrip key={key} cmsContent={content} />;
    case 'featured_cars':
      return (
        <React.Fragment key={key}>
          <FeaturedCarsSection cmsContent={content} />
          <FeaturedAdsSection />
          <AiRecommendationsStrip />
        </React.Fragment>
      );
    case 'categories':
      // Categories are currently rendered inside other sections; keep featured as closest
      return <FeaturedCarsSection key={key} cmsContent={content} />;
    case 'stats':
      return <StatsSection key={key} cmsContent={content} />;
    case 'testimonials':
      return <TestimonialsSection key={key} cmsContent={content} />;
    case 'payments':
      return <PaymentMethodsBanner key={key} cmsContent={content} />;
    case 'cta':
      return <CTASection key={key} cmsContent={content} />;
    default:
      return null;
  }
}

export function DynamicHomePage() {
  const { data, loading } = useSiteContent();

  if (loading && !data) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-[50vh] w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  }

  const sections = data?.homepageSections?.length
    ? data.homepageSections
    : FALLBACK_ORDER.map((type, order) => ({
        id: type,
        type,
        order,
        isActive: true,
        content: undefined,
      }));

  const nodes: React.ReactNode[] = [];
  for (const section of sections) {
    nodes.push(renderSection(section.type, section.id, section.content));
  }

  // If CMS has no featured_cars section, still show featured ads
  if (!sections.some((s) => s.type === 'featured_cars')) {
    nodes.push(<FeaturedAdsSection key="featured-ads-fallback" />);
  }

  return <>{nodes}</>;
}
