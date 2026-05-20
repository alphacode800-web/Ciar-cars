'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ScrollText,
  Filter,
  RefreshCcw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Shield,
  Clock,
  User,
  Globe,
} from 'lucide-react';
import { toast } from 'sonner';

import { getAuditLogs, type AdminAuditFilters } from '@/lib/admin-api';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// ============ TYPES ============

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string | null;
  details: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: {
    name: string | null;
    email: string;
  } | null;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ============ ACTION BADGE COLORS ============

const ACTION_STYLES: Record<string, string> = {
  // User actions
  create: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  update: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  delete: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  login: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  logout: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',

  // Admin actions
  approve: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  reject: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  ban: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  unban: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',

  // Entity-specific
  feature: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  archive: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  publish: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  unpublish: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',

  // Payment
  payment: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  refund: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',

  // Settings
  settings: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
};

function getActionStyle(action: string): string {
  const actionLower = action.toLowerCase();
  // Try exact match first
  if (ACTION_STYLES[actionLower]) return ACTION_STYLES[actionLower];
  // Try matching action prefix (e.g. "user.create" → "create")
  const parts = actionLower.split('.');
  const lastPart = parts[parts.length - 1];
  if (ACTION_STYLES[lastPart]) return ACTION_STYLES[lastPart];
  // Try matching first part (e.g. "user.create" → "user")
  if (ACTION_STYLES[parts[0]]) return ACTION_STYLES[parts[0]];
  // Default
  return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
}

function getActionLabel(action: string): string {
  return action.replace(/\./g, ' ').replace(/_/g, ' ');
}

// ============ ENTITY OPTIONS ============

const ENTITY_OPTIONS = [
  'User',
  'Car',
  'Booking',
  'Payment',
  'Review',
  'Navigation',
  'Banner',
  'HomepageSection',
  'Settings',
  'AuditLog',
];

// ============ RELATIVE TIME ============

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr !== 1 ? 's' : ''} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
  if (diffWeek < 4) return `${diffWeek} week${diffWeek !== 1 ? 's' : ''} ago`;
  if (diffMonth < 12) return `${diffMonth} month${diffMonth !== 1 ? 's' : ''} ago`;
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatFullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function truncateDetails(details: string | null, maxLen = 60): string {
  if (!details) return '—';
  return details.length > maxLen ? details.slice(0, maxLen) + '...' : details;
}

// ============ SKELETON ============

function AuditLogsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-7 w-32" />
        </div>
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-9 w-40 rounded-lg" />
        <Skeleton className="h-9 w-40 rounded-lg" />
      </div>
      <div className="rounded-lg border">
        <div className="border-b p-4">
          <div className="flex gap-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-6 border-b last:border-0 p-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-40" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ MAIN COMPONENT ============

