'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  Info,
  Loader2,
  Search,
  TrendingDown,
  TrendingUp,
  X,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// 1. AdminMetricRing — دائرة تقدم للمؤشرات
export function AdminMetricRing({
  value,
  max = 100,
  label,
  sublabel,
  color = 'emerald',
  size = 88,
}: {
  value: number;
  max?: number;
  label: string;
  sublabel?: string;
  color?: 'emerald' | 'amber' | 'cyan' | 'violet';
  size?: number;
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const stroke = { emerald: '#10b981', amber: '#f59e0b', cyan: '#06b6d4', violet: '#8b5cf6' }[color];
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={6} className="text-muted/20" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={stroke}
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold tabular-nums">{pct}%</span>
        </div>
      </div>
      <p className="text-xs font-medium text-center">{label}</p>
      {sublabel && <p className="text-[10px] text-muted-foreground">{sublabel}</p>}
    </div>
  );
}

// 2. AdminStatsRow — شريط إحصائيات أفقي
export function AdminStatsRow({
  items,
}: {
  items: { label: string; value: string; accent?: string }[];
}) {
  return (
    <div className="flex flex-wrap divide-x divide-border/50 rounded-xl border border-white/10 bg-white/5 overflow-hidden">
      {items.map((item, i) => (
        <div key={i} className="flex-1 min-w-[100px] px-4 py-3 text-center">
          <p className={cn('text-lg font-bold tabular-nums', item.accent)}>{item.value}</p>
          <p className="text-[11px] text-muted-foreground">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

// 3. AdminTrendChip — شارة اتجاه التغيّر
export function AdminTrendChip({ value, label }: { value: number; label?: string }) {
  const up = value >= 0;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold',
        up ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/15 text-red-600 dark:text-red-400'
      )}
    >
      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {up ? '+' : ''}
      {value}%
      {label && <span className="opacity-70 font-normal">{label}</span>}
    </span>
  );
}

// 4. AdminSparkline — مخطط مصغّر
export function AdminSparkline({
  data,
  color = 'bg-emerald-500',
  height = 32,
}: {
  data: number[];
  color?: string;
  height?: number;
}) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-0.5" style={{ height }}>
      {data.map((v, i) => (
        <div
          key={i}
          className={cn('flex-1 rounded-sm opacity-70 hover:opacity-100 transition-opacity', color)}
          style={{ height: `${(v / max) * 100}%`, minHeight: 3 }}
        />
      ))}
    </div>
  );
}

