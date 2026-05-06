'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  Plus,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  ArrowRight,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  ShoppingBag,
  Gift,
  Loader2,
  X,
  CheckCircle,
  Filter,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Banknote,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/store/auth-store';
import { CURRENCY, WALLET_TRANSACTION_TYPES, DEFAULT_PAGE_SIZE } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { WalletTransaction, WalletTransactionType, ApiResponse, PaginatedResponse } from '@/types';
import { format, parseISO } from 'date-fns';

// ============ Types ============

interface WalletData {
  balance: number;
  transactions: WalletTransaction[];
}

// ============ Icon mapping ============

function getTransactionIcon(type: WalletTransactionType) {
  switch (type) {
    case 'topup':
      return <ArrowDownToLine className="h-4 w-4" />;
    case 'purchase':
      return <ShoppingBag className="h-4 w-4" />;
    case 'refund':
      return <RefreshCw className="h-4 w-4" />;
    case 'earning':
      return <Gift className="h-4 w-4" />;
    case 'withdrawal':
      return <ArrowUpFromLine className="h-4 w-4" />;
    default:
      return <Wallet className="h-4 w-4" />;
  }
}

function getTransactionColor(type: WalletTransactionType) {
  switch (type) {
    case 'topup':
    case 'earning':
    case 'refund':
      return 'text-emerald-600 bg-emerald-50';
    case 'purchase':
    case 'withdrawal':
      return 'text-destructive bg-destructive/10';
    default:
      return 'text-muted-foreground bg-muted';
  }
}

function getTransactionBadgeVariant(type: WalletTransactionType): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (type) {
    case 'topup':
    case 'earning':
    case 'refund':
      return 'default';
    case 'purchase':
    case 'withdrawal':
      return 'destructive';
    default:
      return 'secondary';
  }
}

function isPositiveAmount(type: WalletTransactionType): boolean {
  return ['topup', 'earning', 'refund'].includes(type);
}

function formatAmount(amount: number, type: WalletTransactionType): string {
  const prefix = isPositiveAmount(type) ? '+' : '-';
  return `${prefix} ${CURRENCY.symbol}${Math.abs(amount).toLocaleString('en-US')}`;
}

// ============ Preset Amounts ============

const PRESET_AMOUNTS = [100, 500, 1000, 5000];

// ============ Top Up Modal ============

