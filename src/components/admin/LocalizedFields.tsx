'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CMS_LOCALES, type CmsLocale, type LocalizedString } from '@/lib/cms-content';

const LOCALE_LABELS: Record<CmsLocale, string> = {
  en: 'EN',
  ar: 'AR',
  fr: 'FR',
  de: 'DE',
  es: 'ES',
};

interface Props {
  label: string;
  value?: LocalizedString;
  onChange: (value: LocalizedString) => void;
  multiline?: boolean;
  placeholder?: string;
}

export function LocalizedFields({ label, value = {}, onChange, multiline, placeholder }: Props) {
  const [tab, setTab] = useState<CmsLocale>('ar');

  const update = (locale: CmsLocale, text: string) => {
    onChange({ ...value, [locale]: text });
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Tabs value={tab} onValueChange={(v) => setTab(v as CmsLocale)}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          {CMS_LOCALES.map((loc) => (
            <TabsTrigger key={loc} value={loc} className="text-xs px-2 py-1">
              {LOCALE_LABELS[loc]}
            </TabsTrigger>
          ))}
        </TabsList>
        {CMS_LOCALES.map((loc) => (
          <TabsContent key={loc} value={loc} className="mt-2">
            {multiline ? (
              <Textarea
                value={value[loc] || ''}
                onChange={(e) => update(loc, e.target.value)}
                placeholder={placeholder}
                rows={4}
              />
            ) : (
              <Input
                value={value[loc] || ''}
                onChange={(e) => update(loc, e.target.value)}
                placeholder={placeholder}
              />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
