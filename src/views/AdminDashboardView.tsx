'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  Users,
  Car,
  CalendarCheck,
  CreditCard,
  Settings,
  LayoutDashboard,
  Home,
  Navigation,
  ScrollText,
  Palette,
  LogOut,
  ArrowLeft,
  Bell,
  Menu,
  Languages,
  PanelLeftClose,
  PanelLeft,
  Search,
  Crown,
  Sparkles,
  ChevronLeft,
  Boxes,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuthStore } from '@/store/auth-store';
import { useAppStore } from '@/store/app-store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ADMIN_LOGIN_PATH, isAdminRole, syncAuthStoreFromSession } from '@/lib/auth-helpers';
import { useAdminTranslation } from '@/hooks/use-admin-translation';

import OverviewSection from '@/components/admin/OverviewSection';
import UsersSection from '@/components/admin/UsersSection';
import CarsSection from '@/components/admin/CarsSection';
import BookingsSection from '@/components/admin/BookingsSection';
import PaymentsSection from '@/components/admin/PaymentsSection';
import SettingsSection from '@/components/admin/SettingsSection';
import HomepageBuilderSection from '@/components/admin/HomepageBuilderSection';
import NavigationSection from '@/components/admin/NavigationSection';
import AuditLogsSection from '@/components/admin/AuditLogsSection';
import AppearanceSection from '@/components/admin/AppearanceSection';
import AdminComponentsSection from '@/components/admin/AdminComponentsSection';

type AdminSection =
  | 'overview'
  | 'users'
  | 'cars'
  | 'bookings'
  | 'payments'
  | 'settings'
  | 'appearance'
  | 'homepage'
  | 'navigation'
  | 'audit'
  | 'components';

const navKeyMap = {
  overview: 'nav.overview',
  users: 'nav.users',
  cars: 'nav.cars',
  bookings: 'nav.bookings',
  payments: 'nav.payments',
  settings: 'nav.settings',
  appearance: 'nav.appearance',
  homepage: 'nav.homepage',
  navigation: 'nav.navigation',
  audit: 'nav.audit',
  components: 'nav.components',
} as const;

type NavKey = keyof typeof navKeyMap;

interface NavItemDef {
  id: AdminSection;
  labelKey: NavKey;
  icon: React.ElementType;
}

const navGroups: { groupKey: string; items: NavItemDef[] }[] = [
  {
    groupKey: 'navGroup.main',
    items: [{ id: 'overview', labelKey: 'overview', icon: LayoutDashboard }],
  },
  {
    groupKey: 'navGroup.management',
    items: [
      { id: 'users', labelKey: 'users', icon: Users },
      { id: 'cars', labelKey: 'cars', icon: Car },
      { id: 'bookings', labelKey: 'bookings', icon: CalendarCheck },
      { id: 'payments', labelKey: 'payments', icon: CreditCard },
    ],
  },
  {
    groupKey: 'navGroup.content',
    items: [
      { id: 'appearance', labelKey: 'appearance', icon: Palette },
      { id: 'homepage', labelKey: 'homepage', icon: Home },
      { id: 'navigation', labelKey: 'navigation', icon: Navigation },
    ],
  },
  {
    groupKey: 'navGroup.system',
    items: [
      { id: 'components', labelKey: 'components', icon: Boxes },
      { id: 'settings', labelKey: 'settings', icon: Settings },
      { id: 'audit', labelKey: 'audit', icon: ScrollText },
    ],
  },
];

function roleLabel(role: string, t: (k: string) => string): string {
  if (role === 'super_admin') return t('dashboard.superAdmin');
  if (role === 'admin') return t('dashboard.adminRole');
  return role;
}

