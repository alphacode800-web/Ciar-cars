'use client';

import React from 'react';
import { Car, Search, User, LogIn, LayoutDashboard, Heart, MessageCircle, Wallet, CarFront, CalendarCheck, LogOut, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/store/app-store';
import { useAuthStore } from '@/store/auth-store';
import type { AppView } from '@/types';

const NAV_LINKS: { label: string; view: AppView; icon: React.ElementType }[] = [
  { label: 'Home', view: 'home', icon: Car },
  { label: 'Buy Cars', view: 'listing', icon: Search },
  { label: 'Rent Cars', view: 'rental', icon: CalendarCheck },
  { label: 'Sell Car', view: 'sell-car', icon: CarFront },
];

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileNav({ open, onOpenChange }: MobileNavProps) {
  const { currentView, setView, searchQuery, setSearchQuery } = useAppStore();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleNavClick = (view: AppView) => {
    setView(view);
    onOpenChange(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setView('search', { query: searchQuery.trim() });
      onOpenChange(false);
    }
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-80 p-0">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2"
            >
              <div className="bg-primary rounded-lg p-1.5">
                <Car className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl">
                <span className="font-bold tracking-tight">CIAR</span>
                <span className="font-extralight text-muted-foreground ml-0.5">
                  Cars
                </span>
              </span>
            </button>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search cars..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10"
            />
          </form>
        </div>

        {/* Nav Links */}
        <div className="py-2 px-2">
          <div className="space-y-1">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.view}
                  onClick={() => handleNavClick(link.view)}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    currentView === link.view
                      ? 'bg-accent text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {link.label}
                </button>
              );
            })}
          </div>

          <Separator className="my-3" />

          {/* User section */}
          {isAuthenticated && user ? (
            <div className="space-y-1">
              {/* User info */}
              <div className="flex items-center gap-3 px-3 py-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar || undefined} alt={user.name || ''} />
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm font-semibold">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.name || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </div>

              <Separator className="my-2" />

              {[
                { label: 'Profile', view: 'profile' as AppView, icon: User },
                { label: 'My Listings', view: 'my-listings' as AppView, icon: CarFront },
                { label: 'My Bookings', view: 'my-bookings' as AppView, icon: CalendarCheck },
                { label: 'Wallet', view: 'wallet' as AppView, icon: Wallet },
                { label: 'Messages', view: 'chat' as AppView, icon: MessageCircle },
                { label: 'Favorites', view: 'favorites' as AppView, icon: Heart },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.view}
                    onClick={() => handleNavClick(item.view)}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                    {item.label === 'Wallet' && (
                      <Badge variant="secondary" className="ml-auto text-[10px]">
                        E£{(user.walletBalance ?? 0).toLocaleString()}
                      </Badge>
                    )}
                  </button>
                );
              })}

              {(user.role === 'admin' || user.role === 'super_admin') && (
                <button
                  onClick={() => handleNavClick('dashboard')}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </button>
              )}

              <Separator className="my-2" />

              <button
                onClick={() => {
                  logout();
                  onOpenChange(false);
                }}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          ) : (
            <div className="space-y-2 px-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleNavClick('auth')}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Log in
              </Button>
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => handleNavClick('auth')}
              >
                Register
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
