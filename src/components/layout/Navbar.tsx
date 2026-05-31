'use client';

import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car,
  Search,
  Sun,
  Moon,
  Bell,
  User,
  LogOut,
  LayoutDashboard,
  Heart,
  MessageCircle,
  Wallet,
  CarFront,
  CalendarCheck,
  Menu,
  X,
  CircleDollarSign,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';
import { useAppStore } from '@/store/app-store';
import { useAuthStore } from '@/store/auth-store';
import { useCurrencyStore, CURRENCIES } from '@/store/currency-store';
import { useTranslation } from '@/hooks/use-translation';
import type { AppView } from '@/types';
import { cn } from '@/lib/utils';
import { ADMIN_LOGIN_PATH, isAdminRole } from '@/lib/auth-helpers';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';

const NAV_VIEWS: { view: AppView; labelKey: string }[] = [
  { view: 'home', labelKey: 'nav.home' },
  { view: 'listing', labelKey: 'nav.listing' },
  { view: 'rental', labelKey: 'nav.rental' },
  { view: 'sell-car', labelKey: 'nav.sell' },
];

// Floating animation variants
const floatingDots = {
  animate: (i: number) => ({
    y: [0, -8, 0],
    opacity: [0.3, 0.7, 0.3],
    transition: {
      duration: 2.5 + i * 0.3,
      repeat: Infinity,
      ease: 'easeInOut',
      delay: i * 0.4,
    },
  }),
};

