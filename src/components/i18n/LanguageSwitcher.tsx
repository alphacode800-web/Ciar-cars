'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useI18nStore } from '@/store/i18n-store';
import { LANGUAGES } from '@/lib/i18n/types';
import type { Locale } from '@/lib/i18n/types';
import { cn } from '@/lib/utils';

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18nStore();

  const currentLanguage = LANGUAGES.find((l) => l.code === locale) || LANGUAGES[0];

  const handleLanguageChange = (newLocale: Locale) => {
    setLocale(newLocale);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-1.5 px-2 text-muted-foreground hover:text-foreground"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline text-xs font-medium">{currentLanguage.nativeName}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {LANGUAGES.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={cn(
              'cursor-pointer gap-3',
              locale === language.code && 'bg-accent'
            )}
          >
            <span className="text-base">{language.flag}</span>
            <div className="flex flex-col">
              <span className={cn(
                'text-sm font-medium',
                locale === language.code ? 'text-primary' : ''
              )}>
                {language.nativeName}
              </span>
              <span className="text-[10px] text-muted-foreground">{language.name}</span>
            </div>
            {locale === language.code && (
              <motion.div
                layoutId="activeLang"
                className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"
              />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
