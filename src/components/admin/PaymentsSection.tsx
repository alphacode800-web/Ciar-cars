'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  DollarSign,
  Clock,
  AlertTriangle,
  RotateCcw,
  Filter,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Banknote,
  Building2,
  AlertCircle,
} from 'lucide-react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import { getPayments, type AdminPaymentFilters } from '@/lib/admin-api';
import { CURRENCY } from '@/lib/constants';

// ============ TYPES ============
interface Payment {
  id: string;
  amount: number;
  type: string;
  status: string;
  method: string;
  stripePaymentId: string | null;
  description: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    avatar: string | null;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ============ CONSTANTS ============
const PAYMENT_TYPE_CONFIG: Record<string, { label: string; className: string }> = {
  listing_fee: {
    label: 'Listing Fee',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  },
  boost_fee: {
    label: 'Boost Fee',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
  rental: {
    label: 'Rental',
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  wallet_topup: {
    label: 'Wallet Top-Up',
    className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  },
  featured_fee: {
    label: 'Featured Fee',
    className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  },
};

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending: {
    label: 'Pending',
    className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  completed: {
    label: 'Completed',
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  failed: {
    label: 'Failed',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
  refunded: {
    label: 'Refunded',
    className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  },
};

const PAYMENT_METHOD_CONFIG: Record<string, string> = {
  stripe: 'Card',
  wallet: 'Wallet',
  bank_transfer: 'Bank Transfer',
};

const PAGE_SIZE = 10;

// ============ COMPONENT ============
export default function PaymentsSection() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Summary stats
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [refundedCount, setRefundedCount] = useState(0);

  // Track if initial summary has loaded
  const summaryLoadedRef = useRef(false);

  const fetchPayments = useCallback(async (page: number, type: string, status: string, loadSummary: boolean = false) => {
    setLoading(true);
    setError(null);

    const params: AdminPaymentFilters = {
      page,
      limit: PAGE_SIZE,
    };
    if (type && type !== 'all') params.type = type;
    if (status && status !== 'all') params.status = status;

    const res = await getPayments(params);

    if (res.success && res.data) {
      setPayments(res.data);
      if (res.pagination) {
        setPagination(res.pagination);
      }

      // Compute summary from the data if this is the first load (unfiltered)
      if (loadSummary && !summaryLoadedRef.current) {
        summaryLoadedRef.current = true;

        // Fetch all completed for revenue, and counts by status
        const [completedRes, pendingRes, failedRes, refundedRes] = await Promise.all([
          getPayments({ page: 1, limit: 1, status: 'completed' }),
          getPayments({ page: 1, limit: 1, status: 'pending' }),
          getPayments({ page: 1, limit: 1, status: 'failed' }),
          getPayments({ page: 1, limit: 1, status: 'refunded' }),
        ]);

        if (pendingRes.pagination) setPendingCount(pendingRes.pagination.total);
        if (failedRes.pagination) setFailedCount(failedRes.pagination.total);
        if (refundedRes.pagination) setRefundedCount(refundedRes.pagination.total);

        // Fetch all completed payments to sum revenue
        const allCompletedRes = await getPayments({ page: 1, limit: 999, status: 'completed' });
        if (allCompletedRes.success && allCompletedRes.data) {
          const sum = allCompletedRes.data.reduce((acc: number, p: Payment) => acc + p.amount, 0);
          setTotalRevenue(sum);
        }
      }
    } else {
      setError(res.error || 'Failed to load payments');
    }

    setLoading(false);
  }, []);

  // Summary loaded state for UI rendering
  const [summaryLoaded, setSummaryLoaded] = useState(false);

  // Initial load
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      await fetchPayments(1, 'all', 'all', true);
      if (!cancelled) {
        setSummaryLoaded(true);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [fetchPayments]);

  // Re-fetch when filters change
  const handleFilterChange = (type: string, status: string) => {
    setTypeFilter(type);
    setStatusFilter(status);
    setCurrentPage(1);
    fetchPayments(1, type, status);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchPayments(newPage, typeFilter, statusFilter);
  };

  const handleRefresh = () => {
    summaryLoadedRef.current = false;
    setSummaryLoaded(false);
    setTypeFilter('all');
    setStatusFilter('all');
    setCurrentPage(1);
    fetchPayments(1, 'all', 'all', true).then(() => setSummaryLoaded(true));
  };

  const formatAmount = (amount: number) =>
    `${CURRENCY.symbol}${amount.toLocaleString(CURRENCY.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(CURRENCY.locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const truncateId = (id: string) => {
    if (id.length <= 10) return id;
    return `${id.slice(0, 6)}...${id.slice(-4)}`;
  };

  // ============ RENDER ============
  return (
    <motion.div
      key="payments"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payments</h2>
          <p className="text-muted-foreground">Track all platform payments and transactions.</p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            {!summaryLoaded ? (
              <>
                <Skeleton className="h-7 w-28 mb-1" />
                <Skeleton className="h-4 w-20" />
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                  {formatAmount(totalRevenue)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Total Revenue</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Pending Payments */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-yellow-50 dark:bg-yellow-950/30">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            {!summaryLoaded ? (
              <>
                <Skeleton className="h-7 w-16 mb-1" />
                <Skeleton className="h-4 w-32" />
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                  {pendingCount.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Pending Payments</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Failed Payments */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/30">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
            {!summaryLoaded ? (
              <>
                <Skeleton className="h-7 w-16 mb-1" />
                <Skeleton className="h-4 w-24" />
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-red-700 dark:text-red-400">
                  {failedCount.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Failed Payments</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Refunded Payments */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800/50">
                <RotateCcw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
            {!summaryLoaded ? (
              <>
                <Skeleton className="h-7 w-16 mb-1" />
                <Skeleton className="h-4 w-24" />
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-gray-700 dark:text-gray-400">
                  {refundedCount.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Refunded Payments</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select
          value={typeFilter}
          onValueChange={(val) => handleFilterChange(val, statusFilter)}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Payment Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="listing_fee">Listing Fee</SelectItem>
            <SelectItem value="boost_fee">Boost Fee</SelectItem>
            <SelectItem value="rental">Rental</SelectItem>
            <SelectItem value="wallet_topup">Wallet Top-Up</SelectItem>
            <SelectItem value="featured_fee">Featured Fee</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(val) => handleFilterChange(typeFilter, val)}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <CreditCard className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Error State */}
      {error && !loading && (
        <Card className="border-red-200 dark:border-red-900/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-medium">Error loading payments</p>
                <p className="text-sm text-muted-foreground mt-1">{error}</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleRefresh}
              className="mt-4 gap-2"
              size="sm"
            >
              <RefreshCcw className="w-4 h-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Payments Table */}
      <Card>
        <CardContent className="p-0">
          {!error && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead className="hidden md:table-cell">Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="hidden sm:table-cell">Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Date</TableHead>
                    <TableHead className="hidden xl:table-cell">Method</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    // Loading skeleton rows
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={`skeleton-${i}`}>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <div className="space-y-1">
                              <Skeleton className="h-4 w-24" />
                              <Skeleton className="h-3 w-32" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Skeleton className="h-5 w-20 rounded-full" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Skeleton className="h-5 w-20 rounded-full" />
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : payments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <CreditCard className="w-8 h-8 opacity-50" />
                          <p className="font-medium">No payments found</p>
                          <p className="text-sm">
                            {typeFilter !== 'all' || statusFilter !== 'all'
                              ? 'Try adjusting your filters'
                              : 'Payments will appear here once transactions are made'}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    payments.map((payment) => {
                      const typeConfig = PAYMENT_TYPE_CONFIG[payment.type] || {
                        label: payment.type,
                        className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
                      };
                      const statusConfig = PAYMENT_STATUS_CONFIG[payment.status] || {
                        label: payment.status,
                        className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
                      };

                      return (
                        <TableRow key={payment.id} className="group">
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            <span title={payment.id}>{truncateId(payment.id)}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex flex-col">
                                <span className="font-medium text-sm">
                                  {payment.user?.name || 'Unknown'}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {payment.user?.email || ''}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge
                              variant="secondary"
                              className={typeConfig.className}
                            >
                              {typeConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold">
                              {formatAmount(payment.amount)}
                            </span>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge
                              variant="secondary"
                              className={statusConfig.className}
                            >
                              {statusConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                            {formatDate(payment.createdAt)}
                          </TableCell>
                          <TableCell className="hidden xl:table-cell">
                            <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                              {payment.method === 'stripe' && (
                                <CreditCard className="w-3.5 h-3.5" />
                              )}
                              {payment.method === 'wallet' && (
                                <Wallet className="w-3.5 h-3.5" />
                              )}
                              {payment.method === 'bank_transfer' && (
                                <Building2 className="w-3.5 h-3.5" />
                              )}
                              {PAYMENT_METHOD_CONFIG[payment.method] || payment.method}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!loading && !error && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Showing{' '}
            <span className="font-medium">
              {(pagination.page - 1) * pagination.limit + 1}
            </span>
            {' '}&ndash;{' '}
            <span className="font-medium">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>
            {' '}of{' '}
            <span className="font-medium">{pagination.total}</span>
            {' '}payments
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            {/* Page numbers */}
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                let pageNum: number;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    size="sm"
                    className="w-9 h-9 p-0"
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= pagination.totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