// 5. AdminEmptyState — حالة فارغة
export function AdminEmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-amber-500/10 ring-1 ring-white/10">
        <Icon className="h-7 w-7 text-emerald-500/80" />
      </div>
      <h3 className="text-sm font-semibold">{title}</h3>
      {description && <p className="text-xs text-muted-foreground mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// 6. AdminHighlightBox — صندوق تنبيه/معلومة
export function AdminHighlightBox({
  variant = 'info',
  title,
  children,
}: {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
}) {
  const styles = {
    info: { bg: 'bg-cyan-500/10 border-cyan-500/20', icon: Info, ic: 'text-cyan-500' },
    success: { bg: 'bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2, ic: 'text-emerald-500' },
    warning: { bg: 'bg-amber-500/10 border-amber-500/20', icon: AlertTriangle, ic: 'text-amber-500' },
    error: { bg: 'bg-red-500/10 border-red-500/20', icon: AlertTriangle, ic: 'text-red-500' },
  }[variant];
  const Icon = styles.icon;
  return (
    <div className={cn('rounded-xl border p-4 flex gap-3', styles.bg)}>
      <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', styles.ic)} />
      <div>
        {title && <p className="text-sm font-semibold mb-1">{title}</p>}
        <div className="text-xs text-muted-foreground leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

// 7. AdminLoadingPulse — مؤشر تحميل
export function AdminLoadingPulse({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-8">
      <div className="relative h-10 w-10">
        <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
        <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/30">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
        </div>
      </div>
      {label && <p className="text-xs text-muted-foreground animate-pulse">{label}</p>}
    </div>
  );
}

// 8. AdminSectionDivider — فاصل بعنوان
export function AdminSectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border to-transparent" />
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  );
}

// 9. AdminBreadcrumb — مسار تنقل
export function AdminBreadcrumb({
  items,
  isRTL,
}: {
  items: { label: string; onClick?: () => void }[];
  isRTL?: boolean;
}) {
  return (
    <nav className="flex items-center gap-1 text-xs text-muted-foreground flex-wrap">
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && (
            <ChevronLeft className={cn('h-3 w-3 opacity-40', !isRTL && 'rotate-180')} />
          )}
          {item.onClick ? (
            <button type="button" onClick={item.onClick} className="hover:text-emerald-500 transition-colors">
              {item.label}
            </button>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

// 10. AdminTabPills — تبويبات على شكل pills
export function AdminTabPills<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            'rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
            value === tab.id
              ? 'bg-gradient-to-l from-emerald-600 to-teal-600 text-white shadow-md'
              : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// 11. AdminStatusBadge — حالة مع نقطة
export function AdminStatusBadge({
  status,
  map,
}: {
  status: string;
  map?: Record<string, { label: string; color: string }>;
}) {
  const defaultMap: Record<string, { label: string; color: string }> = {
    active: { label: 'نشط', color: 'bg-emerald-500' },
    pending: { label: 'معلق', color: 'bg-amber-500' },
    sold: { label: 'مباع', color: 'bg-blue-500' },
    archived: { label: 'مؤرشف', color: 'bg-slate-500' },
    error: { label: 'خطأ', color: 'bg-red-500' },
  };
  const m = (map || defaultMap)[status] || { label: status, color: 'bg-gray-500' };
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] font-medium">
      <span className={cn('h-1.5 w-1.5 rounded-full', m.color)} />
      {m.label}
    </span>
  );
}

// 12. AdminKeyValueGrid — شبكة مفتاح/قيمة
export function AdminKeyValueGrid({
  items,
  columns = 2,
}: {
  items: { key: string; value: React.ReactNode }[];
  columns?: 1 | 2 | 3;
}) {
  return (
    <dl
      className={cn(
        'grid gap-3',
        columns === 1 && 'grid-cols-1',
        columns === 2 && 'grid-cols-1 sm:grid-cols-2',
        columns === 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      )}
    >
      {items.map((item, i) => (
        <div key={i} className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
          <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">{item.key}</dt>
          <dd className="text-sm font-medium mt-0.5">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

// 13. AdminTagList — قائمة وسوم
export function AdminTagList({
  tags,
  onRemove,
}: {
  tags: string[];
  onRemove?: (tag: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400"
        >
          {tag}
          {onRemove && (
            <button type="button" onClick={() => onRemove(tag)} className="hover:text-red-500">
              <X className="h-3 w-3" />
            </button>
          )}
        </span>
      ))}
    </div>
  );
}

// 14. AdminSearchBar — شريط بحث فاخر
export function AdminSearchBar({
  value,
  onChange,
  placeholder,
  onSubmit,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
}) {
  return (
    <div className="relative flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground start-3" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSubmit?.()}
          placeholder={placeholder}
          className="ps-9 h-10 rounded-xl border-white/10 bg-white/5 focus-visible:ring-emerald-500/30"
        />
      </div>
      {onSubmit && (
        <Button onClick={onSubmit} className="h-10 rounded-xl bg-gradient-to-l from-emerald-600 to-teal-600">
          {placeholder?.includes('بحث') ? 'بحث' : 'Search'}
        </Button>
      )}
    </div>
  );
}

// 15. AdminFilterChips — فلاتر سريعة
export function AdminFilterChips({
  options,
  selected,
  onChange,
}: {
  options: { id: string; label: string }[];
  selected: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={cn(
            'rounded-full border px-3 py-1 text-xs font-medium transition-all',
            selected === opt.id
              ? 'border-amber-500/40 bg-amber-500/15 text-amber-600 dark:text-amber-400'
              : 'border-white/10 bg-white/5 text-muted-foreground hover:border-white/20'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// 16. AdminTimeline — خط زمني
export function AdminTimeline({
  events,
}: {
  events: { title: string; time: string; description?: string; color?: string }[];
}) {
  return (
    <div className="space-y-0">
      {events.map((ev, i) => (
        <div key={i} className="flex gap-3 pb-4 last:pb-0">
          <div className="flex flex-col items-center">
            <div className={cn('h-2.5 w-2.5 rounded-full ring-4 ring-background', ev.color || 'bg-emerald-500')} />
            {i < events.length - 1 && <div className="w-px flex-1 bg-border/50 mt-1 min-h-[24px]" />}
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-sm font-medium">{ev.title}</p>
            {ev.description && <p className="text-xs text-muted-foreground mt-0.5">{ev.description}</p>}
            <p className="text-[10px] text-muted-foreground/70 mt-1">{ev.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// 17. AdminNotificationCard — بطاقة إشعار
export function AdminNotificationCard({
  title,
  message,
  time,
  unread,
  icon: Icon,
  onClick,
}: {
  title: string;
  message: string;
  time: string;
  unread?: boolean;
  icon?: LucideIcon;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex gap-3 rounded-xl border p-3 text-start transition-all hover:border-emerald-500/20 hover:bg-emerald-500/5',
        unread ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-white/5 bg-white/[0.02]'
      )}
    >
      {Icon && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/15">
          <Icon className="h-4 w-4 text-amber-500" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{title}</p>
          {unread && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{message}</p>
        <p className="text-[10px] text-muted-foreground/60 mt-1">{time}</p>
      </div>
    </button>
  );
}

// 18. AdminAvatarStack — مجموعة صور
export function AdminAvatarStack({
  users,
  max = 4,
}: {
  users: { name: string; initials?: string }[];
  max?: number;
}) {
  const shown = users.slice(0, max);
  const extra = users.length - max;
  return (
    <div className="flex -space-x-2 rtl:space-x-reverse">
      {shown.map((u, i) => (
        <Avatar key={i} className="h-8 w-8 ring-2 ring-background">
          <AvatarFallback className="text-[10px] bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-bold">
            {u.initials || u.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ))}
      {extra > 0 && (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-[10px] font-bold ring-2 ring-background">
          +{extra}
        </div>
      )}
    </div>
  );
}

// 19. AdminUserChip — شريحة مستخدم
export function AdminUserChip({
  name,
  email,
  role,
}: {
  name: string;
  email?: string;
  role?: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 ps-1 pe-3">
      <Avatar className="h-7 w-7">
        <AvatarFallback className="text-[9px] bg-emerald-600 text-white">
          {name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="text-xs font-medium truncate max-w-[120px]">{name}</p>
        {role && <p className="text-[9px] text-amber-500">{role}</p>}
        {!role && email && <p className="text-[9px] text-muted-foreground truncate max-w-[120px]">{email}</p>}
      </div>
    </div>
  );
}

// 20. AdminSplitPanel — لوحة مقسّمة
export function AdminSplitPanel({
  sidebar,
  children,
  sidebarWidth = '280px',
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  sidebarWidth?: string;
}) {
  return (
    <div className="flex flex-col lg:flex-row gap-4 rounded-2xl border border-white/10 overflow-hidden min-h-[280px]">
      <aside
        className="shrink-0 border-b lg:border-b-0 lg:border-e border-white/10 bg-white/[0.02] p-4"
        style={{ width: '100%', maxWidth: '100%' }}
      >
        <div className="lg:hidden">{sidebar}</div>
        <div className="hidden lg:block" style={{ width: sidebarWidth }}>
          {sidebar}
        </div>
      </aside>
      <div className="flex-1 p-4 min-w-0">{children}</div>
    </div>
  );
}

// 21. AdminProgressSteps — خطوات تقدم (bonus compact)
export function AdminProgressSteps({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((step, i) => (
        <React.Fragment key={i}>
          <div className="flex items-center gap-1.5">
            <div
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold',
                i < current
                  ? 'bg-emerald-500 text-white'
                  : i === current
                    ? 'bg-amber-500 text-white ring-2 ring-amber-500/30'
                    : 'bg-muted text-muted-foreground'
              )}
            >
              {i < current ? '✓' : i + 1}
            </div>
            <span className={cn('text-xs hidden sm:inline', i === current && 'font-semibold')}>{step}</span>
          </div>
          {i < steps.length - 1 && <div className="h-px w-6 sm:w-10 bg-border/50" />}
        </React.Fragment>
      ))}
    </div>
  );
}

// Interactive demo wrapper for showcase
export function AdminTagListDemo() {
  const [tags, setTags] = useState(['SUV', '2024', 'السودان', 'مميز']);
  return (
    <AdminTagList
      tags={tags}
      onRemove={(t) => setTags((prev) => prev.filter((x) => x !== t))}
    />
  );
}

export function AdminTabPillsDemo() {
  const [tab, setTab] = useState<'all' | 'active' | 'pending'>('all');
  return (
    <AdminTabPills
      tabs={[
        { id: 'all', label: 'الكل' },
        { id: 'active', label: 'نشط' },
        { id: 'pending', label: 'معلق' },
      ]}
      value={tab}
      onChange={setTab}
    />
  );
}
