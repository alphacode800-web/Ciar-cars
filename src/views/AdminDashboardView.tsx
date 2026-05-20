'use client';

import React, { useState } from 'react';
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
  LogOut,
  ArrowLeft,
  Bell,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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

// Admin Section Components
import { OverviewSection } from '@/components/admin/OverviewSection';
import { UsersSection } from '@/components/admin/UsersSection';
import { CarsSection } from '@/components/admin/CarsSection';
import { BookingsSection } from '@/components/admin/BookingsSection';
import { PaymentsSection } from '@/components/admin/PaymentsSection';
import { SettingsSection } from '@/components/admin/SettingsSection';
import { HomepageBuilderSection } from '@/components/admin/HomepageBuilderSection';
import { NavigationSection } from '@/components/admin/NavigationSection';
import { AuditLogsSection } from '@/components/admin/AuditLogsSection';

// ============ TYPES ============
type AdminSection =
  | 'overview'
  | 'users'
  | 'cars'
  | 'bookings'
  | 'payments'
  | 'settings'
  | 'homepage'
  | 'navigation'
  | 'audit';

interface NavItem {
  id: AdminSection;
  labelKey: string;
  icon: React.ElementType;
}

// ============ SIDEBAR NAVIGATION ============
const navItems: NavItem[] = [
  { id: 'overview', labelKey: 'admin.overview', icon: LayoutDashboard },
  { id: 'users', labelKey: 'admin.users', icon: Users },
  { id: 'cars', labelKey: 'admin.cars', icon: Car },
  { id: 'bookings', labelKey: 'admin.bookings', icon: CalendarCheck },
  { id: 'payments', labelKey: 'admin.payments', icon: CreditCard },
  { id: 'settings', labelKey: 'admin.settings', icon: Settings },
  { id: 'homepage', labelKey: 'admin.homepage', icon: Home },
  { id: 'navigation', labelKey: 'admin.navigation', icon: Navigation },
  { id: 'audit', labelKey: 'admin.audit', icon: ScrollText },
];

// ============ NAV LABELS ============
const navLabels: Record<string, { en: string; ar: string; fr: string; de: string; es: string }> = {
  'admin.overview': { en: 'Overview', ar: 'نظرة عامة', fr: 'Aperçu', de: 'Übersicht', es: 'Resumen' },
  'admin.users': { en: 'Users', ar: 'المستخدمين', fr: 'Utilisateurs', de: 'Benutzer', es: 'Usuarios' },
  'admin.cars': { en: 'Cars', ar: 'السيارات', fr: 'Voitures', de: 'Fahrzeuge', es: 'Vehículos' },
  'admin.bookings': { en: 'Bookings', ar: 'الحجوزات', fr: 'Réservations', de: 'Buchungen', es: 'Reservas' },
  'admin.payments': { en: 'Payments', ar: 'المدفوعات', fr: 'Paiements', de: 'Zahlungen', es: 'Pagos' },
  'admin.settings': { en: 'Settings', ar: 'الإعدادات', fr: 'Paramètres', de: 'Einstellungen', es: 'Configuración' },
  'admin.homepage': { en: 'Homepage', ar: 'الصفحة الرئيسية', fr: "Page d'accueil", de: 'Startseite', es: 'Inicio' },
  'admin.navigation': { en: 'Navigation', ar: 'التنقل', fr: 'Navigation', de: 'Navigation', es: 'Navegación' },
  'admin.audit': { en: 'Audit Logs', ar: 'سجل التدقيق', fr: "Journal d'audit", de: 'Audit-Protokoll', es: 'Registro de auditoría' },
};

function getLabel(key: string): string {
  // Try to get translated label, fallback to English
  const entry = navLabels[key];
  if (!entry) return key;
  try {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('ciar-locale') : null;
    const locale = stored || 'en';
    return (entry as Record<string, string>)[locale] || entry.en;
  } catch {
    return entry.en;
  }
}

// ============ ADMIN DASHBOARD VIEW ============
export default function AdminDashboardView() {
  const { user, logout } = useAuthStore();
  const { setView } = useAppStore();
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    setView('home');
    toast.success('Logged out successfully');
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection onNavigate={(s) => setActiveSection(s as AdminSection)} />;
      case 'users':
        return <UsersSection />;
      case 'cars':
        return <CarsSection />;
      case 'bookings':
        return <BookingsSection />;
      case 'payments':
        return <PaymentsSection />;
      case 'settings':
        return <SettingsSection />;
      case 'homepage':
        return <HomepageBuilderSection />;
      case 'navigation':
        return <NavigationSection />;
      case 'audit':
        return <AuditLogsSection />;
      default:
        return <OverviewSection onNavigate={(s) => setActiveSection(s as AdminSection)} />;
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-40 flex flex-col bg-card border-r border-border/60 transition-all duration-300 ease-in-out',
          'w-64',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-16'
        )}
        style={{ top: '64px' }}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/40">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-sm">Admin Panel</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* Nav Items */}
        <ScrollArea className="flex-1 py-3 px-3">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              const Icon = item.icon;
              return (
                <TooltipProvider key={item.id} delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => {
                          setActiveSection(item.id);
                          // Close sidebar on mobile
                          if (window.innerWidth < 1024) setSidebarOpen(false);
                        }}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                          isActive
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 shadow-sm'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        )}
                      >
                        <Icon className={cn(
                          'h-[18px] w-[18px] shrink-0',
                          isActive && 'text-emerald-600 dark:text-emerald-400'
                        )} />
                        {sidebarOpen && (
                          <span className="truncate">{getLabel(item.labelKey)}</span>
                        )}
                        {isActive && sidebarOpen && (
                          <div className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        )}
                      </button>
                    </TooltipTrigger>
                    {!sidebarOpen && (
                      <TooltipContent side="right" className="font-medium">
                        {getLabel(item.labelKey)}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Sidebar Footer */}
        <div className="border-t border-border/40 p-3 space-y-1">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => { setView('home'); }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors'
                  )}
                >
                  <ArrowLeft className="h-[18px] w-[18px] shrink-0" />
                  {sidebarOpen && <span>Back to Site</span>}
                </button>
              </TooltipTrigger>
              {!sidebarOpen && (
                <TooltipContent side="right">Back to Site</TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                >
                  <LogOut className="h-[18px] w-[18px] shrink-0" />
                  {sidebarOpen && <span>Logout</span>}
                </button>
              </TooltipTrigger>
              {!sidebarOpen && (
                <TooltipContent side="right">Logout</TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 border-b border-border/60 bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-sm font-semibold">{getLabel(`admin.${activeSection}`)}</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Manage your platform</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 relative">
                    <Bell className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Notifications</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium">
                  {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'A'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-xs font-medium leading-tight">{user?.name || 'Admin'}</p>
                <p className="text-[10px] text-muted-foreground leading-tight">{user?.email || ''}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="p-4 lg:p-6"
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
