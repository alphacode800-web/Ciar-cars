'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Car,
  CalendarCheck,
  DollarSign,
  Eye,
  CreditCard,
  UserPlus,
  AlertCircle,
  RefreshCcw,
  Settings,
  ScrollText,
} from 'lucide-react';
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { getStats } from '@/lib/admin-api';
import { CURRENCY } from '@/lib/constants';
import { useAdminTranslation } from '@/hooks/use-admin-translation';
import { useAuthStore } from '@/store/auth-store';
import {
  AdminStatCard,
  AdminWelcomeBanner,
  AdminQuickAction,
  LuxuryCard,
} from '@/components/admin/layout/admin-ui';

// ============ TYPES ============

interface StatsData {
  users: {
    total: number;
    active: number;
    recentSignups: Array<{
      id: string;
      name: string | null;
      email: string;
      role: string;
      createdAt: string;
    }>;
  };
  listings: {
    total: number;
    active: number;
    pending: number;
  };
  bookings: {
    total: number;
    active: number;
    byStatus: Array<{
      status: string;
      count: number;
    }>;
  };
  revenue: {
    total: number;
  };
  cars: {
    byCondition: Array<{
      condition: string;
      count: number;
    }>;
  };
}

// ============ CHART CONFIGS ============

const revenueChartConfig: ChartConfig = {
  revenue: { label: 'Revenue', color: 'hsl(160, 60%, 45%)' },
  bookings: { label: 'Bookings', color: 'hsl(174, 60%, 51%)' },
};

const usersChartConfig: ChartConfig = {
  users: { label: 'New Users', color: 'hsl(160, 60%, 45%)' },
};

const conditionChartConfig: ChartConfig = {
  new: { label: 'New Cars', color: 'hsl(160, 60%, 45%)' },
  used: { label: 'Used Cars', color: 'hsl(24, 95%, 53%)' },
  certified: { label: 'Certified', color: 'hsl(174, 60%, 51%)' },
};

const bookingChartConfig: ChartConfig = {
  pending: { label: 'Pending', color: 'hsl(48, 96%, 53%)' },
  confirmed: { label: 'Confirmed', color: 'hsl(199, 89%, 48%)' },
  active: { label: 'Active', color: 'hsl(142, 71%, 45%)' },
  completed: { label: 'Completed', color: 'hsl(160, 60%, 45%)' },
  cancelled: { label: 'Cancelled', color: 'hsl(0, 84%, 60%)' },
  rejected: { label: 'Rejected', color: 'hsl(0, 72%, 51%)' },
};

// ============ HELPERS ============

function formatCompactNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString();
}

function formatCurrency(num: number): string {
  if (num >= 1_000_000) return `${CURRENCY.symbol}${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${CURRENCY.symbol}${(num / 1_000).toFixed(1)}K`;
  return `${CURRENCY.symbol}${num.toLocaleString()}`;
}

function getInitials(name: string | null | undefined): string {
  if (!name) return '??';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

// Generate mock weekly revenue data from total
function generateWeeklyRevenue(totalRevenue: number, totalBookings: number) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeklyRevenue = totalRevenue / 4; // approximate weekly
  const dailyBookingAvg = totalBookings / 30;

  return days.map((day, i) => ({
    day,
    revenue: Math.round(weeklyRevenue * (0.7 + Math.sin(i * 0.8) * 0.3)),
    bookings: Math.round(dailyBookingAvg * (0.6 + Math.cos(i * 0.7) * 0.4)),
  }));
}

// Generate monthly user signup data from recentSignups
function generateMonthlySignups(recentSignups: StatsData['users']['recentSignups']) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const monthCounts: Record<string, number> = {};

  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    monthCounts[key] = 0;
  }

  recentSignups.forEach((user) => {
    const d = new Date(user.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (key in monthCounts) {
      monthCounts[key]++;
    }
  });

  // Create monthly distribution
  const baseCount = recentSignups.length > 0 ? Math.ceil(recentSignups.length / 6) : 5;
  return months.slice(now.getMonth() - 5, now.getMonth() + 1).map((month, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    return {
      month,
      users: monthCounts[key] || Math.round(baseCount * (0.5 + Math.random() * 1)),
    };
  });
}

// Map booking status to chart colors
const BOOKING_STATUS_COLORS: Record<string, string> = {
  pending: 'hsl(48, 96%, 53%)',
  confirmed: 'hsl(199, 89%, 48%)',
  active: 'hsl(142, 71%, 45%)',
  completed: 'hsl(160, 60%, 45%)',
  cancelled: 'hsl(0, 84%, 60%)',
  rejected: 'hsl(0, 72%, 51%)',
};

