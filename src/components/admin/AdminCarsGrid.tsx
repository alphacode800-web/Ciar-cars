'use client';

import { useState } from 'react';
import {
  Star,
  MapPin,
  Eye,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Trash2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { CURRENCY } from '@/lib/constants';
import { useAdminTranslation } from '@/hooks/use-admin-translation';
import { AdminCarDetailDialog } from './AdminCarDetailDialog';

export interface AdminCarItem {
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
  mileage?: number | null;
  fuelType?: string | null;
  transmission?: string | null;
  bodyType?: string | null;
  description?: string | null;
  isFeatured: boolean;
  viewsCount: number;
  primaryImage: string | null;
  owner?: { name: string | null; email: string };
}

function formatPrice(price: number) {
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
    default:
      return 'bg-gray-100 text-gray-600';
  }
}

function fallbackImage(car: AdminCarItem) {
  const hash = car.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return `https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=450&fit=crop&q=60&auto=format&seed=${hash}`;
}

interface AdminCarsGridProps {
  cars: AdminCarItem[];
  actionLoading: string | null;
  onApprove: (car: AdminCarItem) => void;
  onReject: (car: AdminCarItem) => void;
  onToggleFeatured: (car: AdminCarItem) => void;
  onMarkSold: (car: AdminCarItem) => void;
  onArchive: (car: AdminCarItem) => void;
  onDelete: (car: AdminCarItem) => void;
  onRefresh: () => void;
}

export function AdminCarsGrid({
  cars,
  actionLoading,
  onApprove,
  onReject,
  onToggleFeatured,
  onMarkSold,
  onArchive,
  onDelete,
  onRefresh,
}: AdminCarsGridProps) {
  const { t } = useAdminTranslation();
  const [selected, setSelected] = useState<AdminCarItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const openDetail = (car: AdminCarItem) => {
    setSelected(car);
    setDialogOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cars.map((car) => (
          <article
            key={car.id}
            className="group relative rounded-2xl border border-white/10 bg-card/80 backdrop-blur-sm overflow-hidden shadow-lg shadow-black/5 hover:shadow-xl hover:border-amber-500/20 transition-all duration-300 cursor-pointer"
            onClick={() => openDetail(car)}
          >
            <div className="aspect-[16/10] relative overflow-hidden bg-muted">
              <img
                src={car.primaryImage || fallbackImage(car)}
                alt={car.title}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                <Badge className={`text-[10px] capitalize ${statusColor(car.status)}`}>
                  {t(`cars.${car.status}` as 'cars.active') || car.status}
                </Badge>
                {car.isFeatured && (
                  <Badge className="text-[10px] gap-0.5 bg-amber-500/90 text-white border-0">
                    <Star className="h-2.5 w-2.5 fill-white" />
                    {t('common.featured')}
                  </Badge>
                )}
              </div>
              <div className="absolute bottom-2 left-2 right-2">
                <p className="text-white font-semibold text-sm line-clamp-1 drop-shadow">{car.title}</p>
                <p className="text-white/90 text-lg font-bold">{formatPrice(car.price)}</p>
              </div>
              <div className="absolute top-2 right-2" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 bg-black/40 hover:bg-black/60 text-white border-0"
                      disabled={actionLoading === car.id}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    {car.status === 'pending' && (
                      <>
                        <DropdownMenuItem onClick={() => onApprove(car)} className="text-emerald-600">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {t('cars.approve')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onReject(car)} className="text-red-600">
                          <XCircle className="h-4 w-4 mr-2" />
                          {t('cars.reject')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem onClick={() => onToggleFeatured(car)}>
                      <Star className="h-4 w-4 mr-2" />
                      {car.isFeatured ? t('cars.unfeature') : t('cars.feature')}
                    </DropdownMenuItem>
                    {car.status === 'active' && (
                      <DropdownMenuItem onClick={() => onMarkSold(car)}>{t('cars.markSold')}</DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onArchive(car)}>{t('cars.archive')}</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onClick={() => onDelete(car)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('common.delete')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="p-3 space-y-1 text-xs text-muted-foreground">
              <p>
                {car.brand} {car.model} · {car.year}
              </p>
              <p className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {car.city}, {car.country}
              </p>
              <p className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {car.viewsCount} {t('common.views')}
              </p>
            </div>
          </article>
        ))}
      </div>

      <AdminCarDetailDialog
        car={selected}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        actionLoading={actionLoading}
        onApprove={onApprove}
        onReject={onReject}
        onToggleFeatured={onToggleFeatured}
        onMarkSold={onMarkSold}
        onArchive={onArchive}
        onDelete={onDelete}
        onSaved={onRefresh}
      />
    </>
  );
}

export function AdminCarsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="aspect-[4/5] rounded-xl" />
      ))}
    </div>
  );
}
