'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car,
  Heart,
  MessageSquare,
  Settings,
  Eye,
  Plus,
  Wallet,
  CalendarCheck,
  Star,
  Trash2,
  Edit,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Clock,
  XCircle,
  AlertCircle,
  ChevronRight,
  User,
  Bell,
  Lock,
  MoreHorizontal,
  ImageIcon,
  Zap,
  Crown,
  Megaphone,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuthStore } from '@/store/auth-store';
import { useAppStore } from '@/store/app-store';
import { useTranslation } from '@/hooks/use-translation';
import { toast } from 'sonner';
import { CURRENCY } from '@/lib/constants';
import { useUserDashboard } from '@/hooks/use-user-dashboard';
import { updateUserProfile, topUpWallet, getAdvertisements, deleteAdvertisement } from '@/lib/client-api';

type TrFn = (ar: string, en: string) => string;

const mockFavorites = [
  { id: '1', title: 'Audi A4 2023', brand: 'Audi', price: 1100000, year: 2023, primaryImage: null },
  { id: '2', title: 'Porsche Cayenne 2022', brand: 'Porsche', price: 3200000, year: 2022, primaryImage: null },
  { id: '3', title: 'Tesla Model 3 2024', brand: 'Tesla', price: 1800000, year: 2024, primaryImage: null },
  { id: '4', title: 'Range Rover Sport 2023', brand: 'Range Rover', price: 4500000, year: 2023, primaryImage: null },
];

// ============ HELPERS ============
function formatPrice(price: number) {
  return `${CURRENCY.symbol}${price.toLocaleString()}`;
}

function translateStatus(status: string, tr: TrFn): string {
  const map: Record<string, [string, string]> = {
    active: ['نشط', 'active'],
    pending: ['قيد الانتظار', 'pending'],
    sold: ['مباع', 'sold'],
    confirmed: ['مؤكد', 'confirmed'],
    completed: ['مكتمل', 'completed'],
    cancelled: ['ملغى', 'cancelled'],
    published: ['منشور', 'published'],
    rejected: ['مرفوض', 'rejected'],
    draft: ['مسودة', 'draft'],
    expired: ['منتهي', 'expired'],
  };
  const pair = map[status];
  return pair ? tr(pair[0], pair[1]) : status;
}

function StatusBadge({ status, tr }: { status: string; tr: TrFn }) {
  const config: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    sold: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  };
  return (
    <Badge variant="secondary" className={config[status] || ''}>{translateStatus(status, tr)}</Badge>
  );
}

