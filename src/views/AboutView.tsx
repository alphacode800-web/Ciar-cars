'use client';

import { motion } from 'framer-motion';
import {
  Car,
  Shield,
  Users,
  Award,
  Target,
  Heart,
  Eye,
  Zap,
  ArrowRight,
  Star,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/store/app-store';
import { cn } from '@/lib/utils';
import { PageHero } from '@/components/ui/page-hero';
import { PAGE_HERO_IMAGES, TEAM_PORTRAITS } from '@/lib/car-images';

// ============ Team Members ============

const TEAM_MEMBERS = [
  {
    name: 'Ahmed El-Sayed',
    role: 'CEO & Founder',
    bio: 'Automotive industry veteran with 15+ years of experience in digital transformation.',
    avatar: TEAM_PORTRAITS[0],
  },
  {
    name: 'Sarah Hassan',
    role: 'CTO',
    bio: 'Full-stack engineer passionate about building scalable platforms for the automotive market.',
    avatar: TEAM_PORTRAITS[1],
  },
  {
    name: 'Mohamed Ali',
    role: 'Head of Operations',
    bio: 'Operations expert ensuring seamless experiences for buyers and sellers around the world.',
    avatar: TEAM_PORTRAITS[2],
  },
  {
    name: 'Nour El-Din',
    role: 'Head of Design',
    bio: 'UX/UI designer crafting intuitive interfaces that make car buying a pleasure.',
    avatar: TEAM_PORTRAITS[3],
  },
];

// ============ Values ============

const VALUES = [
  {
    icon: Shield,
    title: 'Trust & Transparency',
    description:
      'Every listing is verified. We provide detailed vehicle history reports and secure payment processing to protect both buyers and sellers.',
  },
  {
    icon: Heart,
    title: 'Customer First',
    description:
      'Our support team is available around the clock to help you at every step of your car buying or selling journey.',
  },
  {
    icon: Zap,
    title: 'Innovation',
    description:
      'We leverage cutting-edge technology to make the car marketplace experience faster, smarter, and more enjoyable.',
  },
  {
    icon: Award,
    title: 'Quality Standards',
    description:
      'From vehicle inspections to seller verification, we maintain the highest quality standards across our platform.',
  },
];

// ============ Stats ============

const STATS = [
  { label: 'Cars Listed', value: '12,500+', icon: Car },
  { label: 'Happy Customers', value: '50,000+', icon: Users },
  { label: 'Successful Rentals', value: '8,000+', icon: Star },
  { label: 'Cities Covered', value: '25+', icon: Eye },
];

// ============ Animation Variants ============

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.1 } },
  viewport: { once: true },
};

const staggerItem = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4 },
};

// ============ Section Wrapper ============

function Section({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn('py-16 md:py-24', className)}>{children}</section>;
}

