// Admin API Helper - All admin-related API calls in one place

const API_BASE = '/api/admin';

interface PaginationParams {
  page?: number;
  limit?: number;
}

interface AdminResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

async function adminFetch<T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<AdminResponse<T>> {
  try {
    const res = await fetch(endpoint, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
}

// ============ STATS ============
export async function getStats() {
  return adminFetch(`${API_BASE}/stats`);
}

// ============ USERS ============
export interface AdminUserFilters extends PaginationParams {
  role?: string;
  isActive?: string;
  isBanned?: string;
  search?: string;
}

export async function getUsers(params?: AdminUserFilters) {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.role && params.role !== 'all') query.set('role', params.role);
  if (params?.isActive) query.set('isActive', params.isActive);
  if (params?.isBanned) query.set('isBanned', params.isBanned);
  if (params?.search) query.set('search', params.search);
  return adminFetch(`${API_BASE}/users?${query.toString()}`);
}

export async function getUserDetail(id: string) {
  return adminFetch(`${API_BASE}/users/${id}`);
}

export async function updateUser(id: string, data: { role?: string; isActive?: boolean; isBanned?: boolean; bannedReason?: string }) {
  return adminFetch(`${API_BASE}/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteUser(id: string) {
  return adminFetch(`${API_BASE}/users/${id}`, { method: 'DELETE' });
}

// ============ CARS ============
export interface AdminCarFilters extends PaginationParams {
  status?: string;
  condition?: string;
  search?: string;
  ownerId?: string;
}

export async function getCars(params?: AdminCarFilters) {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.status && params.status !== 'all') query.set('status', params.status);
  if (params?.condition && params.condition !== 'all') query.set('condition', params.condition);
  if (params?.search) query.set('search', params.search);
  if (params?.ownerId) query.set('ownerId', params.ownerId);
  return adminFetch(`${API_BASE}/cars?${query.toString()}`);
}

export async function updateCar(id: string, data: { status?: string; isFeatured?: boolean; featuredUntil?: string | null }) {
  return adminFetch(`${API_BASE}/cars/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteCar(id: string) {
  return adminFetch(`${API_BASE}/cars/${id}`, { method: 'DELETE' });
}

// ============ BOOKINGS ============
export interface AdminBookingFilters extends PaginationParams {
  status?: string;
  paymentStatus?: string;
  carId?: string;
  userId?: string;
}

export async function getBookings(params?: AdminBookingFilters) {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.status && params.status !== 'all') query.set('status', params.status);
  if (params?.paymentStatus && params.paymentStatus !== 'all') query.set('paymentStatus', params.paymentStatus);
  if (params?.carId) query.set('carId', params.carId);
  if (params?.userId) query.set('userId', params.userId);
  return adminFetch(`${API_BASE}/bookings?${query.toString()}`);
}

export async function getBookingDetail(id: string) {
  return adminFetch(`${API_BASE}/bookings/${id}`);
}

export async function updateBooking(id: string, data: { status?: string; paymentStatus?: string; notes?: string }) {
  return adminFetch(`${API_BASE}/bookings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ============ PAYMENTS ============
export interface AdminPaymentFilters extends PaginationParams {
  type?: string;
  status?: string;
  userId?: string;
}

export async function getPayments(params?: AdminPaymentFilters) {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.type && params.type !== 'all') query.set('type', params.type);
  if (params?.status && params.status !== 'all') query.set('status', params.status);
  if (params?.userId) query.set('userId', params.userId);
  return adminFetch(`${API_BASE}/payments?${query.toString()}`);
}

// ============ SETTINGS ============
export async function getSettings() {
  return adminFetch('/api/settings');
}

export async function saveSettings(settings: Record<string, any>) {
  return adminFetch('/api/settings', {
    method: 'PUT',
    body: JSON.stringify({ settings }),
  });
}

// ============ HOMEPAGE ============
export async function getHomepageSections() {
  return adminFetch('/api/homepage');
}

export async function createHomepageSection(data: { type: string; title?: string; subtitle?: string; content?: any; order?: number; isActive?: boolean }) {
  return adminFetch('/api/homepage', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateHomepageSection(data: { id: string; type?: string; title?: string; subtitle?: string; content?: any; order?: number; isActive?: boolean }) {
  return adminFetch('/api/homepage', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteHomepageSection(id: string) {
  return adminFetch(`/api/homepage?id=${id}`, { method: 'DELETE' });
}

// ============ BANNERS ============
export async function getBanners(position?: string) {
  const query = position ? `?position=${position}` : '';
  return adminFetch(`/api/banners${query}`);
}

export async function createBanner(data: { title: string; imageUrl: string; subtitle?: string; linkUrl?: string; position?: string; order?: number; isActive?: boolean; startDate?: string; endDate?: string }) {
  return adminFetch('/api/banners', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateBanner(id: string, data: { title?: string; subtitle?: string; imageUrl?: string; linkUrl?: string; position?: string; order?: number; isActive?: boolean; startDate?: string; endDate?: string }) {
  return adminFetch(`/api/banners/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteBanner(id: string) {
  return adminFetch(`/api/banners/${id}`, { method: 'DELETE' });
}

// ============ NAVIGATION ============
export async function getNavigationItems(position?: string) {
  const query = position ? `?position=${position}` : '';
  return adminFetch(`${API_BASE}/navigation${query}`);
}

export async function createNavItem(data: { label: string; url?: string; icon?: string; parentId?: string | null; position?: string; order?: number; isActive?: boolean; isOpen?: boolean }) {
  return adminFetch(`${API_BASE}/navigation`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateNavItem(data: { id: string; label?: string; url?: string; icon?: string; parentId?: string | null; position?: string; order?: number; isActive?: boolean; isOpen?: boolean }) {
  return adminFetch(`${API_BASE}/navigation`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteNavItem(id: string) {
  return adminFetch(`${API_BASE}/navigation?id=${id}`, { method: 'DELETE' });
}

// ============ AUDIT LOGS ============
export interface AdminAuditFilters extends PaginationParams {
  userId?: string;
  action?: string;
  entity?: string;
}

export async function getAuditLogs(params?: AdminAuditFilters) {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.userId) query.set('userId', params.userId);
  if (params?.action) query.set('action', params.action);
  if (params?.entity) query.set('entity', params.entity);
  return adminFetch(`${API_BASE}/audit?${query.toString()}`);
}