function TopUpModal({
  open,
  onOpenChange,
  balance,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  balance: number;
  onSuccess: () => void;
}) {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<string>('card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount < 1) {
      setError('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Simulate top-up (would call a payment API in production)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In production, this would be:
      // const res = await fetch('/api/users/wallet/topup', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ amount: numAmount, method: paymentMethod }),
      // });
      // const data = await res.json();

      onOpenChange(false);
      setAmount('');
      onSuccess();
    } catch {
      setError('Top-up failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [amount, paymentMethod, onOpenChange, onSuccess]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Top Up Wallet
          </DialogTitle>
          <DialogDescription>
            Add funds to your CIAR wallet
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Current Balance */}
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Current Balance</p>
            <p className="text-lg font-bold">{CURRENCY.symbol}{balance.toLocaleString('en-US')}</p>
          </div>

          {/* Preset Amounts */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Quick Amount</label>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_AMOUNTS.map((preset) => (
                <Button
                  key={preset}
                  variant={amount === String(preset) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAmount(String(preset))}
                  className="text-sm"
                >
                  {CURRENCY.symbol}{preset.toLocaleString()}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div className="space-y-2">
            <label htmlFor="topup-amount">Custom Amount ({CURRENCY.code})</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {CURRENCY.symbol}
              </span>
              <Input
                id="topup-amount"
                type="number"
                placeholder="0"
                min={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <label>Payment Method</label>
            <div className="space-y-2">
              <button
                onClick={() => setPaymentMethod('card')}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors',
                  paymentMethod === 'card'
                    ? 'border-primary bg-primary/5'
                    : 'border-input hover:bg-muted/50'
                )}
              >
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Credit / Debit Card</p>
                  <p className="text-xs text-muted-foreground">Visa, Mastercard, Meza</p>
                </div>
              </button>
              <button
                onClick={() => setPaymentMethod('bank')}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors',
                  paymentMethod === 'bank'
                    ? 'border-primary bg-primary/5'
                    : 'border-input hover:bg-muted/50'
                )}
              >
                <Banknote className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Bank Transfer</p>
                  <p className="text-xs text-muted-foreground">Direct bank deposit</p>
                </div>
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !amount || parseFloat(amount) < 1}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Confirm Top Up
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============ Transaction Row Skeleton ============

function TransactionRowSkeleton() {
  return (
    <tr className="border-b last:border-0">
      <td className="py-3 pr-4"><Skeleton className="h-4 w-20" /></td>
      <td className="py-3 pr-4"><Skeleton className="h-4 w-32" /></td>
      <td className="py-3 pr-4 text-right"><Skeleton className="ml-auto h-4 w-24" /></td>
      <td className="py-3 text-right"><Skeleton className="ml-auto h-4 w-20" /></td>
    </tr>
  );
}

// ============ Main Component ============

export default function WalletView() {
  const { user } = useAuthStore();
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterType, setFilterType] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [topUpOpen, setTopUpOpen] = useState(false);

  // ============ Fetch Wallet ============

  const fetchWallet = useCallback(async (pageNum: number, typeFilter: string) => {
    try {
      setIsLoading(true);
      setError(null);

      let url = `/api/users/wallet?page=${pageNum}&limit=${DEFAULT_PAGE_SIZE}`;
      if (typeFilter !== 'all') {
        url += `&type=${typeFilter}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setWalletData({
          balance: data.data.balance,
          transactions: data.data.transactions,
        });
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages);
        }
      } else {
        setError(data.error || 'Failed to load wallet');
      }
    } catch {
      setError('Failed to load wallet data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWallet(page, filterType);
  }, [page, filterType, fetchWallet]);

  // ============ Filtered Transactions ============

  const transactions = useMemo(() => {
    if (!walletData) return [];
    return walletData.transactions;
  }, [walletData]);

  const balance = walletData?.balance ?? user?.walletBalance ?? 0;

  // ============ Render ============

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold md:text-3xl">My Wallet</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your funds, transactions, and payments
        </p>
      </motion.div>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <Card className="overflow-hidden">
          <div className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-6 md:p-8">
            {/* Background decoration */}
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
            <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-white/5" />

            <div className="relative">
              <div className="flex items-center gap-2 text-primary-foreground/80">
                <Wallet className="h-5 w-5" />
                <span className="text-sm font-medium">Available Balance</span>
              </div>
              <h2 className="mt-2 text-4xl font-bold text-primary-foreground md:text-5xl">
                {CURRENCY.symbol}{isLoading ? '...' : balance.toLocaleString('en-US')}
              </h2>
              <p className="mt-1 text-sm text-primary-foreground/70">
                {CURRENCY.name}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-0 border-t">
            <button
              onClick={() => setTopUpOpen(true)}
              className="flex flex-col items-center gap-2 border-r p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <Plus className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium">Top Up</span>
            </button>
            <button className="flex flex-col items-center gap-2 border-r p-4 transition-colors hover:bg-muted/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                <ArrowUpFromLine className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium">Withdraw</span>
            </button>
            <button className="flex flex-col items-center gap-2 p-4 transition-colors hover:bg-muted/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-50 text-violet-600">
                <ArrowLeftRight className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium">Transfer</span>
            </button>
          </div>
        </Card>
      </motion.div>

      {/* Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-lg">Transaction History</CardTitle>
              <CardDescription>Your recent wallet transactions</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <Select value={filterType} onValueChange={(v) => { setFilterType(v); setPage(1); }}>
                  <SelectTrigger className="h-8 w-[140px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {WALLET_TRANSACTION_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="py-8 text-center">
                <p className="text-sm text-destructive">{error}</p>
                <Button variant="outline" className="mt-2" onClick={() => fetchWallet(page, filterType)}>
                  Retry
                </Button>
              </div>
            ) : isLoading && !walletData ? (
              <div className="space-y-0">
                {Array.from({ length: 5 }).map((_, i) => (
                  <TransactionRowSkeleton key={i} />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-4">
                  <Wallet className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p className="mt-2 text-sm font-medium text-muted-foreground">
                  No transactions found
                </p>
                <p className="text-xs text-muted-foreground">
                  {filterType !== 'all' ? 'Try changing the filter' : 'Top up your wallet to get started'}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-xs font-medium text-muted-foreground">
                        <th className="pb-3 pr-4">Date</th>
                        <th className="pb-3 pr-4">Type</th>
                        <th className="pb-3 pr-4">Description</th>
                        <th className="pb-3 text-right">Amount</th>
                        <th className="pb-3 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {transactions.map((tx, idx) => {
                          const typeLabel = WALLET_TRANSACTION_TYPES.find(
                            (t) => t.value === tx.type
                          )?.label || tx.type;

                          return (
                            <motion.tr
                              key={tx.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: idx * 0.03 }}
                              className="border-b last:border-0"
                            >
                              <td className="py-3 pr-4 whitespace-nowrap text-muted-foreground">
                                {tx.createdAt
                                  ? format(
                                      typeof tx.createdAt === 'string'
                                        ? parseISO(tx.createdAt)
                                        : new Date(tx.createdAt),
                                      'MMM d, HH:mm'
                                    )
                                  : '-'}
                              </td>
                              <td className="py-3 pr-4">
                                <div className="flex items-center gap-2">
                                  <div
                                    className={cn(
                                      'flex h-7 w-7 items-center justify-center rounded-full',
                                      getTransactionColor(tx.type as WalletTransactionType)
                                    )}
                                  >
                                    {getTransactionIcon(tx.type as WalletTransactionType)}
                                  </div>
                                  <span className="text-xs font-medium capitalize">{typeLabel}</span>
                                </div>
                              </td>
                              <td className="py-3 pr-4 max-w-[200px] truncate">
                                {tx.description || '-'}
                              </td>
                              <td
                                className={cn(
                                  'py-3 pr-4 text-right font-semibold whitespace-nowrap',
                                  isPositiveAmount(tx.type as WalletTransactionType)
                                    ? 'text-emerald-600'
                                    : 'text-destructive'
                                )}
                              >
                                <span className="inline-flex items-center gap-0.5">
                                  {isPositiveAmount(tx.type as WalletTransactionType) ? (
                                    <ArrowDownLeft className="h-3 w-3" />
                                  ) : (
                                    <ArrowUpRight className="h-3 w-3" />
                                  )}
                                  {CURRENCY.symbol}
                                  {Math.abs(tx.amount).toLocaleString('en-US')}
                                </span>
                              </td>
                              <td className="py-3 text-right font-medium text-muted-foreground whitespace-nowrap">
                                {CURRENCY.symbol}{tx.balance.toLocaleString('en-US')}
                              </td>
                            </motion.tr>
                          );
                        })}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="gap-1"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (page <= 3) {
                          pageNum = i + 1;
                        } else if (page >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }
                        return (
                          <Button
                            key={pageNum}
                            variant={page === pageNum ? 'default' : 'outline'}
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="gap-1"
                    >
                      Next
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Top Up Modal */}
      <TopUpModal
        open={topUpOpen}
        onOpenChange={setTopUpOpen}
        balance={balance}
        onSuccess={() => fetchWallet(1, 'all')}
      />
    </div>
  );
}
