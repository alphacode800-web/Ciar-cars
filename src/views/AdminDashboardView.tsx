'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  Users,
  Car,
  CalendarCheck,
  CreditCard,
  Settings,
  LayoutDashboard,
  Home,
  Navigation,
  FileText,
  ScrollText,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Eye,
  Bell,
  LogOut,
  ChevronRight,
  Search,
  MoreHorizontal,
  Edit,
  Ban,
  CheckCircle2,
  XCircle,
  Star,
  Trash2,
  Shield,
  ArrowUpRight,
  Clock,
  UserPlus,
  Plus,
  CalendarPlus,
  MessageSquare,
  LayoutGrid,
  GripVertical,
  Save,
  ToggleLeft,
  ToggleRight,
  Filter,
  ChevronDown,
  RefreshCcw,
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
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarInset,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAuthStore } from '@/store/auth-store';
import { useAppStore } from '@/store/app-store';
import { toast } from 'sonner';
import { CURRENCY, CAR_BRANDS } from '@/lib/constants';
import type { CarStatus, BookingStatus } from '@/types';

// ============ TYPES ============
type AdminSection =
  | 'overview'
  | 'users'
  | 'cars'
  | 'bookings'
  | 'payments'
  | 'settings'
  | 'homepage'
  | 'navigation'
  | 'reports'
  | 'audit';

// ============ MOCK DATA ============
const revenueData = [
  { day: 'Mon', revenue: 4200, bookings: 12 },
  { day: 'Tue', revenue: 3800, bookings: 10 },
  { day: 'Wed', revenue: 5100, bookings: 15 },
  { day: 'Thu', revenue: 4700, bookings: 14 },
  { day: 'Fri', revenue: 6200, bookings: 18 },
  { day: 'Sat', revenue: 7800, bookings: 22 },
  { day: 'Sun', revenue: 5900, bookings: 16 },
];

const newUsersData = [
  { month: 'Jan', users: 120 },
  { month: 'Feb', users: 145 },
  { month: 'Mar', users: 162 },
  { month: 'Apr', users: 138 },
  { month: 'May', users: 189 },
  { month: 'Jun', users: 210 },
];

const conditionData = [
  { name: 'New', value: 340, fill: 'var(--color-new)' },
  { name: 'Used', value: 560, fill: 'var(--color-used)' },
];

const bookingStatusData = [
  { name: 'Pending', value: 25, fill: 'var(--color-pending)' },
  { name: 'Confirmed', value: 45, fill: 'var(--color-confirmed)' },
  { name: 'Active', value: 30, fill: 'var(--color-active)' },
  { name: 'Completed', value: 120, fill: 'var(--color-completed)' },
  { name: 'Cancelled', value: 15, fill: 'var(--color-cancelled)' },
];

const revenueChartConfig: ChartConfig = {
  revenue: { label: 'Revenue', color: 'hsl(24, 95%, 53%)' },
  bookings: { label: 'Bookings', color: 'hsl(160, 60%, 45%)' },
};

const conditionChartConfig: ChartConfig = {
  new: { label: 'New Cars', color: 'hsl(160, 60%, 45%)' },
  used: { label: 'Used Cars', color: 'hsl(24, 95%, 53%)' },
};

const bookingChartConfig: ChartConfig = {
  pending: { label: 'Pending', color: 'hsl(48, 96%, 53%)' },
  confirmed: { label: 'Confirmed', color: 'hsl(217, 91%, 60%)' },
  active: { label: 'Active', color: 'hsl(142, 71%, 45%)' },
  completed: { label: 'Completed', color: 'hsl(160, 60%, 45%)' },
  cancelled: { label: 'Cancelled', color: 'hsl(0, 84%, 60%)' },
};

const usersChartConfig: ChartConfig = {
  users: { label: 'New Users', color: 'hsl(24, 95%, 53%)' },
};

