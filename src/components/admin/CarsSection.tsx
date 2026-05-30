'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Car as CarIcon,
  RefreshCw,
  Search,
  XCircle,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import { getCars, updateCar, deleteCar, type AdminCarFilters } from '@/lib/admin-api';
import { useAdminTranslation } from '@/hooks/use-admin-translation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminCarsGrid, AdminCarsGridSkeleton } from '@/components/admin/AdminCarsGrid';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
// Skeleton Loader
// ---------------------------------------------------------------------------

function CarsPageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-9 w-20" />
      </div>
      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-36" />
      </div>
      <AdminCarsGridSkeleton />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function CarsSection() {
  const { t } = useAdminTranslation();
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
      const params: AdminCarFilters = { page, limit: 12 };
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (conditionFilter !== 'all') params.condition = conditionFilter;

      const res = await getCars(params);
      if (res.success && res.data) {
        setCars(res.data as AdminCar[]);
        setPagination(res.pagination ?? null);
      } else {
        setError(res.error ?? t('cars.loadError'));
      }
    } catch {
      setError(t('cars.networkError'));
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, conditionFilter, t]);

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
        toast.success(`${t('cars.approved')} "${car.title}"`);
        fetchCars();
      } else {
        toast.error(res.error ?? t('cars.loadError'));
      }
    } catch {
      toast.error(t('cars.networkError'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (car: AdminCar) => {
    setActionLoading(car.id);
    try {
      const res = await updateCar(car.id, { status: 'archived' });
      if (res.success) {
        toast.success(`${t('cars.rejected')} "${car.title}"`);
        fetchCars();
      } else {
        toast.error(res.error ?? t('cars.loadError'));
      }
    } catch {
      toast.error(t('cars.networkError'));
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
            ? `"${car.title}" ${t('cars.featuredDays')}`
            : `"${car.title}" ${t('cars.unfeatured')}`
        );
        fetchCars();
      } else {
        toast.error(res.error ?? t('cars.loadError'));
      }
    } catch {
      toast.error(t('cars.networkError'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkSold = async (car: AdminCar) => {
    setActionLoading(car.id);
    try {
      const res = await updateCar(car.id, { status: 'sold' });
      if (res.success) {
        toast.success(`"${car.title}" ${t('cars.markedSold')}`);
        fetchCars();
      } else {
        toast.error(res.error ?? t('cars.loadError'));
      }
    } catch {
      toast.error(t('cars.networkError'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleArchive = async (car: AdminCar) => {
    setActionLoading(car.id);
    try {
      const res = await updateCar(car.id, { status: 'archived' });
      if (res.success) {
        toast.success(`"${car.title}" ${t('cars.archivedMsg')}`);
        fetchCars();
      } else {
        toast.error(res.error ?? t('cars.loadError'));
      }
    } catch {
      toast.error(t('cars.networkError'));
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
        toast.success(`${t('cars.deleted')} "${deleteTarget.title}"`);
        fetchCars();
      } else {
        toast.error(res.error ?? t('cars.loadError'));
      }
    } catch {
      toast.error(t('cars.networkError'));
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
  if (loading) return <CarsPageSkeleton />;

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
          {t('common.retry')}
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
            <h2 className="text-lg font-semibold tracking-tight">{t('cars.title')}</h2>
            <p className="text-muted-foreground text-xs">
              {pagination?.total ?? 0} {t('cars.total')}
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
          {t('common.refresh')}
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
            placeholder={t('cars.searchPlaceholder')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-9 pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-[150px]">
            <SelectValue placeholder={t('cars.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('cars.allStatus')}</SelectItem>
            <SelectItem value="active">{t('cars.active')}</SelectItem>
            <SelectItem value="pending">{t('cars.pending')}</SelectItem>
            <SelectItem value="sold">{t('cars.sold')}</SelectItem>
            <SelectItem value="archived">{t('cars.archived')}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={conditionFilter} onValueChange={setConditionFilter}>
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue placeholder={t('cars.condition')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('cars.allCondition')}</SelectItem>
            <SelectItem value="new">{t('cars.new')}</SelectItem>
            <SelectItem value="used">{t('cars.used')}</SelectItem>
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
            {t('common.clear')}
          </Button>
        )}
      </form>

      {cars.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground rounded-lg border">
          <CarIcon className="h-10 w-10 opacity-40" />
          <p className="text-sm">{t('cars.noCars')}</p>
        </div>
      ) : (
        <AdminCarsGrid
          cars={cars}
          actionLoading={actionLoading}
          onApprove={handleApprove}
          onReject={handleReject}
          onToggleFeatured={handleToggleFeatured}
          onMarkSold={handleMarkSold}
          onArchive={handleArchive}
          onDelete={setDeleteTarget}
          onRefresh={fetchCars}
        />
      )}

      {/* ---- Pagination ---- */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-xs">
            {t('cars.showing')}{' '}
            {(pagination.page - 1) * pagination.limit + 1}
            &ndash;
            {Math.min(pagination.page * pagination.limit, pagination.total)}{' '}
            {t('cars.of')} {pagination.total}
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
            <AlertDialogTitle>{t('cars.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('cars.deleteDesc')}{' '}
              <strong className="text-foreground">
                &ldquo;{deleteTarget?.title}&rdquo;
              </strong>
              ? {t('cars.deleteWarning')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting ? t('cars.deleting') : t('cars.deleteConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
