'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Boxes,
  Bell,
  Car,
  Inbox,
  Layers,
  Sparkles,
  Users,
} from 'lucide-react';
import { useAdminTranslation } from '@/hooks/use-admin-translation';
import { AdminPageHeader, LuxuryCard } from '@/components/admin/layout/admin-ui';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AdminMetricRing,
  AdminStatsRow,
  AdminTrendChip,
  AdminSparkline,
  AdminEmptyState,
  AdminHighlightBox,
  AdminLoadingPulse,
  AdminSectionDivider,
  AdminBreadcrumb,
  AdminTabPillsDemo,
  AdminStatusBadge,
  AdminKeyValueGrid,
  AdminTagListDemo,
  AdminSearchBar,
  AdminFilterChips,
  AdminTimeline,
  AdminNotificationCard,
  AdminAvatarStack,
  AdminUserChip,
  AdminSplitPanel,
  AdminProgressSteps,
} from '@/components/admin/components';

function ComponentShowcase({
  index,
  name,
  nameAr,
  description,
  children,
}: {
  index: number;
  name: string;
  nameAr: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.35 }}
    >
      <LuxuryCard className="h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-amber-500/20 to-emerald-500/20 text-[10px] font-bold text-amber-600 dark:text-amber-400">
              {String(index).padStart(2, '0')}
            </span>
            <div>
              <CardTitle className="text-sm font-semibold">{nameAr}</CardTitle>
              <CardDescription className="text-[10px] font-mono">{name}</CardDescription>
            </div>
          </div>
          <p className="text-xs text-muted-foreground pt-1">{description}</p>
        </CardHeader>
        <CardContent className="pt-0">{children}</CardContent>
      </LuxuryCard>
    </motion.div>
  );
}