function SectionHeader({
  badge,
  title,
  description,
  align = 'center',
}: {
  badge?: string;
  title: string;
  description?: string;
  align?: 'center' | 'left';
}) {
  return (
    <div
      className={cn(
        'mb-12',
        align === 'center' && 'text-center',
        align === 'left' && 'text-left'
      )}
    >
      {badge && (
        <Badge variant="secondary" className="mb-3">
          {badge}
        </Badge>
      )}
      <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
      {description && (
        <p
          className={cn(
            'mt-3 text-lg text-muted-foreground max-w-2xl',
            align === 'center' && 'mx-auto'
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}

// ============ Main Component ============

export default function AboutView() {
  const { setView } = useAppStore();

  return (
    <div className="min-h-screen">
      <PageHero
        badge="About CIAR Cars"
        title={
          <>
            The World&apos;s Premier{' '}
            <span className="text-emerald-600 dark:text-emerald-400">Car Marketplace</span>
          </>
        }
        subtitle="We're on a mission to make buying, selling, and renting cars worldwide as easy, transparent, and enjoyable as possible."
        image={PAGE_HERO_IMAGES.about}
      />

      {/* ========== Story Section ========== */}
      <Section>
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            <motion.div {...fadeInUp}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop&q=80"
                  alt="CIAR Cars story"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
              </div>
            </motion.div>

            <motion.div {...fadeInUp} transition={{ delay: 0.15 }}>
              <Badge variant="secondary" className="mb-3">
                Our Story
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Built for the world, by car enthusiasts
              </h2>
              <div className="mt-6 space-y-4 text-muted-foreground">
                <p>
                  CIAR Cars was founded in 2023 with a simple vision: transform the way
                  people buy and sell cars. The traditional car market was
                  fragmented, opaque, and often frustrating for both buyers and sellers.
                </p>
                <p>
                  We saw an opportunity to leverage technology to bring transparency,
                  trust, and efficiency to every transaction. From detailed vehicle
                  inspections to secure digital payments, we&apos;ve built a platform
                  that puts the customer first.
                </p>
                <p>
                  Today, CIAR Cars serves thousands of customers around the world, with
                  listings spanning every major city and covering all vehicle types
                  from budget-friendly sedans to luxury SUVs.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* ========== Mission & Values ========== */}
      <Section className="bg-muted/30">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <SectionHeader
            badge="Our Values"
            title="What Drives Us"
            description="These core values guide every decision we make and every feature we build."
          />

          <motion.div
            className="grid grid-cols-1 gap-6 md:grid-cols-2"
            {...staggerContainer}
          >
            {VALUES.map((value) => {
              const Icon = value.icon;
              return (
                <motion.div key={value.title} {...staggerItem}>
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <CardContent className="p-6">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="mb-2 text-lg font-semibold">{value.title}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </Section>

      {/* ========== Statistics ========== */}
      <Section>
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <SectionHeader
            badge="By The Numbers"
            title="Growing Every Day"
            description="Our platform continues to expand, connecting more car enthusiasts around the world."
          />

          <motion.div
            className="grid grid-cols-2 gap-6 md:grid-cols-4"
            {...staggerContainer}
          >
            {STATS.map((stat) => {
              const Icon = stat.icon;
              return (
                <motion.div key={stat.label} {...staggerItem}>
                  <Card className="text-center">
                    <CardContent className="p-6">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <p className="text-3xl font-bold text-primary">{stat.value}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </Section>

      {/* ========== Team Section ========== */}
      <Section className="bg-muted/30">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <SectionHeader
            badge="Our Team"
            title="Meet the People Behind CIAR"
            description="A passionate team dedicated to revolutionizing the car marketplace worldwide."
          />

          <motion.div
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
            {...staggerContainer}
          >
            {TEAM_MEMBERS.map((member) => (
              <motion.div key={member.name} {...staggerItem}>
                <Card className="overflow-hidden transition-shadow hover:shadow-md">
                  <div className="aspect-square bg-muted">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4 text-center">
                    <h3 className="font-semibold">{member.name}</h3>
                    <p className="text-xs text-primary font-medium">{member.role}</p>
                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                      {member.bio}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ========== CTA Section ========== */}
      <Section>
        <div className="mx-auto max-w-3xl px-4 text-center md:px-6">
          <motion.div {...fadeInUp}>
            <Card className="overflow-hidden">
              <div className="relative bg-gradient-to-r from-primary via-primary/90 to-primary p-8 md:p-12">
                <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-white/10" />
                <div className="absolute -left-4 -top-4 h-20 w-20 rounded-full bg-white/5" />

                <div className="relative">
                  <h2 className="text-3xl font-bold text-primary-foreground md:text-4xl">
                    Ready to Get Started?
                  </h2>
                  <p className="mx-auto mt-3 max-w-lg text-primary-foreground/80">
                    Whether you&apos;re buying your dream car, selling your current one,
                    or looking to rent &mdash; CIAR Cars has you covered.
                  </p>
                  <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <Button
                      size="lg"
                      variant="secondary"
                      className="gap-2 bg-white text-primary hover:bg-white/90"
                      onClick={() => setView('listing')}
                    >
                      Browse Cars
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="gap-2 border-white/30 bg-transparent text-primary-foreground hover:bg-white/10"
                      onClick={() => setView('sell-car')}
                    >
                      Sell Your Car
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </Section>
    </div>
  );
}
