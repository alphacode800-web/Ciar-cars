'use client';

import React, { useState, useMemo } from 'react';
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
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Package,
  CreditCard,
  ChevronRight,
  Shield,
  User,
  Bell,
  Lock,
  MoreHorizontal,
  LogOut,
  ImageIcon,
  Zap,
  Crown,
  Ban,
  Search,
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
import { Skeleton } from '@/components/ui/skeleton';
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
import { toast } from 'sonner';
import { CURRENCY } from '@/lib/constants';
import type { CarStatus, BookingStatus, WalletTransactionType } from '@/types';

// ============ MOCK DATA ============
const mockUserListings = [
  {
    id: '1',
    title: 'BMW 320i 2023',
    brand: 'BMW',
    year: 2023,
    price: 1250000,
    status: 'active' as CarStatus,
    isFeatured: true,
    views: 234,
    inquiries: 12,
    primaryImage: null,
  },
  {
    id: '2',
    title: 'Mercedes C200 2022',
    brand: 'Mercedes-Benz',
    year: 2022,
    price: 980000,
    status: 'active' as CarStatus,
    isFeatured: false,
    views: 156,
    inquiries: 8,
    primaryImage: null,
  },
  {
    id: '3',
    title: 'Toyota Corolla 2024',
    brand: 'Toyota',
    year: 2024,
    price: 650000,
    status: 'pending' as CarStatus,
    isFeatured: false,
    views: 0,
    inquiries: 0,
    primaryImage: null,
  },
  {
    id: '4',
    title: 'Hyundai Accent 2021',
    brand: 'Hyundai',
    year: 2021,
    price: 380000,
    status: 'sold' as CarStatus,
    isFeatured: false,
    views: 89,
    inquiries: 5,
    primaryImage: null,
  },
];

const mockBookings = [
  {
    id: '1',
    car: 'BMW 320i 2023',
    owner: 'Sara Ali',
    startDate: 'Mar 15, 2024',
    endDate: 'Mar 20, 2024',
    totalDays: 5,
    totalPrice: 5000,
    status: 'active' as BookingStatus,
  },
  {
    id: '2',
    car: 'Mercedes C200 2022',
    owner: 'Ahmed Mohamed',
    startDate: 'Apr 1, 2024',
    endDate: 'Apr 5, 2024',
    totalDays: 4,
    totalPrice: 3600,
    status: 'confirmed' as BookingStatus,
  },
  {
    id: '3',
    car: 'Toyota Camry 2023',
    owner: 'Omar Hassan',
    startDate: 'Apr 10, 2024',
    endDate: 'Apr 12, 2024',
    totalDays: 2,
    totalPrice: 1800,
    status: 'pending' as BookingStatus,
  },
  {
    id: '4',
    car: 'Nissan Sunny 2022',
    owner: 'Karim Ibrahim',
    startDate: 'Feb 20, 2024',
    endDate: 'Feb 22, 2024',
    totalDays: 2,
    totalPrice: 1200,
    status: 'completed' as BookingStatus,
  },
  {
    id: '5',
    car: 'Kia Sportage 2023',
    owner: 'Nour El-Din',
    startDate: 'Mar 5, 2024',
    endDate: 'Mar 8, 2024',
    totalDays: 3,
    totalPrice: 2100,
    status: 'cancelled' as BookingStatus,
  },
];

const mockFavorites = [
  { id: '1', title: 'Audi A4 2023', brand: 'Audi', price: 1100000, year: 2023, primaryImage: null },
  { id: '2', title: 'Porsche Cayenne 2022', brand: 'Porsche', price: 3200000, year: 2022, primaryImage: null },
  { id: '3', title: 'Tesla Model 3 2024', brand: 'Tesla', price: 1800000, year: 2024, primaryImage: null },
  { id: '4', title: 'Range Rover Sport 2023', brand: 'Range Rover', price: 4500000, year: 2023, primaryImage: null },
];

const mockTransactions = [
  { id: '1', type: 'topup' as WalletTransactionType, amount: 10000, balance: 10000, description: 'Wallet top-up via card', date: 'Mar 15, 2024' },
  { id: '2', type: 'purchase' as WalletTransactionType, amount: -500, balance: 9500, description: 'Featured listing fee', date: 'Mar 14, 2024' },
  { id: '3', type: 'purchase' as WalletTransactionType, amount: -200, balance: 9300, description: 'Boost listing fee', date: 'Mar 13, 2024' },
  { id: '4', type: 'earning' as WalletTransactionType, amount: 4500, balance: 13800, description: 'Rental earning - BMW 320i', date: 'Mar 10, 2024' },
  { id: '5', type: 'refund' as WalletTransactionType, amount: 1200, balance: 15000, description: 'Cancelled booking refund', date: 'Mar 8, 2024' },
  { id: '6', type: 'purchase' as WalletTransactionType, amount: -3600, balance: 11400, description: 'Rental payment - Mercedes', date: 'Mar 5, 2024' },
];

