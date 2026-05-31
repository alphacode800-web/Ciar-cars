'use client';

import { CircleDollarSign, Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCurrencyStore, CURRENCIES } from '@/store/currency-store';
import { cn } from '@/lib/utils';

interface CurrencySwitcherProps {
  /** Full-width row for mobile menu */
  menuMode?: boolean;
  className?: string;
}

export function CurrencySwitcher({ menuMode, className }: CurrencySwitcherProps) {
  const { currency, setCurrency } = useCurrencyStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={menuMode ? 'outline' : 'ghost'}
          size={menuMode ? 'default' : 'sm'}
          className={cn(
            menuMode
              ? 'w-full justify-between h-11 gap-2 font-normal'
              : 'text-muted-foreground hover:text-foreground gap-1.5 px-2',
            className
          )}
        >
          <span className="flex items-center gap-2 min-w-0">
            <CircleDollarSign className="h-4 w-4 shrink-0" />
            <span className={cn('truncate', menuMode ? 'text-sm font-medium' : 'text-sm font-medium')}>
              {currency.flag} {currency.symbol}
              {menuMode ? ` ${currency.code}` : currency.code}
            </span>
          </span>
          {menuMode && <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 max-h-80 overflow-y-auto"
        align={menuMode ? 'start' : 'end'}
      >
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
            {c.code === currency.code && <Check className="h-4 w-4 text-primary ml-auto" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