export default function AdminDashboardView() {
  const router = useRouter();
  const { user, logout, setUser } = useAuthStore();
  const { setView } = useAppStore();
  const { t, locale, setLocale, isRTL, ready } = useAdminTranslation();
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function verifyAdminAccess() {
      let currentUser = user;
      if (!currentUser) currentUser = await syncAuthStoreFromSession(setUser);
      if (cancelled) return;
      if (!currentUser || !isAdminRole(currentUser.role)) {
        router.replace(ADMIN_LOGIN_PATH);
        return;
      }
      setAuthChecked(true);
    }
    verifyAdminAccess();
    return () => { cancelled = true; };
  }, [user, setUser, router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
    } catch { /* ignore */ }
    logout();
    setView('home');
    toast.success(t('common.loggedOut'));
    router.push(ADMIN_LOGIN_PATH);
  };

  if (!authChecked || !user || !isAdminRole(user.role) || !ready) return null;

  const sectionLabel = t(navKeyMap[activeSection]);
  const sidebarWide = !collapsed;

  const filteredGroups = searchQuery.trim()
    ? navGroups
        .map((g) => ({
          ...g,
          items: g.items.filter((item) =>
            t(navKeyMap[item.labelKey]).toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter((g) => g.items.length > 0)
    : navGroups;

  const renderSection = () => {
    switch (activeSection) {
      case 'overview': return <OverviewSection onNavigate={(s) => setActiveSection(s as AdminSection)} />;
      case 'users': return <UsersSection />;
      case 'cars': return <CarsSection />;
      case 'bookings': return <BookingsSection />;
      case 'payments': return <PaymentsSection />;
      case 'settings': return <SettingsSection />;
      case 'appearance': return <AppearanceSection />;
      case 'homepage': return <HomepageBuilderSection />;
      case 'navigation': return <NavigationSection />;
      case 'audit': return <AuditLogsSection />;
      case 'components': return <AdminComponentsSection />;
      default: return <OverviewSection onNavigate={(s) => setActiveSection(s as AdminSection)} />;
    }
  };

  const NavButton = ({ item }: { item: NavItemDef }) => {
    const isActive = activeSection === item.id;
    const Icon = item.icon;
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => {
                setActiveSection(item.id);
                setMobileOpen(false);
              }}
              className={cn(
                'relative w-full flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200',
                sidebarWide ? 'px-3 py-2.5' : 'px-2 py-2.5 justify-center',
                isActive
                  ? 'bg-gradient-to-l from-emerald-500/20 to-amber-500/10 text-emerald-700 dark:text-emerald-300 shadow-inner border border-emerald-500/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent'
              )}
            >
              {isActive && (
                <span
                  className={cn(
                    'absolute top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-gradient-to-b from-amber-400 to-emerald-500',
                    isRTL ? 'right-0' : 'left-0'
                  )}
                />
              )}
              <Icon className={cn('h-[18px] w-[18px] shrink-0', isActive && 'text-emerald-500')} />
              {sidebarWide && <span className="truncate">{t(navKeyMap[item.labelKey])}</span>}
            </button>
          </TooltipTrigger>
          {!sidebarWide && (
            <TooltipContent side={isRTL ? 'left' : 'right'}>{t(navKeyMap[item.labelKey])}</TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div
      className="flex min-h-[calc(100vh-64px)] overflow-hidden bg-background"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Ambient background */}
      <div className="fixed inset-0 top-16 pointer-events-none -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.12),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_100%_100%,rgba(245,158,11,0.06),transparent)]" />
        <div
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 top-16 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* ─── Sidebar ─── */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 z-50 flex flex-col transition-all duration-300 ease-out top-16',
          'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950',
          'border-white/5 shadow-2xl shadow-black/40',
          isRTL ? 'right-0 border-l' : 'left-0 border-r',
          sidebarWide ? 'w-[280px]' : 'w-[72px]',
          mobileOpen ? 'translate-x-0' : isRTL ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand */}
        <div className={cn('flex items-center gap-3 p-4 border-b border-white/5', !sidebarWide && 'justify-center px-2')}>
          <div className="relative shrink-0">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 via-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <Sparkles className="absolute -top-1 -right-1 h-3.5 w-3.5 text-amber-400" />
          </div>
          {sidebarWide && (
            <div className="min-w-0">
              <p className="font-bold text-sm text-white tracking-tight">CIAR Cars</p>
              <p className="text-[10px] text-emerald-400/80 font-medium">{t('dashboard.panelTitle')}</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn('h-8 w-8 text-white/60 hover:text-white hover:bg-white/10', sidebarWide ? 'mr-auto' : 'hidden lg:flex')}
            onClick={() => setCollapsed((c) => !c)}
          >
            {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>
        </div>

        {/* Sidebar search */}
        {sidebarWide && (
          <div className="px-3 pt-3">
            <div className="relative">
              <Search className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30 start-3" />
              <Input
                placeholder={t('dashboard.searchNav')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 ps-9 bg-white/5 border-white/10 text-white placeholder:text-white/30 text-xs rounded-xl focus-visible:ring-emerald-500/30"
              />
            </div>
          </div>
        )}

        <ScrollArea className="flex-1 py-3 px-2">
          <nav className="space-y-5">
            {filteredGroups.map((group) => (
              <div key={group.groupKey}>
                {sidebarWide && (
                  <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/30">
                    {t(group.groupKey)}
                  </p>
                )}
                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <NavButton key={item.id} item={item} />
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* User + footer */}
        <div className="border-t border-white/5 p-3 space-y-2">
          {sidebarWide && user && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 mb-2">
              <div className="flex items-center gap-2.5">
                <Avatar className="h-9 w-9 ring-2 ring-amber-500/30 ring-offset-2 ring-offset-slate-900">
                  <AvatarFallback className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white text-xs font-bold">
                    {user.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'A'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                  <Badge variant="outline" className="mt-0.5 text-[9px] h-4 border-amber-500/30 text-amber-400 bg-amber-500/10 px-1.5">
                    {roleLabel(user.role, t)}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setView('home')}
                  className={cn(
                    'w-full flex items-center gap-3 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors',
                    sidebarWide ? 'px-3 py-2' : 'px-2 py-2 justify-center'
                  )}
                >
                  <ArrowLeft className={cn('h-4 w-4 shrink-0', isRTL && 'rotate-180')} />
                  {sidebarWide && <span>{t('common.backToSite')}</span>}
                </button>
              </TooltipTrigger>
              {!sidebarWide && <TooltipContent side={isRTL ? 'left' : 'right'}>{t('common.backToSite')}</TooltipContent>}
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleLogout}
                  className={cn(
                    'w-full flex items-center gap-3 rounded-xl text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-colors',
                    sidebarWide ? 'px-3 py-2' : 'px-2 py-2 justify-center'
                  )}
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  {sidebarWide && <span>{t('common.logout')}</span>}
                </button>
              </TooltipTrigger>
              {!sidebarWide && <TooltipContent side={isRTL ? 'left' : 'right'}>{t('common.logout')}</TooltipContent>}
            </Tooltip>
          </TooltipProvider>
        </div>
      </aside>

      {/* ─── Main ─── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="sticky top-0 z-30 h-16 border-b border-border/40 bg-background/70 backdrop-blur-xl flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" className="h-9 w-9 lg:hidden shrink-0" onClick={() => setMobileOpen(true)}>
              <Menu className="h-4 w-4" />
            </Button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider">
                <BarChart3 className="h-3 w-3" />
                <span>{t('dashboard.panelTitle')}</span>
                <ChevronLeft className={cn('h-3 w-3 opacity-50', !isRTL && 'rotate-180')} />
                <span className="text-emerald-600 dark:text-emerald-400">{sectionLabel}</span>
              </div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight truncate">{sectionLabel}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs border-amber-500/20 hover:border-amber-500/40 hover:bg-amber-500/5 hidden sm:flex"
              onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
            >
              <Languages className="h-3.5 w-3.5" />
              {locale === 'ar' ? t('common.languageEn') : t('common.languageAr')}
            </Button>

            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 relative">
                    <Bell className="h-4 w-4" />
                    <span className="absolute top-1.5 end-1.5 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-background" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t('dashboard.notifications')}</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="hidden md:flex items-center gap-2 ps-2 border-s border-border/50">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-[10px] bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold">
                  {user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'A'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:block">
                <p className="text-xs font-semibold leading-tight">{user?.name}</p>
                <p className="text-[10px] text-muted-foreground leading-tight truncate max-w-[140px]">{user?.email}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full"
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