const mockChatRooms = [
  { id: '1', name: 'Sara Ali', lastMessage: 'Is the BMW still available?', time: '2 min ago', unread: 3, carTitle: 'BMW 320i 2023' },
  { id: '2', name: 'Omar Hassan', lastMessage: 'I can come see the car tomorrow', time: '1 hr ago', unread: 1, carTitle: 'Mercedes C200 2022' },
  { id: '3', name: 'Karim Ibrahim', lastMessage: 'Thanks for the info!', time: '3 hrs ago', unread: 0, carTitle: 'Toyota Corolla 2024' },
  { id: '4', name: 'Support Team', lastMessage: 'Your listing has been approved', time: '1 day ago', unread: 0, carTitle: null },
  { id: '5', name: 'Nour El-Din', lastMessage: 'Can you send more photos?', time: '2 days ago', unread: 0, carTitle: 'Hyundai Accent 2021' },
];

const mockActivities = [
  { text: 'Your listing "BMW 320i" got 15 new views', time: '1 hr ago', icon: Eye },
  { text: 'Sara Ali sent you a message', time: '2 hrs ago', icon: MessageSquare },
  { text: 'Your booking for Mercedes C200 is confirmed', time: '5 hrs ago', icon: CheckCircle2 },
  { text: 'You earned $4,500 from rental', time: '1 day ago', icon: Wallet },
];

// ============ HELPERS ============
function formatPrice(price: number) {
  return `${CURRENCY.symbol}${price.toLocaleString()}`;
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    sold: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };
  return (
    <Badge variant="secondary" className={config[status] || ''}>{status}</Badge>
  );
}