function TransactionTypeBadge({ type, tr }: { type: string; tr: TrFn }) {
  const config: Record<string, { label: [string, string]; className: string }> = {
    topup: { label: ['شحن', 'Top-Up'], className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    purchase: { label: ['شراء', 'Purchase'], className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    earning: { label: ['أرباح', 'Earning'], className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    refund: { label: ['استرداد', 'Refund'], className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
    withdrawal: { label: ['سحب', 'Withdrawal'], className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  };
  const c = config[type] || config.purchase;
  return <Badge variant="secondary" className={c.className}>{tr(c.label[0], c.label[1])}</Badge>;
}

function CarPlaceholderCard() {
  return (
    <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-t-lg flex items-center justify-center">
      <ImageIcon className="w-8 h-8 text-gray-400" />
    </div>
  );
}

// ============ MAIN COMPONENT ============
export default function UserDashboardView() {
  const { user } = useAuthStore();
  const { setView } = useAppStore();
  const { locale, isRTL } = useTranslation();
  const isAr = locale === 'ar';
  const tr = React.useCallback((ar: string, other: string) => (isAr ? ar : other), [isAr]);

  const { loading, stats, listings, bookings, activities, transactions, chatRooms, profile, refresh } =
    useUserDashboard();
  const [activeTab, setActiveTab] = useState('overview');
  const [favorites, setFavorites] = useState(mockFavorites);
  const [myAds, setMyAds] = useState<any[]>([]);
  const [adsLoading, setAdsLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    city: user?.city || 'Dubai',
    country: user?.country || 'UAE',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [topUpSubmitting, setTopUpSubmitting] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    newPassword: '',
    confirm: '',
  });
  const [notifSettings, setNotifSettings] = useState({
    emailBookings: true,
    emailMessages: true,
    emailMarketing: false,
    pushBookings: true,
    pushMessages: true,
    pushPriceDrops: true,
  });

  const [topUpAmount, setTopUpAmount] = useState('');
  const [showTopUpDialog, setShowTopUpDialog] = useState(false);

  useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.name ?? '',
        email: profile.email ?? '',
        phone: profile.phone ?? '',
        bio: profile.bio ?? '',
        city: profile.city ?? '',
        country: profile.country ?? '',
      });
    }
  }, [profile]);

  const loadMyAds = useCallback(async () => {
    setAdsLoading(true);
    const res = await getAdvertisements({ mine: true, page: 1, limit: 50 });
    setAdsLoading(false);
    if (res.success && Array.isArray(res.data)) setMyAds(res.data);
    else setMyAds([]);
  }, []);

  useEffect(() => {
    if (activeTab === 'ads') void loadMyAds();
  }, [activeTab, loadMyAds]);

  const handleSaveProfile = useCallback(async () => {
    setSavingProfile(true);
    try {
      const res = await updateUserProfile({
        name: profileForm.name,
        phone: profileForm.phone || undefined,
        bio: profileForm.bio || undefined,
        city: profileForm.city || undefined,
        country: profileForm.country || undefined,
      });
      if (res.success) {
        toast.success(res.message || tr('تم تحديث الملف الشخصي!', 'Profile updated!'));
        refresh();
      } else {
        toast.error(res.error || tr('فشل تحديث الملف الشخصي', 'Failed to update profile'));
      }
    } finally {
      setSavingProfile(false);
    }
  }, [profileForm, refresh, tr]);

  const handleTopUp = useCallback(async () => {
    const amount = Number(topUpAmount);
    if (!amount || amount < 1) {
      toast.error(tr('يرجى إدخال مبلغ صالح', 'Please enter a valid amount'));
      return;
    }
    setTopUpSubmitting(true);
    try {
      const res = await topUpWallet(amount, 'card');
      if (res.success) {
        toast.success(tr(`تم شحن المحفظة بمبلغ ${formatPrice(amount)}`, `Wallet topped up with ${formatPrice(amount)}`));
        setShowTopUpDialog(false);
        setTopUpAmount('');
        refresh();
      } else {
        toast.error(res.error || tr('فشل الشحن', 'Top-up failed'));
      }
    } finally {
      setTopUpSubmitting(false);
    }
  }, [topUpAmount, refresh, tr]);

  const removeFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
    toast.success(tr('تمت الإزالة من المفضلة', 'Removed from favorites'));
  };

  const currentBalance = stats.walletBalance;

  // ============ OVERVIEW TAB ============
  const renderOverview = () => (
    <motion.div
      key="overview"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {tr(`مرحبًا بعودتك، ${user?.name || tr('مستخدم', 'User')}! 👋`, `Welcome back, ${user?.name || 'User'}! 👋`)}
          </h2>
          <p className="text-muted-foreground">
            {tr('إليك نظرة عامة على نشاطك في CIAR Cars.', "Here's an overview of your activity on CIAR Cars.")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            className="bg-gradient-to-r from-orange-500 to-amber-600 text-white"
            onClick={() => setView('sell-car')}
          >
            <Plus className="w-4 h-4 me-2" />
            {tr('إضافة سيارة جديدة', 'Add New Car')}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: tr('الإعلانات النشطة', 'Active Listings'), value: String(stats.activeListings), change: `+${stats.totalListings - stats.activeListings}`, up: true, icon: Car, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
          { label: tr('إجمالي المشاهدات', 'Total Views'), value: String(stats.totalViews), change: '+0', up: true, icon: Eye, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
          { label: tr('الرسائل', 'Messages'), value: String(stats.unreadNotifications), change: '+0', up: true, icon: MessageSquare, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/30' },
          { label: tr('رصيد المحفظة', 'Wallet Balance'), value: formatPrice(currentBalance), change: '', up: true, icon: Wallet, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/30' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${stat.up ? 'text-emerald-600' : 'text-red-600'}`}>
                  {stat.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {stat.change}
                </div>
              </div>
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">{tr('النشاط الأخير', 'Recent Activity')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <p className="text-sm text-muted-foreground">{tr('جاري التحميل...', 'Loading...')}</p>
              ) : activities.length === 0 ? (
                <p className="text-sm text-muted-foreground">{tr('لا يوجد نشاط حديث', 'No recent activity')}</p>
              ) : (
                activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 rounded-full bg-orange-50 dark:bg-orange-950/30">
                      <Bell className="w-3.5 h-3.5 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{tr('إجراءات سريعة', 'Quick Actions')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              onClick={() => setView('sell-car')}
            >
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                <Plus className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-start">
                <p className="text-sm font-medium">{tr('إضافة سيارة جديدة', 'Add New Car')}</p>
                <p className="text-xs text-muted-foreground">{tr('اعرض سيارة للبيع', 'List a vehicle for sale')}</p>
              </div>
              <ChevronRight className={`w-4 h-4 ms-auto text-muted-foreground ${isRTL ? 'rotate-180' : ''}`} />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              onClick={() => setActiveTab('messages')}
            >
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                <MessageSquare className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-start">
                <p className="text-sm font-medium">{tr('عرض الرسائل', 'View Messages')}</p>
                <p className="text-xs text-muted-foreground">{tr('4 رسائل غير مقروءة', '4 unread messages')}</p>
              </div>
              <ChevronRight className={`w-4 h-4 ms-auto text-muted-foreground ${isRTL ? 'rotate-180' : ''}`} />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              onClick={() => setActiveTab('favorites')}
            >
              <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/30">
                <Heart className="w-4 h-4 text-red-600" />
              </div>
              <div className="text-start">
                <p className="text-sm font-medium">{tr('مفضلتي', 'My Favorites')}</p>
                <p className="text-xs text-muted-foreground">{tr('4 سيارات محفوظة', '4 saved cars')}</p>
              </div>
              <ChevronRight className={`w-4 h-4 ms-auto text-muted-foreground ${isRTL ? 'rotate-180' : ''}`} />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              onClick={() => setActiveTab('wallet')}
            >
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/30">
                <Wallet className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-start">
                <p className="text-sm font-medium">{tr('محفظتي', 'My Wallet')}</p>
                <p className="text-xs text-muted-foreground">{formatPrice(currentBalance)}</p>
              </div>
              <ChevronRight className={`w-4 h-4 ms-auto text-muted-foreground ${isRTL ? 'rotate-180' : ''}`} />
            </Button>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );

  // ============ MY LISTINGS TAB ============
  const renderMyListings = () => (
    <motion.div
      key="listings"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{tr('إعلاناتي', 'My Listings')}</h2>
          <p className="text-muted-foreground">{tr('إدارة إعلانات سياراتك.', 'Manage your car listings.')}</p>
        </div>
        <Button
          className="bg-gradient-to-r from-orange-500 to-amber-600 text-white"
          onClick={() => setView('sell-car')}
        >
          <Plus className="w-4 h-4 me-2" />
          {tr('إضافة سيارة جديدة', 'Add New Car')}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-sm text-muted-foreground col-span-full">{tr('جاري تحميل الإعلانات...', 'Loading listings...')}</p>
        ) : listings.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Car className="w-12 h-12 text-muted-foreground/40 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">{tr('لا توجد إعلانات بعد', 'No listings yet')}</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                {tr('اعرض سيارتك الأولى للبدء بالبيع على CIAR Cars.', 'List your first car to start selling on CIAR Cars.')}
              </p>
              <Button
                className="bg-gradient-to-r from-orange-500 to-amber-600 text-white"
                onClick={() => setView('sell-car')}
              >
                <Plus className="w-4 h-4 me-2" />
                {tr('إضافة سيارة جديدة', 'Add New Car')}
              </Button>
            </CardContent>
          </Card>
        ) : (
        listings.map((listing) => (
          <Card key={listing.id} className="overflow-hidden group">
            <div className="relative">
              <CarPlaceholderCard />
              <div className="absolute top-2 start-2 flex gap-1.5">
                <StatusBadge status={listing.status} tr={tr} />
                {listing.isFeatured && (
                  <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    <Crown className="w-3 h-3 me-0.5" />{tr('مميز', 'Featured')}
                  </Badge>
                )}
              </div>
              <div className="absolute top-2 end-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/90 dark:bg-black/60 backdrop-blur-sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="w-4 h-4 me-2" />{tr('عرض', 'View')}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="w-4 h-4 me-2" />{tr('تعديل', 'Edit')}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Zap className="w-4 h-4 me-2 text-amber-600" />
                      <span className="text-amber-600">{tr('تعزيز', 'Boost')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Star className="w-4 h-4 me-2 text-amber-600" />
                      <span className="text-amber-600">{tr('تمييز', 'Feature')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="w-4 h-4 me-2" />{tr('حذف', 'Delete')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm truncate">{listing.title}</h3>
              <p className="text-lg font-bold text-orange-600 mt-1">{formatPrice(listing.price)}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{listing.views}</span>
                <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" />{listing.inquiries}</span>
                <span className="flex items-center gap-1"><CalendarCheck className="w-3.5 h-3.5" />{listing.year}</span>
              </div>
            </CardContent>
          </Card>
        )))}
      </div>
    </motion.div>
  );

  // ============ MY ADS TAB ============
  const renderMyAds = () => (
    <motion.div
      key="ads"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{tr('إعلاناتي', 'My Ads')}</h2>
          <p className="text-muted-foreground">{tr('إدارة إعلاناتك المدفوعة ومتابعة حالتها.', 'Manage your paid ads and track their status.')}</p>
        </div>
        <Button onClick={() => setView('create-advertisement')}>
          <Plus className="w-4 h-4 me-2" />
          {tr('إعلان جديد', 'New Ad')}
        </Button>
      </div>

      <div className="space-y-3">
        {adsLoading ? (
          <p className="text-sm text-muted-foreground">{tr('جاري التحميل...', 'Loading...')}</p>
        ) : myAds.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Megaphone className="w-12 h-12 text-muted-foreground/40 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">{tr('لا توجد إعلانات بعد', 'No ads yet')}</p>
              <Button className="mt-4" onClick={() => setView('create-advertisement')}>
                <Plus className="w-4 h-4 me-2" />
                {tr('أنشئ إعلانك الأول', 'Create your first ad')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          myAds.map((ad) => (
            <Card key={ad.id}>
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-semibold truncate">{ad.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {ad.category} · {ad.price} {ad.currency} · {tr('مشاهدات', 'Views')} {ad.viewsCount || 0}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <StatusBadge status={ad.status} tr={tr} />
                    <Badge variant="outline">{ad.paymentStatus}</Badge>
                    {ad.rejectedReason && (
                      <Badge variant="destructive" className="max-w-[220px] truncate">
                        {ad.rejectedReason}
                      </Badge>
                    )}
                    {ad.endsAt && (
                      <Badge variant="secondary">
                        {tr('حتى', 'Until')} {new Date(ad.endsAt).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {ad.status === 'published' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setView('advertisement-detail', { id: ad.id })}
                    >
                      <Eye className="w-3.5 h-3.5 me-1" />
                      {tr('عرض', 'View')}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={async () => {
                      const res = await deleteAdvertisement(ad.id);
                      if (res.success) {
                        toast.success(tr('تم حذف الإعلان', 'Ad deleted'));
                        void loadMyAds();
                      } else toast.error(res.error || tr('فشل الحذف', 'Delete failed'));
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </motion.div>
  );

  // ============ MY BOOKINGS TAB ============
  const renderMyBookings = () => (
    <motion.div
      key="bookings"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{tr('حجوزاتي', 'My Bookings')}</h2>
        <p className="text-muted-foreground">{tr('تتبع حجوزات الإيجار والحجوزات الخاصة بك.', 'Track your rental bookings and reservations.')}</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">{tr('جاري تحميل الحجوزات...', 'Loading bookings...')}</p>
        ) : bookings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <CalendarCheck className="w-12 h-12 text-muted-foreground/40 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">{tr('لا توجد حجوزات بعد', 'No bookings yet')}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {tr('تصفح السيارات المتاحة للإيجار لإجراء أول حجز.', 'Browse cars available for rent to make your first booking.')}
              </p>
            </CardContent>
          </Card>
        ) : (
        bookings.map((booking) => (
          <Card key={booking.id} className="overflow-hidden">
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm">{booking.car}</h3>
                    <StatusBadge status={booking.status} tr={tr} />
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {tr('المالك', 'Owner')}: {booking.owner}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {booking.startDate} — {booking.endDate}
                    </span>
                    <span>{booking.totalDays} {tr('أيام', 'days')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-end">
                    <p className="text-lg font-bold">{formatPrice(booking.totalPrice)}</p>
                    <p className="text-xs text-muted-foreground">{tr('الإجمالي', 'Total')}</p>
                  </div>
                  <div className="flex gap-2">
                    {booking.status === 'pending' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30">
                            <XCircle className="w-3.5 h-3.5 me-1" />{tr('إلغاء', 'Cancel')}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent dir={isRTL ? 'rtl' : 'ltr'}>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{tr('إلغاء الحجز', 'Cancel Booking')}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {tr(
                                `هل أنت متأكد من إلغاء حجزك لـ ${booking.car}؟ لا يمكن التراجع عن هذا الإجراء.`,
                                `Are you sure you want to cancel your booking for ${booking.car}? This action cannot be undone.`
                              )}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{tr('الإبقاء على الحجز', 'Keep Booking')}</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => toast.success(tr('تم إلغاء الحجز', 'Booking cancelled'))}
                            >
                              {tr('إلغاء الحجز', 'Cancel Booking')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    {booking.status === 'completed' && (
                      <Button variant="outline" size="sm" className="text-orange-600 border-orange-200 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-950/30">
                        <Star className="w-3.5 h-3.5 me-1" />{tr('تقييم', 'Review')}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )))}
      </div>
    </motion.div>
  );

  // ============ FAVORITES TAB ============
  const renderFavorites = () => (
    <motion.div
      key="favorites"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{tr('مفضلتي', 'My Favorites')}</h2>
        <p className="text-muted-foreground">{tr('السيارات التي حفظتها لاحقًا.', "Cars you've saved for later.")}</p>
      </div>

      {favorites.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Heart className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">{tr('لا توجد مفضلات بعد', 'No favorites yet')}</p>
            <p className="text-sm text-muted-foreground mt-1">{tr('ابدأ التصفح واحفظ السيارات التي تعجبك!', 'Start browsing and save cars you like!')}</p>
            <Button className="mt-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white" onClick={() => setView('listing')}>
              {tr('تصفح السيارات', 'Browse Cars')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {favorites.map((fav) => (
            <Card key={fav.id} className="overflow-hidden group">
              <div className="relative">
                <CarPlaceholderCard />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 end-2 h-8 w-8 bg-white/90 dark:bg-black/60 backdrop-blur-sm text-red-500 hover:text-red-600"
                  onClick={() => removeFavorite(fav.id)}
                >
                  <Heart className="w-4 h-4 fill-current" />
                </Button>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm truncate">{fav.title}</h3>
                <p className="text-xs text-muted-foreground">{fav.year} &middot; {fav.brand}</p>
                <p className="text-base font-bold text-orange-600 mt-2">{formatPrice(fav.price)}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3"
                  onClick={() => setView('detail')}
                >
                  {tr('عرض التفاصيل', 'View Details')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );

  // ============ WALLET TAB ============
  const renderWallet = () => (
    <motion.div
      key="wallet"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{tr('محفظتي', 'My Wallet')}</h2>
        <p className="text-muted-foreground">{tr('إدارة رصيدك ومعاملاتك.', 'Manage your balance and transactions.')}</p>
      </div>

      {/* Balance Card */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">{tr('الرصيد المتاح', 'Available Balance')}</p>
              <p className="text-3xl font-bold mt-1">{formatPrice(currentBalance)}</p>
            </div>
            <div className="p-3 rounded-full bg-white/20">
              <Wallet className="w-8 h-8" />
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <Dialog open={showTopUpDialog} onOpenChange={setShowTopUpDialog}>
              <DialogTrigger asChild>
                <Button variant="secondary" className="bg-white text-orange-600 hover:bg-orange-50 font-medium">
                  <Plus className="w-4 h-4 me-2" />
                  {tr('شحن المحفظة', 'Top Up Wallet')}
                </Button>
              </DialogTrigger>
              <DialogContent dir={isRTL ? 'rtl' : 'ltr'}>
                <DialogHeader>
                  <DialogTitle>{tr('شحن المحفظة', 'Top Up Wallet')}</DialogTitle>
                  <DialogDescription>{tr('أضف رصيدًا إلى محفظة CIAR Cars.', 'Add funds to your CIAR Cars wallet.')}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-3 gap-2">
                    {[500, 1000, 5000, 10000, 25000, 50000].map((amount) => (
                      <Button
                        key={amount}
                        variant={topUpAmount === String(amount) ? 'default' : 'outline'}
                        className="text-sm"
                        onClick={() => setTopUpAmount(String(amount))}
                      >
                        {formatPrice(amount)}
                      </Button>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Label>{tr('أو أدخل مبلغًا مخصصًا', 'Or enter custom amount')}</Label>
                    <Input
                      type="number"
                      placeholder={tr('أدخل المبلغ', 'Enter amount')}
                      value={topUpAmount}
                      onChange={(e) => setTopUpAmount(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowTopUpDialog(false)}>{tr('إلغاء', 'Cancel')}</Button>
                  <Button
                    className="bg-gradient-to-r from-orange-500 to-amber-600 text-white"
                    disabled={topUpSubmitting}
                    onClick={handleTopUp}
                  >
                    {topUpSubmitting ? tr('جاري المعالجة...', 'Processing...') : tr('شحن', 'Top Up')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
              <ArrowUpRight className="w-4 h-4 me-2" />
              {tr('سحب', 'Withdraw')}
            </Button>
          </div>
        </div>
      </Card>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{tr('سجل المعاملات', 'Transaction History')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{tr('الوصف', 'Description')}</TableHead>
                <TableHead>{tr('النوع', 'Type')}</TableHead>
                <TableHead>{tr('المبلغ', 'Amount')}</TableHead>
                <TableHead>{tr('الرصيد', 'Balance')}</TableHead>
                <TableHead className="hidden sm:table-cell">{tr('التاريخ', 'Date')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!loading && transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    {tr('لا توجد معاملات بعد', 'No transactions yet')}
                  </TableCell>
                </TableRow>
              ) : null}
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium text-sm max-w-[200px] truncate">{tx.description ?? '—'}</TableCell>
                  <TableCell><TransactionTypeBadge type={tx.type} tr={tr} /></TableCell>
                  <TableCell className={`font-medium ${tx.amount >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {tx.amount >= 0 ? '+' : ''}{formatPrice(tx.amount)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">—</TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );

  // ============ MESSAGES TAB ============
  const renderMessages = () => (
    <motion.div
      key="messages"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{tr('الرسائل', 'Messages')}</h2>
        <p className="text-muted-foreground">{tr('محادثاتك مع المستخدمين الآخرين.', 'Your conversations with other users.')}</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[600px]">
            <div className="divide-y">
              {loading ? (
                <p className="p-6 text-sm text-muted-foreground">{tr('جاري تحميل الرسائل...', 'Loading messages...')}</p>
              ) : chatRooms.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground/40 mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">{tr('لا توجد رسائل بعد', 'No messages yet')}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {tr('ابدأ محادثة من صفحة إعلان سيارة.', 'Start a conversation from a car listing.')}
                  </p>
                </div>
              ) : (
              chatRooms.map((room) => (
                <button
                  key={room.id}
                  className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors text-start"
                  onClick={() => setView('chat')}
                >
                  <Avatar className="h-11 w-11 shrink-0">
                    <AvatarFallback className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-sm font-medium">
                      {room.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-medium text-sm truncate">{room.name}</span>
                      <span className="text-xs text-muted-foreground shrink-0">{room.time}</span>
                    </div>
                    {room.carTitle && (
                      <p className="text-xs text-muted-foreground truncate mb-0.5">{tr('بخصوص', 'Re')}: {room.carTitle}</p>
                    )}
                    <p className="text-sm text-muted-foreground truncate">{room.lastMessage}</p>
                  </div>
                  {room.unread > 0 && (
                    <Badge className="bg-orange-500 text-white shrink-0 h-5 min-w-[20px] flex items-center justify-center px-1.5 text-[10px] font-bold">
                      {room.unread}
                    </Badge>
                  )}
                </button>
              )))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );

  // ============ SETTINGS TAB ============
  const renderSettings = () => (
    <motion.div
      key="settings"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{tr('الإعدادات', 'Settings')}</h2>
        <p className="text-muted-foreground">{tr('إدارة إعدادات حسابك وتفضيلاتك.', 'Manage your account settings and preferences.')}</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4" />{tr('معلومات الملف الشخصي', 'Profile Information')}
          </CardTitle>
          <CardDescription>{tr('حدّث بياناتك الشخصية.', 'Update your personal details.')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="settings-name">{tr('الاسم الكامل', 'Full Name')}</Label>
              <Input
                id="settings-name"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-email">{tr('البريد الإلكتروني', 'Email')}</Label>
              <Input
                id="settings-email"
                type="email"
                value={profileForm.email}
                readOnly
                className="bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-phone">{tr('الهاتف', 'Phone')}</Label>
              <Input
                id="settings-phone"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-city">{tr('المدينة', 'City')}</Label>
              <Input
                id="settings-city"
                value={profileForm.city}
                onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-bio">{tr('نبذة', 'Bio')}</Label>
            <Textarea
              id="settings-bio"
              value={profileForm.bio}
              onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
              placeholder={tr('أخبرنا عن نفسك...', 'Tell us about yourself...')}
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="bg-gradient-to-r from-orange-500 to-amber-600 text-white"
            disabled={savingProfile}
            onClick={handleSaveProfile}
          >
            {savingProfile ? tr('جاري الحفظ...', 'Saving...') : tr('حفظ التغييرات', 'Save Changes')}
          </Button>
        </CardFooter>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="w-4 h-4" />{tr('تغيير كلمة المرور', 'Change Password')}
          </CardTitle>
          <CardDescription>{tr('حدّث كلمة المرور لأمان حسابك.', 'Update your password for security.')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">{tr('كلمة المرور الحالية', 'Current Password')}</Label>
            <Input
              id="current-password"
              type="password"
              value={passwordForm.current}
              onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">{tr('كلمة المرور الجديدة', 'New Password')}</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">{tr('تأكيد كلمة المرور الجديدة', 'Confirm New Password')}</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordForm.confirm}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="bg-gradient-to-r from-orange-500 to-amber-600 text-white"
            onClick={() => {
              if (!passwordForm.current || !passwordForm.newPassword) {
                toast.error(tr('يرجى تعبئة جميع الحقول', 'Please fill in all fields'));
                return;
              }
              toast.success(tr('تم تغيير كلمة المرور بنجاح!', 'Password changed successfully!'));
              setPasswordForm({ current: '', newPassword: '', confirm: '' });
            }}
          >
            {tr('تحديث كلمة المرور', 'Update Password')}
          </Button>
        </CardFooter>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="w-4 h-4" />{tr('تفضيلات الإشعارات', 'Notification Preferences')}
          </CardTitle>
          <CardDescription>{tr('اختر الإشعارات التي تريد استلامها.', 'Choose what notifications you want to receive.')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-sm font-medium mb-3">{tr('إشعارات البريد الإلكتروني', 'Email Notifications')}</p>
            <div className="space-y-4">
              {[
                { key: 'emailBookings' as const, label: tr('تحديثات الحجز', 'Booking Updates'), desc: tr('إشعار بتغيّر حالة الحجز', 'Get notified about booking status changes') },
                { key: 'emailMessages' as const, label: tr('رسائل جديدة', 'New Messages'), desc: tr('استلام بريد عند رسائل الدردشة الجديدة', 'Receive email for new chat messages') },
                { key: 'emailMarketing' as const, label: tr('رسائل تسويقية', 'Marketing Emails'), desc: tr('عروض وترويجات ونشرات', 'Promotions, offers, and newsletters') },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">{item.label}</Label>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={notifSettings[item.key]}
                    onCheckedChange={(checked) =>
                      setNotifSettings({ ...notifSettings, [item.key]: checked })
                    }
                  />
                </div>
              ))}
            </div>
          </div>
          <Separator />
          <div>
            <p className="text-sm font-medium mb-3">{tr('إشعارات الدفع', 'Push Notifications')}</p>
            <div className="space-y-4">
              {[
                { key: 'pushBookings' as const, label: tr('تحديثات الحجز', 'Booking Updates'), desc: tr('إشعارات الحجز الفورية', 'Real-time booking notifications') },
                { key: 'pushMessages' as const, label: tr('رسائل جديدة', 'New Messages'), desc: tr('إشعارات الدردشة الفورية', 'Real-time chat notifications') },
                { key: 'pushPriceDrops' as const, label: tr('انخفاض الأسعار', 'Price Drops'), desc: tr('تنبيه عند انخفاض أسعار السيارات المحفوظة', 'Alert when saved car prices drop') },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">{item.label}</Label>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch
                    checked={notifSettings[item.key]}
                    onCheckedChange={(checked) =>
                      setNotifSettings({ ...notifSettings, [item.key]: checked })
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="bg-gradient-to-r from-orange-500 to-amber-600 text-white"
            onClick={() => toast.success(tr('تم حفظ تفضيلات الإشعارات!', 'Notification preferences saved!'))}
          >
            {tr('حفظ التفضيلات', 'Save Preferences')}
          </Button>
        </CardFooter>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-900/50">
        <CardHeader>
          <CardTitle className="text-base text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />{tr('منطقة الخطر', 'Danger Zone')}
          </CardTitle>
          <CardDescription>{tr('إجراءات لا يمكن التراجع عنها لحسابك.', 'Irreversible actions for your account.')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{tr('حذف الحساب', 'Delete Account')}</p>
              <p className="text-xs text-muted-foreground">
                {tr('حذف حسابك نهائيًا وجميع البيانات المرتبطة به.', 'Permanently delete your account and all associated data.')}
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30">
                  {tr('حذف الحساب', 'Delete Account')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent dir={isRTL ? 'rtl' : 'ltr'}>
                <AlertDialogHeader>
                  <AlertDialogTitle>{tr('هل أنت متأكد تمامًا؟', 'Are you absolutely sure?')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {tr(
                      'لا يمكن التراجع عن هذا الإجراء. سيتم حذف حسابك نهائيًا وجميع إعلاناتك ورسائلك وبياناتك المرتبطة من خوادمنا.',
                      'This action cannot be undone. This will permanently delete your account, all your listings, messages, and remove all associated data from our servers.'
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{tr('إلغاء', 'Cancel')}</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => toast.error(tr('تم طلب حذف الحساب. (تجريبي فقط)', 'Account deletion requested. (Demo only)'))}
                  >
                    {tr('حذف الحساب', 'Delete Account')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50/50 to-orange-50/30 dark:from-gray-950 dark:to-gray-900" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setView('home')} className="h-9 w-9">
              <ArrowUpRight className={`w-4 h-4 ${isRTL ? '' : 'rotate-180'}`} />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{tr('لوحة التحكم', 'My Dashboard')}</h1>
              <p className="text-sm text-muted-foreground">{tr('إدارة سياراتك وحجوزاتك وملفك الشخصي', 'Manage your cars, bookings, and profile')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative" onClick={() => setActiveTab('messages')}>
              <MessageSquare className="w-4 h-4" />
              <span className="absolute -top-0.5 -end-0.5 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                4
              </span>
            </Button>
            <Button variant="ghost" size="icon" className="relative" onClick={() => setView('notifications')}>
              <Bell className="w-4 h-4" />
              <span className="absolute -top-0.5 -end-0.5 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                2
              </span>
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full flex overflow-x-auto bg-muted/80 p-1 rounded-xl mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-1.5 text-sm shrink-0">
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tr('نظرة عامة', 'Overview')}</span>
            </TabsTrigger>
            <TabsTrigger value="listings" className="flex items-center gap-1.5 text-sm shrink-0">
              <Car className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tr('إعلاناتي', 'My Listings')}</span>
            </TabsTrigger>
            <TabsTrigger value="ads" className="flex items-center gap-1.5 text-sm shrink-0">
              <Megaphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tr('إعلاناتي المدفوعة', 'My Ads')}</span>
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-1.5 text-sm shrink-0">
              <CalendarCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tr('حجوزاتي', 'My Bookings')}</span>
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-1.5 text-sm shrink-0">
              <Heart className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tr('المفضلة', 'Favorites')}</span>
            </TabsTrigger>
            <TabsTrigger value="wallet" className="flex items-center gap-1.5 text-sm shrink-0">
              <Wallet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tr('المحفظة', 'Wallet')}</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-1.5 text-sm shrink-0 relative">
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tr('الرسائل', 'Messages')}</span>
              <span className="h-4 min-w-[16px] rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center px-1">
                4
              </span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1.5 text-sm shrink-0">
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tr('الإعدادات', 'Settings')}</span>
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="overview">{renderOverview()}</TabsContent>
            <TabsContent value="listings">{renderMyListings()}</TabsContent>
            <TabsContent value="ads">{renderMyAds()}</TabsContent>
            <TabsContent value="bookings">{renderMyBookings()}</TabsContent>
            <TabsContent value="favorites">{renderFavorites()}</TabsContent>
            <TabsContent value="wallet">{renderWallet()}</TabsContent>
            <TabsContent value="messages">{renderMessages()}</TabsContent>
            <TabsContent value="settings">{renderSettings()}</TabsContent>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}
