'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  CalendarDays,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Eye,
  FileText,
  MoreHorizontal,
  Play,
  RefreshCw,
  StickyNote,
  StopCircle,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import { getBookings, updateBooking, type AdminBookingFilters } from '@/lib/admin-api';
import { CURRENCY } from '@/lib/constants';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BookingCar {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  owner: { id: string; name: string | null };
}

interface BookingUser {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
}

interface AdminBooking {
  id: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  dailyPrice: number;
  platformFee: number;
  notes: string | null;
  createdAt: string;
  car: BookingCar;
  user: BookingUser;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatPrice(price: number): string {
  return `${CURRENCY.symbol}${price.toLocaleString(CURRENCY.locale)}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(CURRENCY.locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getDurationDays(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  const diff = e.getTime() - s.getTime();
  return Math.max(1, Math.ceil(diff / 86400000));
}

function bookingStatusStyle(status: string) {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400';
    case 'confirmed':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400';
    case 'active':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400';
    case 'completed':
      return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400';
    case 'cancelled':
      return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}

function paymentStatusStyle(status: string) {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400';
    case 'paid':
    case 'completed':
      return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400';
    case 'failed':
      return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400';
    case 'refunded':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}

// ---------------------------------------------------------------------------
// Skeleton Loader
// ---------------------------------------------------------------------------

function BookingsTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-7 w-44" />
        </div>
        <Skeleton className="h-9 w-20 rounded-md" />
      </div>
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-9 w-40 rounded-md" />
        <Skeleton className="h-9 w-44 rounded-md" />
      </div>
      {/* Table */}
      <div className="rounded-lg border">
        <div className="border-b p-4">
          <div className="flex gap-4">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b p-4 last:border-0">
            {Array.from({ length: 9 }).map((_, j) => (
              <Skeleton key={j} className="h-4 w-16" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function BookingsSection() {
  // -- Data state --
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // -- Filter state --
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [page, setPage] = useState(1);

  // -- Dialog states --
  const [detailBooking, setDetailBooking] = useState<AdminBooking | null>(null);
  const [cancelTarget, setCancelTarget] = useState<AdminBooking | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [notesTarget, setNotesTarget] = useState<AdminBooking | null>(null);
  const [notesValue, setNotesValue] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // ---------------------------------------------------------------------------
  // Fetch bookings
  // ---------------------------------------------------------------------------
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: AdminBookingFilters = { page, limit: 10 };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (paymentFilter !== 'all') params.paymentStatus = paymentFilter;

      const res = await getBookings(params);
      if (res.success && res.data) {
        setBookings(res.data as AdminBooking[]);
        setPagination(res.pagination ?? null);
      } else {
        setError(res.error ?? 'Failed to load bookings');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, paymentFilter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, paymentFilter]);

  // ---------------------------------------------------------------------------
  // Summary calculations
  // ---------------------------------------------------------------------------
  const summary = {
    pending: bookings.filter((b) => b.status === 'pending').length,
    active: bookings.filter((b) => b.status === 'active').length,
    completed: bookings.filter((b) => b.status === 'completed').length,
    revenue: bookings
      .filter((b) => b.status === 'completed')
      .reduce((sum, b) => sum + b.totalPrice, 0),
  };

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------
  const handleApprove = async (booking: AdminBooking) => {
    setActionLoading(booking.id);
    try {
      const res = await updateBooking(booking.id, { status: 'confirmed' });
      if (res.success) {
        toast.success(`Booking #${booking.id.slice(0, 8)} approved`);
        fetchBookings();
      } else {
        toast.error(res.error ?? 'Failed to approve booking');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStartRental = async (booking: AdminBooking) => {
    setActionLoading(booking.id);
    try {
      const res = await updateBooking(booking.id, { status: 'active' });
      if (res.success) {
        toast.success(`Rental started for Booking #${booking.id.slice(0, 8)}`);
        fetchBookings();
      } else {
        toast.error(res.error ?? 'Failed to start rental');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (booking: AdminBooking) => {
    setActionLoading(booking.id);
    try {
      const res = await updateBooking(booking.id, { status: 'completed' });
      if (res.success) {
        toast.success(`Booking #${booking.id.slice(0, 8)} completed`);
        fetchBookings();
      } else {
        toast.error(res.error ?? 'Failed to complete booking');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      const res = await updateBooking(cancelTarget.id, { status: 'cancelled' });
      if (res.success) {
        toast.success(`Booking #${cancelTarget.id.slice(0, 8)} cancelled`);
        fetchBookings();
      } else {
        toast.error(res.error ?? 'Failed to cancel booking');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setCancelling(false);
      setCancelTarget(null);
    }
  };

  const handleSaveNotes = async () => {
    if (!notesTarget) return;
    setSavingNotes(true);
    try {
      const res = await updateBooking(notesTarget.id, { notes: notesValue });
      if (res.success) {
        toast.success('Notes saved');
        fetchBookings();
        setNotesTarget(null);
      } else {
        toast.error(res.error ?? 'Failed to save notes');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSavingNotes(false);
    }
  };

  const openNotesDialog = (booking: AdminBooking) => {
    setNotesTarget(booking);
    setNotesValue(booking.notes ?? '');
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  if (loading) return <BookingsTableSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <AlertCircle className="h-7 w-7 text-red-600 dark:text-red-400" />
        </div>
        <p className="text-muted-foreground text-sm">{error}</p>
        <Button
          variant="outline"
          onClick={fetchBookings}
          className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ---- Header ---- */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm">
            <CalendarDays className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Bookings Management
            </h2>
            <p className="text-muted-foreground text-xs">
              {pagination?.total ?? 0} total bookings
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchBookings}
          className="gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {/* ---- Summary Cards ---- */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {/* Pending */}
        <div className="rounded-xl border bg-gradient-to-br from-yellow-50 to-amber-50 p-4 dark:from-yellow-950/30 dark:to-amber-950/30">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900/40">
              <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            </div>
            <span className="text-muted-foreground text-xs font-medium">
              Pending
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-yellow-700 dark:text-yellow-400">
            {summary.pending}
          </p>
        </div>

        {/* Active */}
        <div className="rounded-xl border bg-gradient-to-br from-emerald-50 to-teal-50 p-4 dark:from-emerald-950/30 dark:to-teal-950/30">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
              <Play className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-muted-foreground text-xs font-medium">
              Active
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-700 dark:text-emerald-400">
            {summary.active}
          </p>
        </div>

        {/* Completed */}
        <div className="rounded-xl border bg-gradient-to-br from-green-50 to-emerald-50 p-4 dark:from-green-950/30 dark:to-emerald-950/30">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/40">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-muted-foreground text-xs font-medium">
              Completed
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-green-700 dark:text-green-400">
            {summary.completed}
          </p>
        </div>

        {/* Revenue */}
        <div className="rounded-xl border bg-gradient-to-br from-teal-50 to-cyan-50 p-4 dark:from-teal-950/30 dark:to-cyan-950/30">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/40">
              <DollarSign className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            </div>
            <span className="text-muted-foreground text-xs font-medium">
              Total Revenue
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold text-teal-700 dark:text-teal-400">
            {formatPrice(summary.revenue)}
          </p>
        </div>
      </div>

      {/* ---- Filters ---- */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-[170px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <SelectTrigger className="h-9 w-[180px]">
            <SelectValue placeholder="Payment Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payment Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>

        {(statusFilter !== 'all' || paymentFilter !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStatusFilter('all');
              setPaymentFilter('all');
            }}
            className="text-muted-foreground gap-1.5"
          >
            <XCircle className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}
      </div>

      {/* ---- Table ---- */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-[90px]">ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead className="hidden md:table-cell">Car</TableHead>
              <TableHead className="hidden lg:table-cell">Dates</TableHead>
              <TableHead className="hidden sm:table-cell">Duration</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Payment</TableHead>
              <TableHead className="w-[52px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <CalendarDays className="h-8 w-8 opacity-40" />
                    <p className="text-sm">No bookings found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((booking) => {
                const days = getDurationDays(booking.startDate, booking.endDate);
                return (
                  <TableRow key={booking.id}>
                    {/* ID */}
                    <TableCell>
                      <span className="text-muted-foreground font-mono text-xs">
                        #{booking.id.slice(0, 8)}
                      </span>
                    </TableCell>

                    {/* User */}
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium truncate max-w-[140px]">
                          {booking.user?.name || 'Unknown'}
                        </span>
                        <span className="text-muted-foreground text-xs truncate max-w-[140px]">
                          {booking.user?.email}
                        </span>
                      </div>
                    </TableCell>

                    {/* Car */}
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm truncate max-w-[180px] block">
                        {booking.car?.title || 'Unknown'}
                      </span>
                    </TableCell>

                    {/* Dates */}
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex flex-col">
                        <span className="text-xs">
                          {formatDate(booking.startDate)}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          → {formatDate(booking.endDate)}
                        </span>
                      </div>
                    </TableCell>

                    {/* Duration */}
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-muted-foreground text-xs">
                        {days} {days === 1 ? 'day' : 'days'}
                      </span>
                    </TableCell>

                    {/* Amount */}
                    <TableCell>
                      <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                        {formatPrice(booking.totalPrice)}
                      </span>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`text-[11px] capitalize ${bookingStatusStyle(booking.status)}`}
                      >
                        {booking.status}
                      </Badge>
                    </TableCell>

                    {/* Payment */}
                    <TableCell className="hidden sm:table-cell">
                      <Badge
                        variant="secondary"
                        className={`text-[11px] capitalize ${paymentStatusStyle(booking.paymentStatus)}`}
                      >
                        {booking.paymentStatus}
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            disabled={actionLoading === booking.id}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />

                          {/* View Details */}
                          <DropdownMenuItem
                            onClick={() => setDetailBooking(booking)}
                            className="gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            View Details
                          </DropdownMenuItem>

                          {/* Approve (pending → confirmed) */}
                          {booking.status === 'pending' && (
                            <DropdownMenuItem
                              onClick={() => handleApprove(booking)}
                              className="gap-2 text-emerald-600 focus:text-emerald-700 dark:text-emerald-400"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Approve
                            </DropdownMenuItem>
                          )}

                          {/* Start Rental (confirmed → active) */}
                          {booking.status === 'confirmed' && (
                            <DropdownMenuItem
                              onClick={() => handleStartRental(booking)}
                              className="gap-2 text-blue-600 focus:text-blue-700 dark:text-blue-400"
                            >
                              <Play className="h-4 w-4" />
                              Start Rental
                            </DropdownMenuItem>
                          )}

                          {/* Complete (active → completed) */}
                          {booking.status === 'active' && (
                            <DropdownMenuItem
                              onClick={() => handleComplete(booking)}
                              className="gap-2 text-green-600 focus:text-green-700 dark:text-green-400"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Complete
                            </DropdownMenuItem>
                          )}

                          {/* Cancel */}
                          {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setCancelTarget(booking)}
                                className="gap-2"
                              >
                                <StopCircle className="h-4 w-4" />
                                Cancel Booking
                              </DropdownMenuItem>
                            </>
                          )}

                          {/* Add Notes */}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => openNotesDialog(booking)}
                            className="gap-2"
                          >
                            <StickyNote className="h-4 w-4" />
                            {booking.notes ? 'Edit Notes' : 'Add Notes'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* ---- Pagination ---- */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-xs">
            Showing {(pagination.page - 1) * pagination.limit + 1}
            &ndash;
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={pagination.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous page</span>
            </Button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter((p) => {
                return (
                  p === 1 ||
                  p === pagination.totalPages ||
                  Math.abs(p - pagination.page) <= 1
                );
              })
              .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) {
                  acc.push('ellipsis');
                }
                acc.push(p);
                return acc;
              }, [])
              .map((item, idx) =>
                item === 'ellipsis' ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="text-muted-foreground px-1 text-xs"
                  >
                    ...
                  </span>
                ) : (
                  <Button
                    key={item}
                    variant={pagination.page === item ? 'default' : 'outline'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setPage(item)}
                  >
                    {item}
                  </Button>
                )
              )}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next page</span>
            </Button>
          </div>
        </div>
      )}

      {/* ---- Booking Detail Dialog ---- */}
      <Dialog open={!!detailBooking} onOpenChange={(open) => !open && setDetailBooking(null)}>
        <DialogContent className="max-w-lg">
          {detailBooking && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-600" />
                  Booking Details
                </DialogTitle>
                <DialogDescription>
                  Full information for Booking #{detailBooking.id.slice(0, 8)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 text-sm">
                {/* Status & Payment */}
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="secondary"
                    className={`text-xs capitalize ${bookingStatusStyle(detailBooking.status)}`}
                  >
                    {detailBooking.status}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className={`text-xs capitalize ${paymentStatusStyle(detailBooking.paymentStatus)}`}
                  >
                    Payment: {detailBooking.paymentStatus}
                  </Badge>
                </div>

                {/* User Info */}
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground mb-1 text-xs font-medium uppercase tracking-wide">
                    Renter
                  </p>
                  <p className="font-medium">{detailBooking.user?.name || 'Unknown'}</p>
                  <p className="text-muted-foreground text-xs">
                    {detailBooking.user?.email}
                    {detailBooking.user?.phone && ` · ${detailBooking.user.phone}`}
                  </p>
                </div>

                {/* Car Info */}
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground mb-1 text-xs font-medium uppercase tracking-wide">
                    Vehicle
                  </p>
                  <p className="font-medium">{detailBooking.car?.title || 'Unknown'}</p>
                  {detailBooking.car?.owner && (
                    <p className="text-muted-foreground text-xs">
                      Owner: {detailBooking.car.owner.name || 'Unknown'}
                    </p>
                  )}
                </div>

                {/* Dates */}
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground mb-1 text-xs font-medium uppercase tracking-wide">
                    Rental Period
                  </p>
                  <p className="font-medium">
                    {formatDate(detailBooking.startDate)} → {formatDate(detailBooking.endDate)}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {getDurationDays(detailBooking.startDate, detailBooking.endDate)} days
                  </p>
                </div>

                {/* Financials */}
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">
                    Financial Summary
                  </p>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Daily Price</span>
                      <span>{formatPrice(detailBooking.dailyPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Platform Fee</span>
                      <span>{formatPrice(detailBooking.platformFee)}</span>
                    </div>
                    <div className="border-t pt-1">
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span className="text-emerald-700 dark:text-emerald-400">
                          {formatPrice(detailBooking.totalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {detailBooking.notes && (
                  <div className="rounded-lg border p-3">
                    <p className="text-muted-foreground mb-1 text-xs font-medium uppercase tracking-wide">
                      Notes
                    </p>
                    <p className="whitespace-pre-wrap">{detailBooking.notes}</p>
                  </div>
                )}

                {/* Created */}
                <p className="text-muted-foreground text-xs">
                  Created on {formatDate(detailBooking.createdAt)}
                </p>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDetailBooking(null)}
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ---- Cancel Confirmation ---- */}
      <AlertDialog
        open={!!cancelTarget}
        onOpenChange={(open) => !open && setCancelTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel booking{' '}
              <strong className="text-foreground">
                #{cancelTarget?.id.slice(0, 8)}
              </strong>{' '}
              for{' '}
              <strong className="text-foreground">
                {cancelTarget?.user?.name}
              </strong>
              ? This will notify both the renter and car owner. Refund policy will
              apply based on the cancellation timeframe.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>Keep Booking</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={cancelling}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Booking'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ---- Notes Dialog ---- */}
      <Dialog open={!!notesTarget} onOpenChange={(open) => !open && setNotesTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <StickyNote className="h-5 w-5 text-emerald-600" />
              {notesTarget?.notes ? 'Edit Notes' : 'Add Notes'}
            </DialogTitle>
            <DialogDescription>
              Add internal notes for Booking #{notesTarget?.id.slice(0, 8)}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter notes about this booking..."
            value={notesValue}
            onChange={(e) => setNotesValue(e.target.value)}
            rows={5}
            className="resize-none"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNotesTarget(null)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveNotes}
              disabled={savingNotes}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {savingNotes ? 'Saving...' : 'Save Notes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