function TransactionTypeBadge({ type }: { type: string }) {
  const config: Record<string, { label: string; className: string }> = {
    topup: { label: 'Top-Up', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
    purchase: { label: 'Purchase', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    earning: { label: 'Earning', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    refund: { label: 'Refund', className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
    withdrawal: { label: 'Withdrawal', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  };
  const c = config[type] || config.purchase;
  return <Badge variant="secondary" className={c.className}>{c.label}</Badge>;
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
  const [activeTab, setActiveTab] = useState('overview');
  const [favorites, setFavorites] = useState(mockFavorites);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    city: user?.city || 'Dubai',
    country: user?.country || 'UAE',
  });
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

  const removeFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
    toast.success('Removed from favorites');
  };

  const currentBalance = 11400;

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
            Welcome back, {user?.name || 'User'}! 👋
          </h2>
          <p className="text-muted-foreground">
            Here&apos;s an overview of your activity on CIAR Cars.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            className="bg-gradient-to-r from-orange-500 to-amber-600 text-white"
            onClick={() => setView('sell-car')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Car
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Listings', value: '3', change: '+1', up: true, icon: Car, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
          { label: 'Total Views', value: '479', change: '+42', up: true, icon: Eye, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
          { label: 'Messages', value: '4', change: '+3', up: true, icon: MessageSquare, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/30' },
          { label: 'Wallet Balance', value: formatPrice(currentBalance), change: '+$4,500', up: true, icon: Wallet, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/30' },
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
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockActivities.map((activity, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 rounded-full bg-orange-50 dark:bg-orange-950/30">
                    <activity.icon className="w-3.5 h-3.5 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{activity.text}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
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
              <div className="text-left">
                <p className="text-sm font-medium">Add New Car</p>
                <p className="text-xs text-muted-foreground">List a vehicle for sale</p>
              </div>
              <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              onClick={() => setActiveTab('messages')}
            >
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                <MessageSquare className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">View Messages</p>
                <p className="text-xs text-muted-foreground">4 unread messages</p>
              </div>
              <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              onClick={() => setActiveTab('favorites')}
            >
              <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/30">
                <Heart className="w-4 h-4 text-red-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">My Favorites</p>
                <p className="text-xs text-muted-foreground">4 saved cars</p>
              </div>
              <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              onClick={() => setActiveTab('wallet')}
            >
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/30">
                <Wallet className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">My Wallet</p>
                <p className="text-xs text-muted-foreground">{formatPrice(currentBalance)}</p>
              </div>
              <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
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
          <h2 className="text-2xl font-bold tracking-tight">My Listings</h2>
          <p className="text-muted-foreground">Manage your car listings.</p>
        </div>
        <Button
          className="bg-gradient-to-r from-orange-500 to-amber-600 text-white"
          onClick={() => setView('sell-car')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Car
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockUserListings.map((listing) => (
          <Card key={listing.id} className="overflow-hidden group">
            <div className="relative">
              <CarPlaceholderCard />
              <div className="absolute top-2 left-2 flex gap-1.5">
                <StatusBadge status={listing.status} />
                {listing.isFeatured && (
                  <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    <Crown className="w-3 h-3 mr-0.5" />Featured
                  </Badge>
                )}
              </div>
              <div className="absolute top-2 right-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/90 dark:bg-black/60 backdrop-blur-sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="w-4 h-4 mr-2" />View
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="w-4 h-4 mr-2" />Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Zap className="w-4 h-4 mr-2 text-amber-600" />
                      <span className="text-amber-600">Boost</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Star className="w-4 h-4 mr-2 text-amber-600" />
                      <span className="text-amber-600">Feature</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="w-4 h-4 mr-2" />Delete
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
        ))}
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
        <h2 className="text-2xl font-bold tracking-tight">My Bookings</h2>
        <p className="text-muted-foreground">Track your rental bookings and reservations.</p>
      </div>

      <div className="space-y-4">
        {mockBookings.map((booking) => (
          <Card key={booking.id} className="overflow-hidden">
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm">{booking.car}</h3>
                    <StatusBadge status={booking.status} />
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Owner: {booking.owner}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {booking.startDate} — {booking.endDate}
                    </span>
                    <span>{booking.totalDays} days</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-bold">{formatPrice(booking.totalPrice)}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  <div className="flex gap-2">
                    {booking.status === 'pending' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30">
                            <XCircle className="w-3.5 h-3.5 mr-1" />Cancel
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to cancel your booking for {booking.car}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => toast.success('Booking cancelled')}
                            >
                              Cancel Booking
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    {booking.status === 'completed' && (
                      <Button variant="outline" size="sm" className="text-orange-600 border-orange-200 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-950/30">
                        <Star className="w-3.5 h-3.5 mr-1" />Review
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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
        <h2 className="text-2xl font-bold tracking-tight">My Favorites</h2>
        <p className="text-muted-foreground">Cars you&apos;ve saved for later.</p>
      </div>

      {favorites.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Heart className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No favorites yet</p>
            <p className="text-sm text-muted-foreground mt-1">Start browsing and save cars you like!</p>
            <Button className="mt-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white" onClick={() => setView('listing')}>
              Browse Cars
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
                  className="absolute top-2 right-2 h-8 w-8 bg-white/90 dark:bg-black/60 backdrop-blur-sm text-red-500 hover:text-red-600"
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
                  View Details
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
        <h2 className="text-2xl font-bold tracking-tight">My Wallet</h2>
        <p className="text-muted-foreground">Manage your balance and transactions.</p>
      </div>

      {/* Balance Card */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Available Balance</p>
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
                  <Plus className="w-4 h-4 mr-2" />
                  Top Up Wallet
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Top Up Wallet</DialogTitle>
                  <DialogDescription>Add funds to your CIAR Cars wallet.</DialogDescription>
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
                    <Label>Or enter custom amount</Label>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={topUpAmount}
                      onChange={(e) => setTopUpAmount(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowTopUpDialog(false)}>Cancel</Button>
                  <Button
                    className="bg-gradient-to-r from-orange-500 to-amber-600 text-white"
                    onClick={() => {
                      toast.success(`Wallet topped up with ${formatPrice(Number(topUpAmount) || 0)}`);
                      setShowTopUpDialog(false);
                      setTopUpAmount('');
                    }}
                  >
                    Top Up
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
              <ArrowUpRight className="w-4 h-4 mr-2" />
              Withdraw
            </Button>
          </div>
        </div>
      </Card>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Transaction History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium text-sm max-w-[200px] truncate">{tx.description}</TableCell>
                  <TableCell><TransactionTypeBadge type={tx.type} /></TableCell>
                  <TableCell className={`font-medium ${tx.amount >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {tx.amount >= 0 ? '+' : ''}{formatPrice(tx.amount)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatPrice(tx.balance)}</TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">{tx.date}</TableCell>
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
        <h2 className="text-2xl font-bold tracking-tight">Messages</h2>
        <p className="text-muted-foreground">Your conversations with other users.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[600px]">
            <div className="divide-y">
              {mockChatRooms.map((room) => (
                <button
                  key={room.id}
                  className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors text-left"
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
                      <p className="text-xs text-muted-foreground truncate mb-0.5">Re: {room.carTitle}</p>
                    )}
                    <p className="text-sm text-muted-foreground truncate">{room.lastMessage}</p>
                  </div>
                  {room.unread > 0 && (
                    <Badge className="bg-orange-500 text-white shrink-0 h-5 min-w-[20px] flex items-center justify-center px-1.5 text-[10px] font-bold">
                      {room.unread}
                    </Badge>
                  )}
                </button>
              ))}
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
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4" />Profile Information
          </CardTitle>
          <CardDescription>Update your personal details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="settings-name">Full Name</Label>
              <Input
                id="settings-name"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-email">Email</Label>
              <Input
                id="settings-email"
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-phone">Phone</Label>
              <Input
                id="settings-phone"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="settings-city">City</Label>
              <Input
                id="settings-city"
                value={profileForm.city}
                onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-bio">Bio</Label>
            <Textarea
              id="settings-bio"
              value={profileForm.bio}
              onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="bg-gradient-to-r from-orange-500 to-amber-600 text-white"
            onClick={() => toast.success('Profile updated!')}
          >
            Save Changes
          </Button>
        </CardFooter>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="w-4 h-4" />Change Password
          </CardTitle>
          <CardDescription>Update your password for security.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              value={passwordForm.current}
              onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
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
                toast.error('Please fill in all fields');
                return;
              }
              toast.success('Password changed successfully!');
              setPasswordForm({ current: '', newPassword: '', confirm: '' });
            }}
          >
            Update Password
          </Button>
        </CardFooter>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="w-4 h-4" />Notification Preferences
          </CardTitle>
          <CardDescription>Choose what notifications you want to receive.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-sm font-medium mb-3">Email Notifications</p>
            <div className="space-y-4">
              {[
                { key: 'emailBookings' as const, label: 'Booking Updates', desc: 'Get notified about booking status changes' },
                { key: 'emailMessages' as const, label: 'New Messages', desc: 'Receive email for new chat messages' },
                { key: 'emailMarketing' as const, label: 'Marketing Emails', desc: 'Promotions, offers, and newsletters' },
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
            <p className="text-sm font-medium mb-3">Push Notifications</p>
            <div className="space-y-4">
              {[
                { key: 'pushBookings' as const, label: 'Booking Updates', desc: 'Real-time booking notifications' },
                { key: 'pushMessages' as const, label: 'New Messages', desc: 'Real-time chat notifications' },
                { key: 'pushPriceDrops' as const, label: 'Price Drops', desc: 'Alert when saved car prices drop' },
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
            onClick={() => toast.success('Notification preferences saved!')}
          >
            Save Preferences
          </Button>
        </CardFooter>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-900/50">
        <CardHeader>
          <CardTitle className="text-base text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />Danger Zone
          </CardTitle>
          <CardDescription>Irreversible actions for your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Delete Account</p>
              <p className="text-xs text-muted-foreground">
                Permanently delete your account and all associated data.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30">
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account,
                    all your listings, messages, and remove all associated data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => toast.error('Account deletion requested. (Demo only)')}
                  >
                    Delete Account
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50/50 to-orange-50/30 dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setView('home')} className="h-9 w-9">
              <ArrowUpRight className="w-4 h-4 rotate-180" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">My Dashboard</h1>
              <p className="text-sm text-muted-foreground">Manage your cars, bookings, and profile</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative" onClick={() => setActiveTab('messages')}>
              <MessageSquare className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                4
              </span>
            </Button>
            <Button variant="ghost" size="icon" className="relative" onClick={() => setView('notifications')}>
              <Bell className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
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
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="listings" className="flex items-center gap-1.5 text-sm shrink-0">
              <Car className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">My Listings</span>
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-1.5 text-sm shrink-0">
              <CalendarCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">My Bookings</span>
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-1.5 text-sm shrink-0">
              <Heart className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Favorites</span>
            </TabsTrigger>
            <TabsTrigger value="wallet" className="flex items-center gap-1.5 text-sm shrink-0">
              <Wallet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Wallet</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-1.5 text-sm shrink-0 relative">
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Messages</span>
              <span className="h-4 min-w-[16px] rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center px-1">
                4
              </span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1.5 text-sm shrink-0">
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="overview">{renderOverview()}</TabsContent>
            <TabsContent value="listings">{renderMyListings()}</TabsContent>
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