const mockUsers = [
  { id: '1', name: 'Ahmed Mohamed', email: 'ahmed@test.com', role: 'admin' as const, status: 'active' as const, joined: '2024-01-15', avatar: 'AM' },
  { id: '2', name: 'Sara Ali', email: 'sara@test.com', role: 'seller' as const, status: 'active' as const, joined: '2024-02-20', avatar: 'SA' },
  { id: '3', name: 'Omar Hassan', email: 'omar@test.com', role: 'user' as const, status: 'active' as const, joined: '2024-03-10', avatar: 'OH' },
  { id: '4', name: 'Fatima Youssef', email: 'fatima@test.com', role: 'seller' as const, status: 'banned' as const, joined: '2024-04-05', avatar: 'FY' },
  { id: '5', name: 'Karim Ibrahim', email: 'karim@test.com', role: 'user' as const, status: 'active' as const, joined: '2024-05-12', avatar: 'KI' },
  { id: '6', name: 'Nour El-Din', email: 'nour@test.com', role: 'user' as const, status: 'active' as const, joined: '2024-06-01', avatar: 'NE' },
];

const mockCars = [
  { id: '1', title: 'BMW 320i 2023', brand: 'BMW', owner: 'Sara Ali', price: 1250000, status: 'active' as CarStatus, featured: true },
  { id: '2', title: 'Mercedes C200 2022', brand: 'Mercedes-Benz', owner: 'Ahmed Mohamed', price: 980000, status: 'active' as CarStatus, featured: false },
  { id: '3', title: 'Toyota Corolla 2024', brand: 'Toyota', owner: 'Omar Hassan', price: 650000, status: 'pending' as CarStatus, featured: false },
  { id: '4', title: 'Hyundai Tucson 2023', brand: 'Hyundai', owner: 'Karim Ibrahim', price: 720000, status: 'active' as CarStatus, featured: true },
  { id: '5', title: 'Kia Sportage 2022', brand: 'Kia', owner: 'Nour El-Din', price: 580000, status: 'sold' as CarStatus, featured: false },
  { id: '6', title: 'Nissan Sunny 2023', brand: 'Nissan', owner: 'Sara Ali', price: 420000, status: 'pending' as CarStatus, featured: false },
];

const mockBookings = [
  { id: '1', user: 'Omar Hassan', car: 'BMW 320i 2023', dates: 'Mar 15 - Mar 20', amount: 5000, status: 'active' as BookingStatus },
  { id: '2', user: 'Karim Ibrahim', car: 'Mercedes C200 2022', dates: 'Mar 22 - Mar 25', amount: 3600, status: 'confirmed' as BookingStatus },
  { id: '3', user: 'Nour El-Din', car: 'Toyota Corolla 2024', dates: 'Mar 28 - Apr 2', amount: 4500, status: 'pending' as BookingStatus },
  { id: '4', user: 'Fatima Youssef', car: 'Hyundai Tucson 2023', dates: 'Apr 5 - Apr 8', amount: 3000, status: 'completed' as BookingStatus },
];

const mockActivities = [
  { id: '1', type: 'signup' as const, text: 'Nour El-Din created an account', time: '5 min ago' },
  { id: '2', type: 'listing' as const, text: 'New listing: BMW 320i 2023 by Sara Ali', time: '12 min ago' },
  { id: '3', type: 'booking' as const, text: 'Omar Hassan booked BMW 320i', time: '30 min ago' },
  { id: '4', type: 'payment' as const, text: 'Payment received: $5,000 from Omar', time: '1 hr ago' },
  { id: '5', type: 'signup' as const, text: 'Karim Ibrahim created an account', time: '2 hrs ago' },
  { id: '6', type: 'listing' as const, text: 'New listing: Toyota Corolla 2024', time: '3 hrs ago' },
];

const mockHomepageSections = [
  { id: 's1', type: 'hero', title: 'Hero Banner', subtitle: 'Find your dream car', order: 0, isActive: true },
  { id: 's2', type: 'featured_cars', title: 'Featured Cars', subtitle: 'Top picks for you', order: 1, isActive: true },
  { id: 's3', type: 'categories', title: 'Browse by Category', subtitle: 'Explore all types', order: 2, isActive: true },
  { id: 's4', type: 'stats', title: 'Platform Statistics', subtitle: 'Our numbers', order: 3, isActive: true },
  { id: 's5', type: 'testimonials', title: 'Testimonials', subtitle: 'What our users say', order: 4, isActive: true },
  { id: 's6', type: 'banner', title: 'Promotional Banner', subtitle: 'Special offers', order: 5, isActive: false },
  { id: 's7', type: 'cta', title: 'Call to Action', subtitle: 'Sell your car', order: 6, isActive: true },
];