export default function AuditLogsSection() {
  // Data state
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');

  // ============ FETCH LOGS ============
  const fetchLogs = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);

      const filters: AdminAuditFilters = { page, limit: 15 };
      if (actionFilter) filters.action = actionFilter;
      if (entityFilter) filters.entity = entityFilter;

      try {
        const res = await getAuditLogs(filters);
        if (res.success && res.data) {
          setLogs(res.data as AuditLog[]);
          if (res.pagination) {
            setPagination(res.pagination as PaginationInfo);
          }
        } else {
          setError(res.error || 'Failed to load audit logs');
        }
      } catch {
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [actionFilter, entityFilter]
  );

  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  // ============ PAGINATION ============
  const goToPage = (page: number) => {
    fetchLogs(page);
  };

  const getPaginationRange = (): number[] => {
    const { page, totalPages } = pagination;
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  // ============ CLEAR FILTERS ============
  const hasFilters = !!actionFilter || !!entityFilter;
  const clearFilters = () => {
    setActionFilter('');
    setEntityFilter('');
  };

  // ============ RENDER ============
  if (loading && logs.length === 0) return <AuditLogsSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <AlertCircle className="h-7 w-7 text-red-600 dark:text-red-400" />
        </div>
        <p className="text-muted-foreground text-sm">{error}</p>
        <Button
          variant="outline"
          onClick={() => fetchLogs(1)}
          className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
        >
          <RefreshCcw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm">
            <ScrollText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Audit Logs</h2>
            <p className="text-muted-foreground text-xs">
              {pagination.total} total log{pagination.total !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchLogs(pagination.page)}
          className="gap-1.5"
        >
          <RefreshCcw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filters:</span>
        </div>

        <Select value={actionFilter || '__all__'} onValueChange={(val) => setActionFilter(val === '__all__' ? '' : val)}>
          <SelectTrigger className="h-9 w-[180px]">
            <SelectValue placeholder="All Actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Actions</SelectItem>
            {[
              'create', 'update', 'delete', 'login', 'logout',
              'approve', 'reject', 'ban', 'unban', 'feature',
              'archive', 'publish', 'payment', 'refund', 'settings',
            ].map((action) => (
              <SelectItem key={action} value={action}>
                <span className="capitalize">{action.replace(/_/g, ' ')}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={entityFilter || '__all__'} onValueChange={(val) => setEntityFilter(val === '__all__' ? '' : val)}>
          <SelectTrigger className="h-9 w-[180px]">
            <SelectValue placeholder="All Entities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Entities</SelectItem>
            {ENTITY_OPTIONS.map((entity) => (
              <SelectItem key={entity} value={entity}>
                {entity}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground text-xs"
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Logs Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-[100px]">Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead className="w-[150px]">Action</TableHead>
              <TableHead className="w-[120px]">Entity</TableHead>
              <TableHead className="hidden lg:table-cell w-[100px]">Entity ID</TableHead>
              <TableHead className="hidden md:table-cell w-[130px]">IP Address</TableHead>
              <TableHead className="hidden xl:table-cell">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ScrollText className="h-8 w-8 opacity-40" />
                    <p className="text-sm">No audit logs found</p>
                    {hasFilters && (
                      <p className="text-xs">Try clearing your filters</p>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id} className="group">
                  {/* Timestamp */}
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground" title={formatFullDate(log.createdAt)}>
                        {formatRelativeTime(log.createdAt)}
                      </span>
                    </div>
                  </TableCell>

                  {/* User */}
                  <TableCell>
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex-shrink-0">
                        <User className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate max-w-[160px]">
                          {log.user?.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-[160px]">
                          {log.user?.email || log.userId}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Action Badge */}
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`text-[11px] font-mono capitalize ${getActionStyle(log.action)}`}
                      title={log.action}
                    >
                      {getActionLabel(log.action)}
                    </Badge>
                  </TableCell>

                  {/* Entity */}
                  <TableCell>
                    <Badge variant="outline" className="text-[11px]">
                      {log.entity}
                    </Badge>
                  </TableCell>

                  {/* Entity ID */}
                  <TableCell className="hidden lg:table-cell">
                    <span className="text-xs text-muted-foreground font-mono">
                      {log.entityId
                        ? log.entityId.length > 8
                          ? log.entityId.slice(0, 8) + '...'
                          : log.entityId
                        : '—'}
                    </span>
                  </TableCell>

                  {/* IP Address */}
                  <TableCell className="hidden md:table-cell">
                    <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      {log.ipAddress || '—'}
                    </span>
                  </TableCell>

                  {/* Details */}
                  <TableCell className="hidden xl:table-cell">
                    <span className="text-xs text-muted-foreground" title={log.details || ''}>
                      {truncateDetails(log.details)}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1}&ndash;
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} logs
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => goToPage(pagination.page - 1)}
              className="h-8"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Prev
            </Button>
            {getPaginationRange().map((page) => (
              <Button
                key={page}
                variant={page === pagination.page ? 'default' : 'outline'}
                size="sm"
                onClick={() => goToPage(page)}
                className={`h-8 w-8 p-0 ${
                  page === pagination.page
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
                    : ''
                }`}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => goToPage(pagination.page + 1)}
              className="h-8"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