const CONDITION_COLORS: Record<string, string> = {
  new: 'hsl(160, 60%, 45%)',
  used: 'hsl(24, 95%, 53%)',
  certified: 'hsl(174, 60%, 51%)',
};

// ============ STAT CARD SKELETON ============

function StatCardSkeleton() {
  return (
    <LuxuryCard>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-8 w-24 mb-1" />
        <Skeleton className="h-4 w-20" />
        <div className="mt-3 flex items-end gap-[3px] h-8">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Skeleton key={i} className="flex-1 rounded-sm" />
          ))}
        </div>
      </CardContent>
    </LuxuryCard>
  );
}

// ============ OVERVIEW SECTION ============

interface OverviewSectionProps {
  onNavigate: (section: string) => void;
}

export default function OverviewSection({ onNavigate }: OverviewSectionProps) {
  const { t } = useAdminTranslation();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getStats();
      if (res.success && res.data) {
        setStats(res.data as StatsData);
      } else {
        setError(res.error || t('overview.loadError'));
      }
    } catch {
      setError(t('overview.networkError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Derived chart data
  const revenueChartData = stats
    ? generateWeeklyRevenue(stats.revenue.total, stats.bookings.total)
    : [];

  const usersChartData = stats
    ? generateMonthlySignups(stats.users.recentSignups)
    : [];

  const conditionPieData = stats
    ? stats.cars.byCondition.map((c) => ({
        name: c.condition.charAt(0).toUpperCase() + c.condition.slice(1),
        value: c.count,
        fill: CONDITION_COLORS[c.condition] || 'hsl(0, 0%, 60%)',
      }))
    : [];

  const bookingPieData = stats
    ? stats.bookings.byStatus.map((b) => ({
        name: b.status.charAt(0).toUpperCase() + b.status.slice(1),
        value: b.count,
        fill: BOOKING_STATUS_COLORS[b.status] || 'hsl(0, 0%, 60%)',
      }))
    : [];

  // ============ LOADING STATE ============
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div>
          <Skeleton className="h-8 w-52 mb-2" />
          <Skeleton className="h-5 w-72" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LuxuryCard>
            <CardHeader>
              <Skeleton className="h-5 w-36 mb-1" />
              <Skeleton className="h-4 w-52" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[250px] w-full rounded-lg" />
            </CardContent>
          </LuxuryCard>
          <LuxuryCard>
            <CardHeader>
              <Skeleton className="h-5 w-28 mb-1" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[250px] w-full rounded-lg" />
            </CardContent>
          </LuxuryCard>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <LuxuryCard key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-40 mb-1" />
                <Skeleton className="h-4 w-56" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[220px] w-full rounded-lg" />
              </CardContent>
            </LuxuryCard>
          ))}
        </div>
      </motion.div>
    );
  }

  // ============ ERROR STATE ============
  if (error || !stats) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20"
      >
        <div className="p-4 rounded-full bg-red-100 dark:bg-red-950/30 mb-4">
          <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{t('overview.loadError')}</h3>
        <p className="text-muted-foreground text-sm mb-6 max-w-md text-center">
          {error || t('overview.networkError')}
        </p>
        <Button
          onClick={fetchStats}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/20"
        >
          <RefreshCcw className="w-4 h-4 me-2" />
          {t('overview.tryAgain')}
        </Button>
      </motion.div>
    );
  }

  // ============ MAIN CONTENT ============
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 lg:space-y-8"
    >
      <AdminWelcomeBanner
        greeting={`${t('overview.welcome')}${user?.name ? `، ${user.name.split(' ')[0]}` : ''}`}
        subtitle={t('overview.subtitle')}
        stats={[
          { label: t('overview.pendingListings'), value: String(stats.listings.pending) },
          { label: t('overview.activeListings'), value: String(stats.listings.active) },
          { label: t('overview.activeRentals'), value: String(stats.bookings.active) },
        ]}
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">
        <AdminStatCard
          label={t('overview.totalUsers')}
          value={formatCompactNumber(stats.users.total)}
          change="+12.5%"
          icon={Users}
          accent="emerald"
          delay={0.1}
        />
        <AdminStatCard
          label={t('overview.totalListings')}
          value={formatCompactNumber(stats.listings.total)}
          change="+8.2%"
          icon={Car}
          accent="teal"
          delay={0.15}
        />
        <AdminStatCard
          label={t('overview.activeRentals')}
          value={String(stats.bookings.active)}
          change="+23.1%"
          icon={CalendarCheck}
          accent="cyan"
          delay={0.2}
        />
        <AdminStatCard
          label={t('overview.revenue')}
          value={formatCurrency(stats.revenue.total)}
          change="+18.7%"
          icon={DollarSign}
          accent="amber"
          delay={0.25}
        />
      </div>

      {/* Charts Row - Revenue & Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <LuxuryCard>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t('overview.revenueChart')}</CardTitle>
              <CardDescription>{t('overview.revenueChartDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={revenueChartConfig} className="h-[250px] w-full">
                <AreaChart data={revenueChartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fillRevenueOverview" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(160, 60%, 45%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(160, 60%, 45%)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(160, 60%, 45%)"
                    fill="url(#fillRevenueOverview)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </LuxuryCard>
        </motion.div>

        {/* New Users Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <LuxuryCard>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t('overview.newUsers')}</CardTitle>
              <CardDescription>{t('overview.newUsersDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={usersChartConfig} className="h-[250px] w-full">
                <BarChart data={usersChartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="users"
                    fill="hsl(160, 60%, 45%)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </LuxuryCard>
        </motion.div>
      </div>

      {/* Pie Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.4 }}
        >
          <LuxuryCard>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t('overview.listingsByCondition')}</CardTitle>
              <CardDescription>{t('overview.listingsByConditionDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              {conditionPieData.length > 0 ? (
                <ChartContainer config={conditionChartConfig} className="h-[220px] w-full">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie
                      data={conditionPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {conditionPieData.map((entry, index) => (
                        <Cell key={`cond-cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                  </PieChart>
                </ChartContainer>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                  {t('overview.noData')}
                </div>
              )}
            </CardContent>
          </LuxuryCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.4 }}
        >
          <LuxuryCard>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t('overview.bookingsByStatus')}</CardTitle>
              <CardDescription>{t('overview.bookingsByStatusDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              {bookingPieData.length > 0 ? (
                <ChartContainer config={bookingChartConfig} className="h-[220px] w-full">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie
                      data={bookingPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {bookingPieData.map((entry, index) => (
                        <Cell key={`book-cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                  </PieChart>
                </ChartContainer>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                  {t('overview.noData')}
                </div>
              )}
            </CardContent>
          </LuxuryCard>
        </motion.div>
      </div>

      {/* Activity Feed & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.4 }}
          className="lg:col-span-2"
        >
          <LuxuryCard>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t('overview.recentActivity')}</CardTitle>
              <CardDescription>{t('overview.recentActivityDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.users.recentSignups.length > 0 ? (
                  stats.users.recentSignups.map((user, idx) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.95 + idx * 0.05, duration: 0.3 }}
                      className="flex items-start gap-3"
                    >
                      <div className="mt-0.5 p-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                        <UserPlus className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-medium">{user.name || user.email}</span>{' '}
                          {t('overview.createdAccount')}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-muted-foreground">{timeAgo(user.createdAt)}</p>
                          <span className="text-xs text-muted-foreground">•</span>
                          <p className="text-xs text-muted-foreground capitalize">{user.role.replace('_', ' ')}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    {t('overview.noActivity')}
                  </div>
                )}
              </div>
            </CardContent>
          </LuxuryCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.4 }}
        >
          <LuxuryCard>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t('overview.quickActions')}</CardTitle>
              <CardDescription>{t('overview.quickActionsDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <AdminQuickAction
                icon={Eye}
                title={t('overview.pendingCars')}
                subtitle={`${stats.listings.pending} ${t('overview.pendingReview')}`}
                onClick={() => onNavigate('cars')}
                accent="amber"
              />
              <AdminQuickAction
                icon={CalendarCheck}
                title={t('overview.processBookings')}
                subtitle={`${stats.bookings.active} ${t('overview.activeBookings')}`}
                onClick={() => onNavigate('bookings')}
                accent="teal"
              />
              <AdminQuickAction
                icon={Users}
                title={t('overview.manageUsers')}
                subtitle={`${formatCompactNumber(stats.users.total)} ${t('overview.totalUsersShort')}`}
                onClick={() => onNavigate('users')}
                accent="emerald"
              />
              <AdminQuickAction
                icon={CreditCard}
                title={t('overview.viewPayments')}
                subtitle={formatCurrency(stats.revenue.total)}
                onClick={() => onNavigate('payments')}
                accent="cyan"
              />
              <AdminQuickAction
                icon={Settings}
                title={t('overview.platformSettings')}
                subtitle={t('overview.configurePlatform')}
                onClick={() => onNavigate('settings')}
                accent="slate"
              />
              <AdminQuickAction
                icon={ScrollText}
                title={t('overview.viewAudit')}
                subtitle={t('overview.auditDesc')}
                onClick={() => onNavigate('audit')}
                accent="emerald"
              />
            </CardContent>
          </LuxuryCard>
        </motion.div>
      </div>
    </motion.div>
  );
}