// ============ SIDEBAR NAVIGATION ============
const navItems: { id: AdminSection; label: string; icon: React.ElementType; badge?: number }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users, badge: 5 },
  { id: 'cars', label: 'Cars', icon: Car, badge: 3 },
  { id: 'bookings', label: 'Bookings', icon: CalendarCheck },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'homepage', label: 'Homepage Builder', icon: Home },
  { id: 'navigation', label: 'Navigation', icon: Navigation },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'audit', label: 'Audit Logs', icon: ScrollText },
];

// ============ ROLE BADGE HELPER ============
function RoleBadge({ role }: { role: string }) {
  const config: Record<string, string> = {
    admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    super_admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    seller: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    user: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  };
  return (
    <Badge variant="secondary" className={config[role] || config.user}>
      {role.replace('_', ' ')}
    </Badge>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    sold: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    archived: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500',
    confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    banned: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };
  return (
    <Badge variant="secondary" className={config[status] || 'bg-gray-100 text-gray-700'}>
      {status}
    </Badge>
  );
}

// ============ SORTABLE HOMEPAGE ITEM ============
function SortableSection({ section, onToggle, onEdit }: { 
  section: typeof mockHomepageSections[0]; 
  onToggle: (id: string) => void;
  onEdit: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 rounded-lg border bg-card ${isDragging ? 'shadow-lg' : ''} transition-colors`}
    >
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{section.title}</p>
          {!section.isActive && (
            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-500">Hidden</Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">{section.subtitle}</p>
      </div>
      <Switch checked={section.isActive} onCheckedChange={() => onToggle(section.id)} />
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(section.id)}>
        <Edit className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}

// ============ ADMIN DASHBOARD VIEW ============
export default function AdminDashboardView() {
  const { user, logout } = useAuthStore();
  const { setView } = useAppStore();
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [carStatusFilter, setCarStatusFilter] = useState<string>('all');
  const [userPage, setUserPage] = useState(1);

  // Settings state
  const [settings, setSettings] = useState({
    enableRentals: true,
    enableChat: true,
    enableRegistration: true,
    platformFee: 10,
    featuredPrice: 500,
    boostPrice: 200,
  });

  // Homepage builder state
  const [homepageSections, setHomepageSections] = useState(mockHomepageSections);
  const [editingSection, setEditingSection] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setHomepageSections((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const reordered = arrayMove(items, oldIndex, newIndex).map((item, index) => ({
          ...item,
          order: index,
        }));
        return reordered;
      });
    }
  };

  const toggleSection = (id: string) => {
    setHomepageSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
  };

  const filteredUsers = useMemo(() => {
    return mockUsers.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase());
      const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
      return matchesSearch && matchesRole;
    });
  }, [userSearch, userRoleFilter]);

  const filteredCars = useMemo(() => {
    return mockCars.filter((c) => {
      const matchesStatus = carStatusFilter === 'all' || c.status === carStatusFilter;
      return matchesStatus;
    });
  }, [carStatusFilter]);

  const handleLogout = () => {
    logout();
    setView('home');
    toast.success('Logged out successfully');
  };

  const formatPrice = (price: number) =>
    `${CURRENCY.symbol}${price.toLocaleString()}`;

  // ============ SECTION RENDERERS ============
  const renderOverview = () => (
    <motion.div
      key="overview"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground">Welcome back! Here&apos;s what&apos;s happening on CIAR Cars.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: '2,847', change: '+12.5%', up: true, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
          { label: 'Total Listings', value: '1,234', change: '+8.2%', up: true, icon: Car, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
          { label: 'Active Rentals', value: '156', change: '+23.1%', up: true, icon: CalendarCheck, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/30' },
          { label: 'Revenue', value: `${CURRENCY.symbol}847K`, change: '+18.7%', up: true, icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/30' },
        ].map((stat) => (
          <Card key={stat.label} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${stat.up ? 'text-emerald-600' : 'text-red-600'}`}>
                  {stat.up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {stat.change}
                </div>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              {/* Mini Sparkline */}
              <div className="mt-3 flex items-end gap-[3px] h-8">
                {[40, 55, 35, 60, 45, 70, 65].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    className={`flex-1 rounded-sm ${stat.color.replace('text-', 'bg-').replace('-600', '-200 dark:bg-' + stat.color.split('-')[1] + '-900/40')}`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue Overview</CardTitle>
            <CardDescription>Revenue & bookings over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueChartConfig} className="h-[250px] w-full">
              <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(24, 95%, 53%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(24, 95%, 53%)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(24, 95%, 53%)"
                  fill="url(#fillRevenue)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* New Users Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">New Users</CardTitle>
            <CardDescription>Monthly user registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={usersChartConfig} className="h-[250px] w-full">
              <BarChart data={newUsersData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="users" fill="hsl(24, 95%, 53%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Pie Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Listings by Condition */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Listings by Condition</CardTitle>
            <CardDescription>Distribution of new vs used cars</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ChartContainer config={conditionChartConfig} className="h-[220px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={conditionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {conditionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="name" />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Bookings by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bookings by Status</CardTitle>
            <CardDescription>Current booking distribution</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ChartContainer config={bookingChartConfig} className="h-[220px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={bookingStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {bookingStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="name" />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <CardDescription>Latest platform activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`mt-0.5 p-1.5 rounded-full ${
                    activity.type === 'signup' ? 'bg-blue-100 dark:bg-blue-900/30' :
                    activity.type === 'listing' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                    activity.type === 'booking' ? 'bg-orange-100 dark:bg-orange-900/30' :
                    'bg-purple-100 dark:bg-purple-900/30'
                  }`}>
                    {activity.type === 'signup' ? <UserPlus className="w-3 h-3 text-blue-600" /> :
                     activity.type === 'listing' ? <Plus className="w-3 h-3 text-emerald-600" /> :
                     activity.type === 'booking' ? <CalendarPlus className="w-3 h-3 text-orange-600" /> :
                     <CreditCard className="w-3 h-3 text-purple-600" />}
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
            <CardDescription>Common admin tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              onClick={() => {
                setActiveSection('cars');
                setCarStatusFilter('pending');
              }}
            >
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                <Eye className="w-4 h-4 text-yellow-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">View Pending Cars</p>
                <p className="text-xs text-muted-foreground">3 pending review</p>
              </div>
              <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              onClick={() => setActiveSection('bookings')}
            >
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <CalendarCheck className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">Process Bookings</p>
                <p className="text-xs text-muted-foreground">1 pending booking</p>
              </div>
              <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              onClick={() => setActiveSection('users')}
            >
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <Users className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">Manage Users</p>
                <p className="text-xs text-muted-foreground">2,847 total users</p>
              </div>
              <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              onClick={() => setActiveSection('payments')}
            >
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <CreditCard className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">View Payments</p>
                <p className="text-xs text-muted-foreground">{CURRENCY.symbol}847K total</p>
              </div>
              <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );

  const renderUsers = () => (
    <motion.div
      key="users"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Users Management</h2>
          <p className="text-muted-foreground">Manage all registered users on the platform.</p>
        </div>
        <Button className="bg-gradient-to-r from-orange-500 to-amber-600 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="seller">Seller</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-medium">
                          {u.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{u.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell><RoleBadge role={u.role} /></TableCell>
                  <TableCell><StatusBadge status={u.status} /></TableCell>
                  <TableCell className="text-muted-foreground">{u.joined}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />Edit Role
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {u.status === 'active' ? (
                          <DropdownMenuItem className="text-red-600">
                            <Ban className="w-4 h-4 mr-2" />Ban User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="text-emerald-600">
                            <CheckCircle2 className="w-4 h-4 mr-2" />Unban User
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Showing {filteredUsers.length} of {mockUsers.length} users</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={userPage === 1} onClick={() => setUserPage(userPage - 1)}>Previous</Button>
          <Button variant="outline" size="sm">Next</Button>
        </div>
      </div>
    </motion.div>
  );

  const renderCars = () => (
    <motion.div
      key="cars"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Cars Management</h2>
          <p className="text-muted-foreground">Manage all car listings on the platform.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search cars..." className="pl-10" />
        </div>
        <Select value={carStatusFilter} onValueChange={setCarStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by brand" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {CAR_BRANDS.slice(0, 15).map((b) => (
              <SelectItem key={b} value={b}>{b}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead className="hidden sm:table-cell">Owner</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCars.map((car) => (
                <TableRow key={car.id}>
                  <TableCell className="font-medium">{car.title}</TableCell>
                  <TableCell className="text-muted-foreground">{car.brand}</TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">{car.owner}</TableCell>
                  <TableCell className="font-medium">{formatPrice(car.price)}</TableCell>
                  <TableCell><StatusBadge status={car.status} /></TableCell>
                  <TableCell>
                    {car.featured ? (
                      <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        <Star className="w-3 h-3 mr-1" />Featured
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />View Details
                        </DropdownMenuItem>
                        {car.status === 'pending' && (
                          <>
                            <DropdownMenuItem>
                              <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />
                              <span className="text-emerald-600">Approve</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <XCircle className="w-4 h-4 mr-2 text-red-600" />
                              <span className="text-red-600">Reject</span>
                            </DropdownMenuItem>
                          </>
                        )}
                        {!car.featured && car.status === 'active' && (
                          <DropdownMenuItem>
                            <Star className="w-4 h-4 mr-2 text-amber-600" />
                            <span className="text-amber-600">Feature</span>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderBookings = () => (
    <motion.div
      key="bookings"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Bookings</h2>
        <p className="text-muted-foreground">Manage rental bookings and reservations.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Car</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockBookings.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.user}</TableCell>
                  <TableCell>{b.car}</TableCell>
                  <TableCell className="text-muted-foreground">{b.dates}</TableCell>
                  <TableCell className="font-medium">{formatPrice(b.amount)}</TableCell>
                  <TableCell><StatusBadge status={b.status} /></TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Eye className="w-4 h-4 mr-2" />View Details</DropdownMenuItem>
                        {b.status === 'pending' && (
                          <>
                            <DropdownMenuItem><CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" /><span className="text-emerald-600">Confirm</span></DropdownMenuItem>
                            <DropdownMenuItem><XCircle className="w-4 h-4 mr-2 text-red-600" /><span className="text-red-600">Reject</span></DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderPayments = () => (
    <motion.div
      key="payments"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Payments</h2>
        <p className="text-muted-foreground">Track all platform payments and transactions.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold mt-1">{CURRENCY.symbol}847,200</p>
            <p className="text-xs text-emerald-600 mt-1">+18.7% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Pending Payouts</p>
            <p className="text-2xl font-bold mt-1">{CURRENCY.symbol}23,400</p>
            <p className="text-xs text-orange-600 mt-1">8 pending payouts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Platform Fees</p>
            <p className="text-2xl font-bold mt-1">{CURRENCY.symbol}84,720</p>
            <p className="text-xs text-muted-foreground mt-1">10% commission rate</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { id: 'TXN-001', user: 'Omar Hassan', type: 'Rental', amount: 5000, status: 'completed', date: 'Mar 15' },
                { id: 'TXN-002', user: 'Sara Ali', type: 'Featured Fee', amount: 500, status: 'completed', date: 'Mar 14' },
                { id: 'TXN-003', user: 'Karim Ibrahim', type: 'Rental', amount: 3600, status: 'pending', date: 'Mar 13' },
                { id: 'TXN-004', user: 'Nour El-Din', type: 'Boost Fee', amount: 200, status: 'completed', date: 'Mar 12' },
              ].map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-mono text-xs">{tx.id}</TableCell>
                  <TableCell>{tx.user}</TableCell>
                  <TableCell>{tx.type}</TableCell>
                  <TableCell className="font-medium">{formatPrice(tx.amount)}</TableCell>
                  <TableCell><StatusBadge status={tx.status} /></TableCell>
                  <TableCell className="text-muted-foreground">{tx.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderSettings = () => (
    <motion.div
      key="settings"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Site Settings</h2>
        <p className="text-muted-foreground">Configure platform-wide settings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Features</CardTitle>
          <CardDescription>Enable or disable platform features.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Enable Rentals</Label>
              <p className="text-xs text-muted-foreground">Allow users to rent cars on the platform</p>
            </div>
            <Switch
              checked={settings.enableRentals}
              onCheckedChange={(checked) => setSettings({ ...settings, enableRentals: checked })}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Enable Chat</Label>
              <p className="text-xs text-muted-foreground">Allow users to message each other</p>
            </div>
            <Switch
              checked={settings.enableChat}
              onCheckedChange={(checked) => setSettings({ ...settings, enableChat: checked })}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Enable Registration</Label>
              <p className="text-xs text-muted-foreground">Allow new users to create accounts</p>
            </div>
            <Switch
              checked={settings.enableRegistration}
              onCheckedChange={(checked) => setSettings({ ...settings, enableRegistration: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pricing</CardTitle>
          <CardDescription>Configure platform fees and pricing.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="platform-fee">Platform Fee (%)</Label>
              <Input
                id="platform-fee"
                type="number"
                value={settings.platformFee}
                onChange={(e) => setSettings({ ...settings, platformFee: Number(e.target.value) })}
                min={0}
                max={100}
              />
              <p className="text-xs text-muted-foreground">Commission per transaction</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="featured-price">Featured Price ({CURRENCY.symbol})</Label>
              <Input
                id="featured-price"
                type="number"
                value={settings.featuredPrice}
                onChange={(e) => setSettings({ ...settings, featuredPrice: Number(e.target.value) })}
                min={0}
              />
              <p className="text-xs text-muted-foreground">Price to feature a listing</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="boost-price">Boost Price ({CURRENCY.symbol})</Label>
              <Input
                id="boost-price"
                type="number"
                value={settings.boostPrice}
                onChange={(e) => setSettings({ ...settings, boostPrice: Number(e.target.value) })}
                min={0}
              />
              <p className="text-xs text-muted-foreground">Price to boost a listing</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="bg-gradient-to-r from-orange-500 to-amber-600 text-white"
            onClick={() => toast.success('Settings saved successfully!')}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );

  const renderHomepageBuilder = () => (
    <motion.div
      key="homepage"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Homepage Builder</h2>
          <p className="text-muted-foreground">Drag and drop to reorder homepage sections.</p>
        </div>
        <Button
          className="bg-gradient-to-r from-orange-500 to-amber-600 text-white"
          onClick={() => toast.success('Homepage layout saved!')}
        >
          <Save className="w-4 h-4 mr-2" />
          Save Layout
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section List (Draggable) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <GripVertical className="w-4 h-4" />
              Homepage Sections
            </CardTitle>
            <CardDescription>Drag sections to reorder. Toggle visibility with the switch.</CardDescription>
          </CardHeader>
          <CardContent>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={homepageSections.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {homepageSections.map((section) => (
                    <SortableSection
                      key={section.id}
                      section={section}
                      onToggle={toggleSection}
                      onEdit={(id) => setEditingSection(editingSection === id ? null : id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </CardContent>
        </Card>

        {/* Edit Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Edit Section</CardTitle>
            <CardDescription>Click edit on a section to modify its content.</CardDescription>
          </CardHeader>
          <CardContent>
            {editingSection ? (
              <div className="space-y-4">
                {(() => {
                  const section = homepageSections.find((s) => s.id === editingSection);
                  if (!section) return null;
                  return (
                    <>
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input defaultValue={section.title} />
                      </div>
                      <div className="space-y-2">
                        <Label>Subtitle</Label>
                        <Input defaultValue={section.subtitle} />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Order</span>
                        <Badge variant="secondary">{section.order + 1}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Type</span>
                        <Badge variant="outline">{section.type.replace('_', ' ')}</Badge>
                      </div>
                      <Button
                        className="w-full mt-2"
                        variant="outline"
                        onClick={() => {
                          toast.success('Section updated!');
                          setEditingSection(null);
                        }}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Update Section
                      </Button>
                    </>
                  );
                })()}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <LayoutGrid className="w-10 h-10 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">Select a section to edit</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );

  const renderNavigation = () => (
    <motion.div
      key="navigation"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Navigation</h2>
        <p className="text-muted-foreground">Manage the site navigation menu and footer links.</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Navigation className="w-12 h-12 text-muted-foreground/50 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Navigation Manager</p>
          <p className="text-sm text-muted-foreground mt-1">Coming soon — Full navigation editor with drag & drop</p>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderReports = () => (
    <motion.div
      key="reports"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Reports</h2>
        <p className="text-muted-foreground">View analytics and platform reports.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveSection('overview')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/30">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="font-medium">Revenue Report</p>
                <p className="text-sm text-muted-foreground">Monthly revenue breakdown</p>
              </div>
              <ArrowUpRight className="w-5 h-5 text-muted-foreground ml-auto" />
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">User Growth</p>
                <p className="text-sm text-muted-foreground">User registration trends</p>
              </div>
              <ArrowUpRight className="w-5 h-5 text-muted-foreground ml-auto" />
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                <Car className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium">Listing Performance</p>
                <p className="text-sm text-muted-foreground">Top performing listings</p>
              </div>
              <ArrowUpRight className="w-5 h-5 text-muted-foreground ml-auto" />
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30">
                <CalendarCheck className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Booking Analytics</p>
                <p className="text-sm text-muted-foreground">Rental booking trends</p>
              </div>
              <ArrowUpRight className="w-5 h-5 text-muted-foreground ml-auto" />
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );

  const renderAuditLogs = () => (
    <motion.div
      key="audit"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Audit Logs</h2>
        <p className="text-muted-foreground">Track all administrative actions on the platform.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { action: 'car.approved', user: 'Admin', entity: 'BMW 320i 2023', ip: '192.168.1.1', time: '5 min ago' },
                { action: 'user.banned', user: 'Admin', entity: 'Fatima Youssef', ip: '192.168.1.1', time: '30 min ago' },
                { action: 'settings.updated', user: 'Admin', entity: 'Platform Fee', ip: '192.168.1.1', time: '1 hr ago' },
                { action: 'car.featured', user: 'Admin', entity: 'Hyundai Tucson 2023', ip: '192.168.1.1', time: '2 hrs ago' },
                { action: 'user.role_changed', user: 'Admin', entity: 'Sara Ali → Seller', ip: '192.168.1.1', time: '3 hrs ago' },
              ].map((log, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">{log.action}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{log.user}</TableCell>
                  <TableCell>{log.entity}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{log.ip}</TableCell>
                  <TableCell className="text-muted-foreground">{log.time}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );

  const sectionRenderers: Record<AdminSection, React.ReactNode> = {
    overview: renderOverview(),
    users: renderUsers(),
    cars: renderCars(),
    bookings: renderBookings(),
    payments: renderPayments(),
    settings: renderSettings(),
    homepage: renderHomepageBuilder(),
    navigation: renderNavigation(),
    reports: renderReports(),
    audit: renderAuditLogs(),
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* Sidebar */}
        <Sidebar collapsible="icon" variant="sidebar">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" asChild>
                  <button onClick={() => setView('home')}>
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 text-white">
                      <Car className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-bold">CIAR Cars</span>
                      <span className="truncate text-xs text-muted-foreground">Admin Panel</span>
                    </div>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Management</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        tooltip={item.label}
                        isActive={activeSection === item.id}
                        onClick={() => setActiveSection(item.id)}
                      >
                        <item.icon className="size-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                      {item.badge && (
                        <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Back to Home" onClick={() => setView('home')}>
                  <ArrowUpRight className="size-4" />
                  <span>Back to Home</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Logout" onClick={handleLogout}>
                  <LogOut className="size-4" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>

          <SidebarRail />
        </Sidebar>

        {/* Main Content */}
        <SidebarInset>
          {/* Top Bar */}
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex-1">
              <h1 className="text-sm font-medium capitalize">{activeSection}</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                  3
                </span>
              </Button>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-bold">
                    {(user?.name || 'A').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium leading-none">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-muted-foreground">Super Admin</p>
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 p-4 md:p-6 overflow-auto">
            <AnimatePresence mode="wait">
              {sectionRenderers[activeSection]}
            </AnimatePresence>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