export function Navbar() {
  const { currentView, setView, searchQuery, setSearchQuery } = useAppStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { currency, setCurrency } = useCurrencyStore();
  const { theme, setTheme } = useTheme();
  const { t, isRTL } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  React.useEffect(() => setMounted(true), []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setView('search', { query: searchQuery.trim() });
      setMobileOpen(false);
    }
  };

  const handleNavClick = (view: AppView) => {
    setView(view);
    setMobileOpen(false);
  };

  const handleAdminAccess = () => {
    setMobileOpen(false);
    if (user && isAdminRole(user.role)) {
      setView('admin');
      return;
    }
    window.location.href = ADMIN_LOGIN_PATH;
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {/* Animated gradient line at top */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-[60] h-[2px]"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      >
        <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />
      </motion.div>

      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        className="fixed top-[2px] left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.button
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2.5 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-1.5 shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
                  <Car className="h-5 w-5 text-white" />
                </div>
                <motion.div
                  className="absolute -inset-1 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 opacity-0 group-hover:opacity-20 blur-sm"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <span className="text-xl">
                <span className="font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  CIAR
                </span>
                <span className="font-extralight text-muted-foreground">
                  Cars
                </span>
              </span>
            </motion.button>

            {/* Center Nav Links - Desktop */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_VIEWS.map((link, i) => (
                <motion.button
                  key={link.view}
                  onClick={() => handleNavClick(link.view)}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={cn(
                    'relative px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                    currentView === link.view
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  {t(link.labelKey)}
                  {currentView === link.view && (
                    <motion.div
                      layoutId="navbar-active"
                      className="absolute inset-0 bg-primary/5 rounded-lg border border-primary/10 -z-10"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.button>
              ))}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-1.5">
              {/* Search - Desktop */}
              <motion.form
                onSubmit={handleSearch}
                className="hidden md:flex items-center relative"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Search className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
                <Input
                  placeholder={t('hero.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn("w-56 lg:w-72 h-9 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-emerald-500/30", isRTL ? "pr-9" : "pl-9")}
                />
              </motion.form>

              {/* Search — mobile */}
              <motion.div whileTap={{ scale: 0.9 }} className="md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileOpen(true)}
                  className="text-muted-foreground hover:text-foreground h-10 w-10"
                  aria-label={t('common.search')}
                >
                  <Search className="h-5 w-5" />
                </Button>
              </motion.div>

              {/* Currency — desktop & tablet only */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.div whileTap={{ scale: 0.9 }} className="hidden sm:block">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground gap-1.5 px-2"
                    >
                      <CircleDollarSign className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {currency.flag} {currency.symbol}{currency.code}
                      </span>
                    </Button>
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 max-h-80 overflow-y-auto" align="end">
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Select Currency
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {CURRENCIES.map((c) => (
                    <DropdownMenuItem
                      key={c.code}
                      onClick={() => setCurrency(c)}
                      className={cn(
                        'gap-2 cursor-pointer',
                        c.code === currency.code && 'bg-primary/5 font-medium'
                      )}
                    >
                      <span className="text-base leading-none">{c.flag}</span>
                      <span className="flex-1">
                        <span className="font-medium">{c.symbol}</span>{' '}
                        <span className="text-muted-foreground">{c.code}</span>
                      </span>
                      <span className="text-xs text-muted-foreground hidden sm:inline">
                        {c.name}
                      </span>
                      {c.code === currency.code && (
                        <Check className="h-4 w-4 text-primary ml-auto" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Language Switcher — tablet+ */}
              <div className="hidden sm:block">
                <LanguageSwitcher />
              </div>

              {/* Theme Toggle — tablet+ */}
              {mounted && (
                <motion.div whileTap={{ scale: 0.9, rotate: 180 }} className="hidden sm:block">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <AnimatePresence mode="wait">
                      {theme === 'dark' ? (
                        <motion.div
                          key="sun"
                          initial={{ rotate: -90, scale: 0 }}
                          animate={{ rotate: 0, scale: 1 }}
                          exit={{ rotate: 90, scale: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Sun className="h-5 w-5" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="moon"
                          initial={{ rotate: 90, scale: 0 }}
                          animate={{ rotate: 0, scale: 1 }}
                          exit={{ rotate: -90, scale: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Moon className="h-5 w-5" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <span className="sr-only">{t('nav.darkMode')}</span>
                  </Button>
                </motion.div>
              )}

              {/* Notifications — desktop only */}
              <motion.div whileTap={{ scale: 0.9 }} className="hidden md:block">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-muted-foreground hover:text-foreground"
                  onClick={() => isAuthenticated && handleNavClick('notifications')}
                >
                  <Bell className="h-5 w-5" />
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center"
                  >
                    3
                  </motion.span>
                </Button>
              </motion.div>

              {/* Auth - Not Authenticated */}
              {!isAuthenticated && (
                <div className="hidden md:flex items-center gap-2">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleNavClick('auth')}
                    >
                      {t('nav.login')}
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="sm"
                      onClick={() => handleNavClick('auth')}
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-shadow"
                    >
                      {t('nav.register')}
                    </Button>
                  </motion.div>
                </div>
              )}

              {/* Auth - Authenticated (desktop) */}
              {isAuthenticated && user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="hidden md:block">
                      <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-transparent hover:ring-emerald-500/30 transition-all">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.avatar || undefined} alt={user.name || ''} />
                          <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-sm font-semibold">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </motion.div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.name || 'User'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                        <Badge variant="secondary" className="w-fit mt-1 text-[10px]">
                          {user.role}
                        </Badge>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleNavClick('profile')}>
                      <User className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                      {t('nav.profile')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleNavClick('my-listings')}>
                      <CarFront className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                      {t('dashboard.myListings')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleNavClick('my-bookings')}>
                      <CalendarCheck className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                      {t('dashboard.myBookings')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleNavClick('wallet')}>
                      <Wallet className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                      {t('nav.wallet')}
                      <Badge variant="secondary" className="ml-auto text-xs">
                        ${(user.walletBalance ?? 0).toLocaleString()}
                      </Badge>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleNavClick('chat')}>
                      <MessageCircle className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                      {t('nav.messages')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleNavClick('favorites')}>
                      <Heart className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                      {t('nav.favorites')}
                    </DropdownMenuItem>
                    {isAdminRole(user.role) && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleAdminAccess}>
                          <LayoutDashboard className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                          {t('nav.admin')}
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600">
                      <LogOut className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                      {t('nav.logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Mobile Menu Trigger — always visible */}
              <motion.div whileTap={{ scale: 0.9 }} className="md:hidden">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setMobileOpen(true)}
                  className="h-10 w-10 border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400"
                  aria-label={t('nav.menu')}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Nav Sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side={isRTL ? 'right' : 'left'} className="w-[min(100vw-2rem,20rem)] p-0 flex flex-col max-h-[100dvh]">
          <SheetHeader className="p-4 pb-2 shrink-0">
            <SheetTitle className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg p-1.5">
                <Car className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold tracking-tight">CIAR</span>
              <span className="font-extralight text-muted-foreground">Cars</span>
            </SheetTitle>
          </SheetHeader>

          <form
            onSubmit={handleSearch}
            className="px-4 pb-3 shrink-0 relative"
          >
            <Search className={cn('absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground', isRTL ? 'right-7' : 'left-7')} />
            <Input
              placeholder={t('hero.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn('h-10 bg-muted/50', isRTL ? 'pr-9' : 'pl-9')}
            />
          </form>

          <Separator />

          <div className="flex-1 overflow-y-auto py-2 px-3 space-y-1">
            {NAV_VIEWS.map((link) => (
              <button
                key={link.view}
                type="button"
                onClick={() => handleNavClick(link.view)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors min-h-[44px]',
                  currentView === link.view
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                {t(link.labelKey)}
              </button>
            ))}

            <Separator className="my-2" />

            {[
              { view: 'about' as AppView, label: t('nav.about') },
              { view: 'contact' as AppView, label: t('nav.contact') },
            ].map((item) => (
              <button
                key={item.view}
                type="button"
                onClick={() => handleNavClick(item.view)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-accent min-h-[44px]"
              >
                {item.label}
              </button>
            ))}

            {isAuthenticated && user && (
              <>
                <Separator className="my-2" />
                <div className="flex items-center gap-3 px-3 py-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar || undefined} alt={user.name || ''} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm font-semibold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{user.name || 'User'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                {[
                  { view: 'profile' as AppView, label: t('nav.profile'), icon: User },
                  { view: 'my-listings' as AppView, label: t('dashboard.myListings'), icon: CarFront },
                  { view: 'my-bookings' as AppView, label: t('dashboard.myBookings'), icon: CalendarCheck },
                  { view: 'wallet' as AppView, label: t('nav.wallet'), icon: Wallet },
                  { view: 'chat' as AppView, label: t('nav.messages'), icon: MessageCircle },
                  { view: 'favorites' as AppView, label: t('nav.favorites'), icon: Heart },
                ].map(({ view, label, icon: Icon }) => (
                  <button
                    key={view}
                    type="button"
                    onClick={() => handleNavClick(view)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-accent min-h-[44px]"
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </button>
                ))}
                {isAdminRole(user.role) && (
                  <button
                    type="button"
                    onClick={handleAdminAccess}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-accent min-h-[44px]"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    {t('nav.admin')}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 min-h-[44px]"
                >
                  <LogOut className="h-4 w-4" />
                  {t('nav.logout')}
                </button>
              </>
            )}
          </div>

          <Separator />

          <div className="p-4 shrink-0 space-y-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">{t('nav.language')}</span>
              <LanguageSwitcher />
            </div>
            {mounted && (
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {t('nav.darkMode')}
              </Button>
            )}
            {!isAuthenticated && (
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => handleNavClick('auth')}>
                  {t('nav.login')}
                </Button>
                <Button
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                  onClick={() => handleNavClick('auth')}
                >
                  {t('nav.register')}
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <MobileBottomNav onMenuOpen={() => setMobileOpen(true)} />
    </>
  );
}
