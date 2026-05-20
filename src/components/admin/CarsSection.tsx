'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Car as CarIcon,
  CheckCircle,
  Eye,
  MoreHorizontal,
  RefreshCw,
  Search,
  Star,
  Trash2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import { getCars, updateCar, deleteCar, type AdminCarFilters } from '@/lib/admin-api';
import { useAppStore } from '@/store/app-store';
import { CURRENCY } from '@/lib/constants';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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

interface CarOwner {
  id: string;
  name: string | null;
  email: string;
}

interface CarCount {
  reviews: number;
  rentalBookings: number;
}

interface AdminCar {
  id: string;
  title: string;
  slug: string;
  brand: string;
  model: string;
  year: number;
  condition: string;
  status: string;
  price: number;
  city: string;
  country: string;
  isFeatured: boolean;
  isBoosted: boolean;
  viewsCount: number;
  createdAt: string;
  owner: CarOwner;
  primaryImage: string | null;
  _count: CarCount;
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

function statusColor(status: string) {
  switch (status) {
    case 'active':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400';
    case 'pending':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400';
    case 'sold':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400';
    case 'archived':
      return 'bg-gray-100 text-gray-600 dark:bg-gray-800/40 dark:text-gray-400';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(CURRENCY.locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function fallbackImage(car: AdminCar): string {
  // Deterministic fallback based on car id
  const hash = car.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return `https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=200&h=120&fit=crop&q=60&auto=format&seed=${hash}`;
}

// ---------------------------------------------------------------------------
// Skeleton Loader
// ---------------------------------------------------------------------------

function CarsTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-7 w-40" />
        </div>
        <Skeleton className="h-9 w-20 rounded-md" />
      </div>
      {/* Filters skeleton */}
      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-9 w-64 rounded-md" />
        <Skeleton className="h-9 w-36 rounded-md" />
        <Skeleton className="h-9 w-36 rounded-md" />
      </div>
      {/* Table skeleton */}
      <div className="rounded-lg border">
        <div className="border-b p-4">
          <div className="flex gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b p-4 last:border-0">
            <Skeleton className="h-8 w-12 rounded" />
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function CarsSection() {
  const setView = useAppStore((s) => s.setView);

  // -- Data state --
  const [cars, setCars] = useState<AdminCar[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // -- Filter state --
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [conditionFilter, setConditionFilter] = useState('all');
  const [page, setPage] = useState(1);

  // -- Delete dialog state --
  const [deleteTarget, setDeleteTarget] = useState<AdminCar | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ---------------------------------------------------------------------------
  // Fetch cars
  // ---------------------------------------------------------------------------
  const fetchCars = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: AdminCarFilters = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (conditionFilter !== 'all') params.condition = conditionFilter;

      const res = await getCars(params);
      if (res.success && res.data) {
        setCars(res.data as AdminCar[]);
        setPagination(res.pagination ?? null);
      } else {
        setError(res.error ?? 'Failed to load cars');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, conditionFilter]);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, conditionFilter]);

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------
  const handleApprove = async (car: AdminCar) => {
    setActionLoading(car.id);
    try {
      const res = await updateCar(car.id, { status: 'active' });
      if (res.success) {
        toast.success(`"${car.title}" has been approved`);
        fetchCars();
      } else {
        toast.error(res.error ?? 'Failed to approve car');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (car: AdminCar) => {
    setActionLoading(car.id);
    try {
      const res = await updateCar(car.id, { status: 'archived' });
      if (res.success) {
        toast.success(`"${car.title}" has been rejected`);
        fetchCars();
      } else {
        toast.error(res.error ?? 'Failed to reject car');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleFeatured = async (car: AdminCar) => {
    setActionLoading(car.id);
    const newFeatured = !car.isFeatured;
    try {
      const res = await updateCar(car.id, {
        isFeatured: newFeatured,
        featuredUntil: newFeatured
          ? new Date(Date.now() + 30 * 86400000).toISOString()
          : null,
      });
      if (res.success) {
        toast.success(
          newFeatured
            ? `"${car.title}" featured for 30 days`
            : `"${car.title}" removed from featured`
        );
        fetchCars();
      } else {
        toast.error(res.error ?? 'Failed to update featured status');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkSold = async (car: AdminCar) => {
    setActionLoading(car.id);
    try {
      const res = await updateCar(car.id, { status: 'sold' });
      if (res.success) {
        toast.success(`"${car.title}" marked as sold`);
        fetchCars();
      } else {
        toast.error(res.error ?? 'Failed to mark as sold');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleArchive = async (car: AdminCar) => {
    setActionLoading(car.id);
    try {
      const res = await updateCar(car.id, { status: 'archived' });
      if (res.success) {
        toast.success(`"${car.title}" archived`);
        fetchCars();
      } else {
        toast.error(res.error ?? 'Failed to archive car');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await deleteCar(deleteTarget.id);
      if (res.success) {
        toast.success(`"${deleteTarget.title}" has been deleted`);
        fetchCars();
      } else {
        toast.error(res.error ?? 'Failed to delete car');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  if (loading) return <CarsTableSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <AlertCircle className="h-7 w-7 text-red-600 dark:text-red-400" />
        </div>
        <p className="text-muted-foreground text-sm">{error}</p>
        <Button
          variant="outline"
          onClick={fetchCars}
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
            <CarIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Cars Management</h2>
            <p className="text-muted-foreground text-xs">
              {pagination?.total ?? 0} total cars
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchCars}
          className="gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {/* ---- Filters ---- */}
      <form
        onSubmit={handleSearch}
        className="flex flex-wrap items-center gap-3"
      >
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search cars..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-9 pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>

        <Select value={conditionFilter} onValueChange={setConditionFilter}>
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue placeholder="Condition" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Condition</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="used">Used</SelectItem>
          </SelectContent>
        </Select>

        {(search || statusFilter !== 'all' || conditionFilter !== 'all') && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchInput('');
              setSearch('');
              setStatusFilter('all');
              setConditionFilter('all');
            }}
            className="text-muted-foreground gap-1.5"
          >
            <XCircle className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}
      </form>

      {/* ---- Table ---- */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-[56px]">Image</TableHead>
              <TableHead>Car</TableHead>
              <TableHead className="hidden md:table-cell">Owner</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden sm:table-cell">Featured</TableHead>
              <TableHead className="hidden lg:table-cell">Views</TableHead>
              <TableHead className="w-[52px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cars.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <CarIcon className="h-8 w-8 opacity-40" />
                    <p className="text-sm">No cars found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              cars.map((car) => (
                <TableRow key={car.id}>
                  {/* Thumbnail */}
                  <TableCell>
                    <div className="h-8 w-12 overflow-hidden rounded border bg-muted">
                      <img
                        src={car.primaryImage || fallbackImage(car)}
                        alt={car.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </TableCell>

                  {/* Title */}
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="max-w-[200px] truncate text-sm font-medium">
                        {car.title}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {car.brand} {car.model} &middot; {car.year}
                      </span>
                    </div>
                  </TableCell>

                  {/* Owner */}
                  <TableCell className="hidden md:table-cell">
                    <span className="text-muted-foreground text-sm truncate max-w-[140px] block">
                      {car.owner?.name || car.owner?.email || '—'}
                    </span>
                  </TableCell>

                  {/* Price */}
                  <TableCell>
                    <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                      {formatPrice(car.price)}
                    </span>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`text-[11px] capitalize ${statusColor(car.status)}`}
                    >
                      {car.status}
                    </Badge>
                  </TableCell>

                  {/* Featured */}
                  <TableCell className="hidden sm:table-cell">
                    {car.isFeatured ? (
                      <Badge className="gap-1 border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        Featured
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>

                  {/* Views */}
                  <TableCell className="hidden lg:table-cell">
                    <span className="text-muted-foreground text-xs">
                      {car.viewsCount.toLocaleString()}
                    </span>
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          disabled={actionLoading === car.id}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        {/* View */}
                        <DropdownMenuItem
                          onClick={() => setView('detail', { carId: car.id, slug: car.slug })}
                          className="gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </DropdownMenuItem>

                        {/* Conditional: pending */}
                        {car.status === 'pending' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleApprove(car)}
                              className="gap-2 text-emerald-600 focus:text-emerald-700 dark:text-emerald-400"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleReject(car)}
                              className="gap-2 text-red-600 focus:text-red-700 dark:text-red-400"
                            >
                              <XCircle className="h-4 w-4" />
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}

                        {/* Feature / Unfeature */}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleToggleFeatured(car)}
                          className="gap-2"
                        >
                          <Star className={`h-4 w-4 ${car.isFeatured ? 'fill-amber-500 text-amber-500' : ''}`} />
                          {car.isFeatured ? 'Unfeature' : 'Feature for 30 days'}
                        </DropdownMenuItem>

                        {/* Mark as Sold */}
                        {car.status === 'active' && (
                          <DropdownMenuItem
                            onClick={() => handleMarkSold(car)}
                            className="gap-2 text-blue-600 focus:text-blue-700 dark:text-blue-400"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Mark as Sold
                          </DropdownMenuItem>
                        )}

                        {/* Archive */}
                        {(car.status === 'active' || car.status === 'sold') && (
                          <DropdownMenuItem
                            onClick={() => handleArchive(car)}
                            className="gap-2"
                          >
                            <ImageIcon className="h-4 w-4" />
                            Archive
                          </DropdownMenuItem>
                        )}

                        {/* Delete */}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeleteTarget(car)}
                          className="gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
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
                // Show first, last, and pages around current
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

      {/* ---- Delete Confirmation ---- */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Car</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <strong className="text-foreground">
                &ldquo;{deleteTarget?.title}&rdquo;
              </strong>
              ? This action cannot be undone. All associated images, reviews, and
              booking history will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete Car'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
