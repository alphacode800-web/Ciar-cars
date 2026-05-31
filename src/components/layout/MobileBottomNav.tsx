'use client';

import React from 'react';
import { Home, Search, CalendarCheck, PlusCircle, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/app-store';
import { useTranslation } from '@/hooks/use-translation';
import type { AppView } from '@/types';

const TABS: { view: AppView; labelKey: string; icon: React.ElementType; action?: 'menu' }[] = [
  { view: 'home', labelKey: 'nav.home', icon: Home },
  { view: 'listing', labelKey: 'nav.listing', icon: Search },
  { view: 'rental', labelKey: 'nav.rental', icon: CalendarCheck },
  { view: 'sell-car', labelKey: 'nav.sell', icon: PlusCircle },
  { view: 'home', labelKey: 'nav.menu', icon: Menu, action: 'menu' },
];

interface MobileBottomNavProps {
  onMenuOpen: () => void;
}

export function MobileBottomNav({ onMenuOpen }: MobileBottomNavProps) {
  const { currentView, setView } = useAppStore();
  const { t } = useTranslation();

  const handleTap = (view: AppView, action?: 'menu') => {
    if (action === 'menu') {
      onMenuOpen();
      return;
    }
    setView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isActive = (view: AppView, action?: 'menu') => {
    if (action === 'menu') return false;
    if (view === 'listing') {
      return ['listing', 'search', 'detail'].includes(currentView);
    }
    return currentView === view;
  };

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 md:hidden border-t bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/80 pb-[env(safe-area-inset-bottom)]"
      aria-label="Main navigation"
    >
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto">
        {TABS.map(({ view, labelKey, icon: Icon, action }) => {
          const active = isActive(view, action);
          return (
            <button
              key={labelKey}
              type="button"
              onClick={() => handleTap(view, action)}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors min-h-[44px]',
                active
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-xl transition-colors',
                  active && 'bg-emerald-500/10'
                )}
              >
                <Icon className={cn('h-5 w-5', active && 'stroke-[2.5]')} />
              </span>
              <span className="leading-none">{t(labelKey)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
