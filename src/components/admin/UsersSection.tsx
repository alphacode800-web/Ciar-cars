'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Ban,
  CheckCircle2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCcw,
  Shield,
  UserCog,
  Mail,
  Phone,
  MapPin,
  Star,
  Car,
  CalendarCheck,
} from 'lucide-react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  getUsers,
  updateUser,
  deleteUser,
  getUserDetail,
  type AdminUserFilters,
} from '@/lib/admin-api';
import { CURRENCY } from '@/lib/constants';
import { toast } from 'sonner';

// ============ TYPES ============

interface UserRecord {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  avatar: string | null;
  role: string;
  isActive: boolean;
  isBanned: boolean;
  bannedReason: string | null;
  city: string | null;
  country: string | null;
  walletBalance: number;
  rating: number;
  totalReviews: number;
  totalListings: number;
  totalSales: number;
  createdAt: string;
  _count?: {
    cars: number;
    rentals: number;
    reviews: number;
  };
}

interface UserDetail extends Omit<UserRecord, '_count'> {
  bio: string | null;
  address: string | null;
  businessName: string | null;
  businessLicense: string | null;
  updatedAt: string;
  cars: Array<{
    id: string;
    title: string;
    brand: string;
    model: string;
    status: string;
    price: number;
    viewsCount: number;
    createdAt: string;
  }>;
  rentals: Array<{
    id: string;
    status: string;
    totalPrice: number;
    startDate: string;
    endDate: string;
    createdAt: string;
  }>;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ============ HELPERS ============

function getInitials(name: string | null): string {
  if (!name) return '??';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ============ BADGE COMPONENTS ============

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

function StatusBadge({ isBanned, isActive }: { isBanned: boolean; isActive: boolean }) {
  if (isBanned) {
    return (
      <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
        Banned
      </Badge>
    );
  }
  if (isActive) {
    return (
      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
        Active
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
      Inactive
    </Badge>
  );
}

// ============ USERS SECTION ============

interface UsersSectionProps {
  onNavigate: (section: string) => void;
}

const ROLES = [
  { value: 'user', label: 'User' },
  { value: 'seller', label: 'Seller' },
  { value: 'admin', label: 'Admin' },
  { value: 'super_admin', label: 'Super Admin' },
];

export default function UsersSection({ onNavigate: _onNavigate }: UsersSectionProps) {
  // List state
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Dialog state
  const [detailUser, setDetailUser] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const [roleChangeUser, setRoleChangeUser] = useState<UserRecord | null>(null);
  const [newRole, setNewRole] = useState('');
  const [roleChangeOpen, setRoleChangeOpen] = useState(false);
  const [roleChangeLoading, setRoleChangeLoading] = useState(false);

  const [banUser, setBanUser] = useState<UserRecord | null>(null);
  const [banReason, setBanReason] = useState('');
  const [banOpen, setBanOpen] = useState(false);
  const [banLoading, setBanLoading] = useState(false);

  const [deleteUser, setDeleteUser] = useState<UserRecord | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Debounce search
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // ============ FETCH USERS ============
  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);

    const filters: AdminUserFilters = { page, limit: 10 };
    if (roleFilter !== 'all') filters.role = roleFilter;
    if (statusFilter === 'banned') filters.isBanned = 'true';
    else if (statusFilter === 'active') {
      filters.isActive = 'true';
      filters.isBanned = 'false';
    }
    if (searchQuery.trim()) filters.search = searchQuery.trim();

    try {
      const res = await getUsers(filters);
      if (res.success && res.data) {
        setUsers(res.data as UserRecord[]);
        setPagination((res.pagination as PaginationInfo) || {
          page: 1, limit: 10, total: 0, totalPages: 1, hasNext: false, hasPrev: false,
        });
      } else {
        setError(res.error || 'Failed to fetch users');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [roleFilter, statusFilter, searchQuery]);

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  // ============ SEARCH DEBOUNCE ============
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (searchTimeout) clearTimeout(searchTimeout);
    setSearchTimeout(
      setTimeout(() => {
        fetchUsers(1);
      }, 400)
    );
  };

  // ============ FILTER CHANGES ============
  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };

  // ============ PAGINATION ============
  const goToPage = (page: number) => {
    fetchUsers(page);
  };

  // ============ VIEW DETAILS ============
  const handleViewDetails = async (user: UserRecord) => {
    setDetailUser(null);
    setDetailLoading(true);
    setDetailOpen(true);

    try {
      const res = await getUserDetail(user.id);
      if (res.success && res.data) {
        setDetailUser(res.data as UserDetail);
      } else {
        toast.error(res.error || 'Failed to load user details');
        setDetailOpen(false);
      }
    } catch {
      toast.error('Network error loading user details');
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  // ============ CHANGE ROLE ============
  const handleOpenRoleChange = (user: UserRecord) => {
    setRoleChangeUser(user);
    setNewRole(user.role);
    setRoleChangeOpen(true);
  };

  const handleRoleChange = async () => {
    if (!roleChangeUser || !newRole) return;

    setRoleChangeLoading(true);
    try {
      const res = await updateUser(roleChangeUser.id, { role: newRole });
      if (res.success) {
        toast.success(`Role updated to "${newRole.replace('_', ' ')}" for ${roleChangeUser.name || roleChangeUser.email}`);
        setRoleChangeOpen(false);
        fetchUsers(pagination.page);
      } else {
        toast.error(res.error || 'Failed to update role');
      }
    } catch {
      toast.error('Network error updating role');
    } finally {
      setRoleChangeLoading(false);
    }
  };

  // ============ BAN / UNBAN ============
  const handleOpenBan = (user: UserRecord) => {
    setBanUser(user);
    setBanReason('');
    setBanOpen(true);
  };

  const handleBan = async () => {
    if (!banUser) return;

    setBanLoading(true);
    try {
      const res = await updateUser(banUser.id, {
        isBanned: true,
        bannedReason: banReason.trim() || 'Account suspended by admin',
      });
      if (res.success) {
        toast.success(`${banUser.name || banUser.email} has been banned`);
        setBanOpen(false);
        fetchUsers(pagination.page);
      } else {
        toast.error(res.error || 'Failed to ban user');
      }
    } catch {
      toast.error('Network error banning user');
    } finally {
      setBanLoading(false);
    }
  };

  const handleUnban = async (user: UserRecord) => {
    setBanLoading(true);
    try {
      const res = await updateUser(user.id, { isBanned: false });
      if (res.success) {
        toast.success(`${user.name || user.email} has been unbanned`);
        fetchUsers(pagination.page);
      } else {
        toast.error(res.error || 'Failed to unban user');
      }
    } catch {
      toast.error('Network error unbanning user');
    } finally {
      setBanLoading(false);
    }
  };

  // ============ DELETE ============
  const handleOpenDelete = (user: UserRecord) => {
    setDeleteUser(user);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteUser) return;

    setDeleteLoading(true);
    try {
      const res = await deleteUser(deleteUser.id);
      if (res.success) {
        toast.success(`${deleteUser.name || deleteUser.email} has been deleted`);
        setDeleteOpen(false);
        fetchUsers(pagination.page);
      } else {
        toast.error(res.error || 'Failed to delete user');
      }
    } catch {
      toast.error('Network error deleting user');
    } finally {
      setDeleteLoading(false);
    }
  };

  // ============ PAGINATION RANGE ============
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

  // ============ LOADING STATE ============
  if (loading && users.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-44 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Skeleton className="h-10 w-full sm:max-w-xs" />
          <Skeleton className="h-10 w-[180px]" />
          <Skeleton className="h-10 w-[180px]" />
        </div>
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
                {Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-28" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8 rounded" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // ============ ERROR STATE ============
  if (error && users.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20"
      >
        <div className="p-4 rounded-full bg-red-100 dark:bg-red-950/30 mb-4">
          <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Failed to Load Users</h3>
        <p className="text-muted-foreground text-sm mb-6 max-w-md text-center">
          {error}
        </p>
        <Button
          onClick={() => fetchUsers(1)}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700"
        >
          <RefreshCcw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </motion.div>
    );
  }

  // ============ MAIN CONTENT ============
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Users Management</h2>
          <p className="text-muted-foreground">
            Manage all registered users on the platform.
            {pagination.total > 0 && (
              <span className="font-medium text-foreground ml-1">
                {pagination.total} total users
              </span>
            )}
          </p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
            <SelectItem value="seller">Seller</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Name</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      No users found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            {user.avatar && (
                              <AvatarImage src={user.avatar} alt={user.name || ''} />
                            )}
                            <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium truncate max-w-[180px]">
                              {user.name || 'Unnamed User'}
                            </p>
                            <p className="text-xs text-muted-foreground md:hidden truncate max-w-[180px]">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground truncate max-w-[200px]">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <RoleBadge role={user.role} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge isBanned={user.isBanned} isActive={user.isActive} />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleViewDetails(user)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenRoleChange(user)}>
                              <UserCog className="w-4 h-4 mr-2" />
                              Change Role
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.isBanned ? (
                              <DropdownMenuItem
                                onClick={() => handleUnban(user)}
                                className="text-emerald-600 focus:text-emerald-600"
                              >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Unban User
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleOpenBan(user)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Ban className="w-4 h-4 mr-2" />
                                Ban User
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleOpenDelete(user)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <p className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1}–
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} users
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasPrev}
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
              disabled={!pagination.hasNext}
              onClick={() => goToPage(pagination.page + 1)}
              className="h-8"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* ============ VIEW DETAILS DIALOG ============ */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>View detailed user information</DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-52" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : detailUser ? (
            <div className="space-y-6 py-2">
              {/* Profile Header */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  {detailUser.avatar && (
                    <AvatarImage src={detailUser.avatar} alt={detailUser.name || ''} />
                  )}
                  <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-lg font-medium">
                    {getInitials(detailUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate">
                    {detailUser.name || 'Unnamed User'}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">{detailUser.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <RoleBadge role={detailUser.role} />
                    <StatusBadge isBanned={detailUser.isBanned} isActive={detailUser.isActive} />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                {detailUser.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{detailUser.phone}</span>
                  </div>
                )}
                {(detailUser.city || detailUser.country) && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{[detailUser.city, detailUser.country].filter(Boolean).join(', ')}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Star className="w-4 h-4" />
                  <span>{detailUser.rating.toFixed(1)} rating ({detailUser.totalReviews} reviews)</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  <span>Joined {formatDate(detailUser.createdAt)}</span>
                </div>
              </div>

              {/* Wallet */}
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/20 p-4">
                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300 mb-1">
                  Wallet Balance
                </p>
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                  {CURRENCY.symbol}{detailUser.walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border p-3 text-center">
                  <Car className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-lg font-bold">{detailUser.totalListings}</p>
                  <p className="text-xs text-muted-foreground">Listings</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <CalendarCheck className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-lg font-bold">{detailUser.totalSales}</p>
                  <p className="text-xs text-muted-foreground">Sales</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <Star className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-lg font-bold">{detailUser.totalReviews}</p>
                  <p className="text-xs text-muted-foreground">Reviews</p>
                </div>
              </div>

              {/* Banned Reason */}
              {detailUser.isBanned && detailUser.bannedReason && (
                <div className="rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 p-4">
                  <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-1">
                    Ban Reason
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-300">
                    {detailUser.bannedReason}
                  </p>
                </div>
              )}

              {/* Business Info */}
              {detailUser.businessName && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium mb-1">Business Information</p>
                    <p className="text-sm text-muted-foreground">{detailUser.businessName}</p>
                    {detailUser.businessLicense && (
                      <p className="text-xs text-muted-foreground mt-1">
                        License: {detailUser.businessLicense}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Recent Cars */}
              {detailUser.cars && detailUser.cars.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium mb-3">Recent Listings</p>
                    <div className="space-y-2">
                      {detailUser.cars.slice(0, 5).map((car) => (
                        <div
                          key={car.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{car.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {CURRENCY.symbol}{car.price.toLocaleString()} • {car.viewsCount} views
                            </p>
                          </div>
                          <Badge
                            variant="secondary"
                            className={
                              car.status === 'active'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                : car.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                  : car.status === 'sold'
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                            }
                          >
                            {car.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Recent Rentals */}
              {detailUser.rentals && detailUser.rentals.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium mb-3">Recent Bookings</p>
                    <div className="space-y-2">
                      {detailUser.rentals.slice(0, 5).map((rental) => (
                        <div
                          key={rental.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                        >
                          <div>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(rental.startDate)} — {formatDate(rental.endDate)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {CURRENCY.symbol}{rental.totalPrice.toLocaleString()}
                            </p>
                          </div>
                          <Badge
                            variant="secondary"
                            className={
                              rental.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                : rental.status === 'active'
                                  ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'
                                  : rental.status === 'cancelled'
                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            }
                          >
                            {rental.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* ============ ROLE CHANGE DIALOG ============ */}
      <Dialog open={roleChangeOpen} onOpenChange={setRoleChangeOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Change the role for <span className="font-medium">{roleChangeUser?.name || roleChangeUser?.email}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label className="mb-2 block">New Role</Label>
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRoleChangeOpen(false)}
              disabled={roleChangeLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRoleChange}
              disabled={roleChangeLoading || !newRole || newRole === roleChangeUser?.role}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700"
            >
              {roleChangeLoading ? 'Updating...' : 'Update Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============ BAN DIALOG ============ */}
      <Dialog open={banOpen} onOpenChange={setBanOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-600 dark:text-red-400">Ban User</DialogTitle>
            <DialogDescription>
              You are about to ban <span className="font-medium">{banUser?.name || banUser?.email}</span>.
              They will not be able to access their account.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label className="mb-2 block">Reason for banning (optional)</Label>
            <Textarea
              placeholder="Enter reason for banning this user..."
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBanOpen(false)}
              disabled={banLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBan}
              disabled={banLoading}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {banLoading ? 'Banning...' : 'Ban User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============ DELETE CONFIRM DIALOG ============ */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 dark:text-red-400">
              Delete User
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the account of{' '}
              <span className="font-medium">{deleteUser?.name || deleteUser?.email}</span>
              {' '}and all their associated data including listings, bookings, and reviews.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={deleteLoading}
              className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
            >
              {deleteLoading ? 'Deleting...' : 'Delete User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