export default function AdminComponentsSection() {
  const { t, isRTL } = useAdminTranslation();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  return (
    <div className="space-y-8">
      <AdminPageHeader
        badge={t('components.badge')}
        title={t('components.title')}
        subtitle={t('components.subtitle')}
        actions={
          <Button variant="outline" size="sm" className="gap-1.5 border-amber-500/30">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            {t('components.count')}
          </Button>
        }
      />

      <LuxuryCard glow>
        <CardContent className="p-6">
          <AdminHighlightBox variant="info" title={t('components.hintTitle')}>
            {t('components.hintBody')}
          </AdminHighlightBox>
        </CardContent>
      </LuxuryCard>

      <AdminSectionDivider label={t('components.sectionMetrics')} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
        <ComponentShowcase index={1} name="AdminMetricRing" nameAr="حلقة المؤشر" description={t('components.desc.ring')}>
          <div className="flex justify-center py-2">
            <AdminMetricRing value={78} max={100} label={t('components.demo.completion')} sublabel="78 / 100" color="emerald" />
          </div>
        </ComponentShowcase>

        <ComponentShowcase index={2} name="AdminStatsRow" nameAr="شريط الإحصائيات" description={t('components.desc.statsRow')}>
          <AdminStatsRow
            items={[
              { label: t('components.demo.cars'), value: '3,101', accent: 'text-emerald-500' },
              { label: t('components.demo.users'), value: '248' },
              { label: t('components.demo.bookings'), value: '56' },
            ]}
          />
        </ComponentShowcase>

        <ComponentShowcase index={3} name="AdminTrendChip" nameAr="شارة الاتجاه" description={t('components.desc.trend')}>
          <div className="flex flex-wrap gap-2 py-2">
            <AdminTrendChip value={18.5} label={t('components.demo.monthly')} />
            <AdminTrendChip value={-4.2} />
          </div>
        </ComponentShowcase>

        <ComponentShowcase index={4} name="AdminSparkline" nameAr="مخطط مصغّر" description={t('components.desc.sparkline')}>
          <AdminSparkline data={[12, 28, 18, 42, 35, 58, 48, 62]} color="bg-emerald-500" height={40} />
        </ComponentShowcase>

        <ComponentShowcase index={5} name="AdminProgressSteps" nameAr="خطوات التقدم" description={t('components.desc.steps')}>
          <AdminProgressSteps
            steps={[t('components.demo.step1'), t('components.demo.step2'), t('components.demo.step3')]}
            current={1}
          />
        </ComponentShowcase>

        <ComponentShowcase index={6} name="AdminStatusBadge" nameAr="شارة الحالة" description={t('components.desc.status')}>
          <div className="flex flex-wrap gap-2 py-1">
            <AdminStatusBadge status="active" />
            <AdminStatusBadge status="pending" />
            <AdminStatusBadge status="sold" />
          </div>
        </ComponentShowcase>
      </div>

      <AdminSectionDivider label={t('components.sectionFeedback')} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
        <ComponentShowcase index={7} name="AdminEmptyState" nameAr="حالة فارغة" description={t('components.desc.empty')}>
          <AdminEmptyState
            icon={Inbox}
            title={t('components.demo.noData')}
            description={t('components.demo.noDataDesc')}
            action={<Button size="sm" variant="outline">{t('common.refresh')}</Button>}
          />
        </ComponentShowcase>

        <ComponentShowcase index={8} name="AdminHighlightBox" nameAr="صندوق التنبيه" description={t('components.desc.highlight')}>
          <div className="space-y-2">
            <AdminHighlightBox variant="success" title={t('components.demo.saved')}>
              {t('components.demo.savedDesc')}
            </AdminHighlightBox>
            <AdminHighlightBox variant="warning">{t('components.demo.warning')}</AdminHighlightBox>
          </div>
        </ComponentShowcase>

        <ComponentShowcase index={9} name="AdminLoadingPulse" nameAr="مؤشر التحميل" description={t('components.desc.loading')}>
          <AdminLoadingPulse label={t('common.loading')} />
        </ComponentShowcase>
      </div>

      <AdminSectionDivider label={t('components.sectionNav')} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
        <ComponentShowcase index={10} name="AdminSectionDivider" nameAr="فاصل الأقسام" description={t('components.desc.divider')}>
          <AdminSectionDivider label={t('components.demo.section')} />
        </ComponentShowcase>

        <ComponentShowcase index={11} name="AdminBreadcrumb" nameAr="مسار التنقل" description={t('components.desc.breadcrumb')}>
          <AdminBreadcrumb
            isRTL={isRTL}
            items={[
              { label: t('dashboard.panelTitle'), onClick: () => {} },
              { label: t('nav.cars'), onClick: () => {} },
              { label: t('components.demo.details') },
            ]}
          />
        </ComponentShowcase>

        <ComponentShowcase index={12} name="AdminTabPills" nameAr="تبويبات Pills" description={t('components.desc.tabs')}>
          <AdminTabPillsDemo />
        </ComponentShowcase>
      </div>

      <AdminSectionDivider label={t('components.sectionData')} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
        <ComponentShowcase index={13} name="AdminKeyValueGrid" nameAr="شبكة البيانات" description={t('components.desc.keyValue')}>
          <AdminKeyValueGrid
            items={[
              { key: t('components.demo.brand'), value: 'Toyota Camry' },
              { key: t('carDialog.price'), value: '450,000 EGP' },
              { key: t('carDialog.country'), value: 'Sudan' },
              { key: t('carDialog.status'), value: <AdminStatusBadge status="active" /> },
            ]}
          />
        </ComponentShowcase>

        <ComponentShowcase index={14} name="AdminTagList" nameAr="قائمة الوسوم" description={t('components.desc.tags')}>
          <AdminTagListDemo />
        </ComponentShowcase>

        <ComponentShowcase index={15} name="AdminFilterChips" nameAr="فلاتر سريعة" description={t('components.desc.filters')}>
          <AdminFilterChips
            options={[
              { id: 'all', label: t('common.all') },
              { id: 'suv', label: 'SUV' },
              { id: 'sedan', label: 'Sedan' },
            ]}
            selected={filter}
            onChange={setFilter}
          />
        </ComponentShowcase>

        <ComponentShowcase index={16} name="AdminSearchBar" nameAr="شريط البحث" description={t('components.desc.search')}>
          <AdminSearchBar
            value={search}
            onChange={setSearch}
            placeholder={t('cars.searchPlaceholder')}
            onSubmit={() => {}}
          />
        </ComponentShowcase>

        <ComponentShowcase index={17} name="AdminTimeline" nameAr="الخط الزمني" description={t('components.desc.timeline')}>
          <AdminTimeline
            events={[
              { title: t('components.demo.ev1'), time: '10:30', description: t('components.demo.ev1d'), color: 'bg-emerald-500' },
              { title: t('components.demo.ev2'), time: '09:15', color: 'bg-amber-500' },
            ]}
          />
        </ComponentShowcase>

        <ComponentShowcase index={18} name="AdminNotificationCard" nameAr="بطاقة إشعار" description={t('components.desc.notification')}>
          <AdminNotificationCard
            icon={Bell}
            title={t('components.demo.notifTitle')}
            message={t('components.demo.notifMsg')}
            time={t('components.demo.notifTime')}
            unread
          />
        </ComponentShowcase>
      </div>

      <AdminSectionDivider label={t('components.sectionSocial')} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
        <ComponentShowcase index={19} name="AdminAvatarStack" nameAr="مجموعة الصور" description={t('components.desc.avatars')}>
          <div className="flex items-center gap-4 py-2">
            <AdminAvatarStack
              users={[
                { name: 'Ahmed Hassan' },
                { name: 'Sara Mohamed' },
                { name: 'Omar Ali' },
                { name: 'Fatma Ibrahim' },
                { name: 'Admin User' },
              ]}
            />
            <AdminUserChip name="CIAR Admin" role={t('dashboard.adminRole')} />
          </div>
        </ComponentShowcase>

        <ComponentShowcase index={20} name="AdminSplitPanel" nameAr="لوحة مقسّمة" description={t('components.desc.split')}>
          <AdminSplitPanel
            sidebar={
              <div className="space-y-2 text-sm">
                <p className="font-semibold flex items-center gap-2">
                  <Layers className="h-4 w-4 text-emerald-500" />
                  {t('components.demo.sidebar')}
                </p>
                <p className="text-xs text-muted-foreground">{t('components.demo.sidebarDesc')}</p>
              </div>
            }
          >
            <div className="flex items-center justify-center h-full min-h-[120px] text-muted-foreground text-sm">
              <Car className="h-8 w-8 opacity-30 me-2" />
              {t('components.demo.mainPanel')}
            </div>
          </AdminSplitPanel>
        </ComponentShowcase>
      </div>

      <LuxuryCard>
        <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-emerald-600 flex items-center justify-center">
              <Boxes className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-semibold">{t('components.footerTitle')}</p>
              <p className="text-xs text-muted-foreground">{t('components.footerDesc')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">20 {t('components.footerCount')}</span>
          </div>
        </CardContent>
      </LuxuryCard>
    </div>
  );
}
