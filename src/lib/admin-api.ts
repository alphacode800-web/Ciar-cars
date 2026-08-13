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
      credentials: 'include',
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

export interface AdminCarUpdatePayload {
  status?: string;
  isFeatured?: boolean;
  featuredUntil?: string | null;
  title?: string;
  price?: number;
  country?: string;
  city?: string;
  description?: string;
  condition?: string;
  mileage?: number;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  primaryImageUrl?: string;
}

export async function updateCar(id: string, data: AdminCarUpdatePayload) {
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
  return adminFetch('/api/homepage?all=true');
}

export async function reorderHomepageSections(items: { id: string; order: number; isActive?: boolean }[]) {
  return adminFetch('/api/homepage', {
    method: 'PUT',
    body: JSON.stringify({ items }),
  });
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
export async function getBanners(position?: string, all = false) {
  const params = new URLSearchParams();
  if (position) params.set('position', position);
  if (all) params.set('all', 'true');
  const query = params.toString() ? `?${params.toString()}` : '';
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

// ============ CMS: PAGES ============
export async function getCmsPages() {
  return adminFetch(`${API_BASE}/pages`);
}

export async function updateCmsPage(data: {
  slug: string;
  title?: string;
  status?: string;
  content?: unknown;
  seoTitle?: string | null;
  seoDescription?: string | null;
}) {
  return adminFetch(`${API_BASE}/pages`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ============ CMS: MEDIA ============
export async function getMediaAssets(params?: PaginationParams & { folder?: string; search?: string }) {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.folder) query.set('folder', params.folder);
  if (params?.search) query.set('search', params.search);
  return adminFetch(`${API_BASE}/media?${query.toString()}`);
}

export async function deleteMediaAsset(id: string) {
  return adminFetch(`${API_BASE}/media?id=${id}`, { method: 'DELETE' });
}

export async function uploadMediaFile(file: File, folder = 'general', alt?: string) {
  const form = new FormData();
  form.append('file', file);
  form.append('folder', folder);
  if (alt) form.append('alt', alt);
  try {
    const res = await fetch('/api/upload', { method: 'POST', body: form, credentials: 'include' });
    return await res.json();
  } catch {
    return { success: false, error: 'Network error' };
  }
}

// ============ CMS: PAYMENT METHODS ============
export async function getPaymentMethodItems() {
  return adminFetch(`${API_BASE}/payment-methods`);
}

export async function createPaymentMethodItem(data: { name: string; imageUrl: string; order?: number; isActive?: boolean }) {
  return adminFetch(`${API_BASE}/payment-methods`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updatePaymentMethodItem(data: Record<string, unknown>) {
  return adminFetch(`${API_BASE}/payment-methods`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deletePaymentMethodItem(id: string) {
  return adminFetch(`${API_BASE}/payment-methods?id=${id}`, { method: 'DELETE' });
}

// ============ CONTACT MESSAGES ============
export async function getContactMessages(params?: PaginationParams & { status?: string; search?: string }) {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.status) query.set('status', params.status);
  if (params?.search) query.set('search', params.search);
  return adminFetch(`${API_BASE}/contact-messages?${query.toString()}`);
}

export async function updateContactMessage(id: string, status: string) {
  return adminFetch(`${API_BASE}/contact-messages`, {
    method: 'PUT',
    body: JSON.stringify({ id, status }),
  });
}

export async function deleteContactMessage(id: string) {
  return adminFetch(`${API_BASE}/contact-messages?id=${id}`, { method: 'DELETE' });
}

// ============ REVIEWS ============
export async function getReviews(params?: PaginationParams & { search?: string }) {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.search) query.set('search', params.search);
  return adminFetch(`${API_BASE}/reviews?${query.toString()}`);
}

export async function deleteReview(id: string) {
  return adminFetch(`${API_BASE}/reviews?id=${id}`, { method: 'DELETE' });
}

// ============ WALLETS ============
export async function getWalletTransactions(params?: PaginationParams & { userId?: string; type?: string }) {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.userId) query.set('userId', params.userId);
  if (params?.type) query.set('type', params.type);
  return adminFetch(`${API_BASE}/wallets?${query.toString()}`);
}

export async function adjustWallet(data: { userId: string; amount: number; type?: 'credit' | 'debit'; description?: string }) {
  return adminFetch(`${API_BASE}/wallets`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ============ CHAT ============
export async function getChatRooms(params?: PaginationParams) {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  return adminFetch(`${API_BASE}/chat?${query.toString()}`);
}

// ============ PAYMENT ACTIONS ============
export async function updatePaymentStatus(id: string, status: string) {
  return adminFetch(`${API_BASE}/payments/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

// ============ AI SUITE (experimental / local Ollama) ============
export async function getAiAdminSettings() {
  return adminFetch(`${API_BASE}/ai/settings`);
}

export async function saveAiAdminSettings(data: Record<string, unknown>) {
  return adminFetch(`${API_BASE}/ai/settings`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function analyzeReviewsAi(data?: { reviewId?: string; limit?: number }) {
  return adminFetch(`${API_BASE}/ai/reviews/analyze`, {
    method: 'POST',
    body: JSON.stringify(data || {}),
  });
}

export async function getSentimentSummaryAi() {
  return adminFetch(`${API_BASE}/ai/reviews/analyze`);
}

export async function generateSeoAi(data: Record<string, unknown>) {
  return adminFetch(`${API_BASE}/ai/seo`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getAiInsights(params?: { kind?: string; country?: string }) {
  const query = new URLSearchParams();
  if (params?.kind) query.set('kind', params.kind);
  if (params?.country) query.set('country', params.country);
  return adminFetch(`${API_BASE}/ai/insights?${query.toString()}`);
}

export async function scorePaymentsAi(data?: { paymentId?: string; limit?: number }) {
  return adminFetch(`${API_BASE}/ai/payments/score`, {
    method: 'POST',
    body: JSON.stringify(data || {}),
  });
}

export async function generateMarketingAi(data?: { goal?: string; locale?: string }) {
  return adminFetch(`${API_BASE}/ai/marketing`, {
    method: 'POST',
    body: JSON.stringify(data || { locale: 'ar' }),
  });
}

export async function getAiHealth() {
  const res = await fetch('/api/ai/health', { credentials: 'include' });
  return res.json();
}

// ============ ADVERTISEMENTS (admin) ============
export async function getAdminAdvertisements(params?: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.set(k, String(v));
    });
  }
  return adminFetch(`${API_BASE}/advertisements?${query.toString()}`);
}

export async function getAdminAdvertisement(id: string) {
  return adminFetch(`${API_BASE}/advertisements/${id}`);
}

export async function advertisementAction(
  id: string,
  data: { action: string; rejectedReason?: string }
) {
  return adminFetch(`${API_BASE}/advertisements/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function updateAdminAdvertisement(id: string, data: Record<string, unknown>) {
  return adminFetch(`${API_BASE}/advertisements/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteAdminAdvertisement(id: string) {
  return adminFetch(`${API_BASE}/advertisements/${id}`, { method: 'DELETE' });
}

export async function confirmAdPayment(paymentId: string) {
  return adminFetch(`${API_BASE}/advertisements/confirm-payment`, {
    method: 'POST',
    body: JSON.stringify({ paymentId }),
  });
}

export async function getAdPlansAdmin() {
  return adminFetch(`${API_BASE}/ad-plans`);
}

export async function createAdPlan(data: Record<string, unknown>) {
  return adminFetch(`${API_BASE}/ad-plans`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateAdPlan(id: string, data: Record<string, unknown>) {
  return adminFetch(`${API_BASE}/ad-plans/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteAdPlan(id: string) {
  return adminFetch(`${API_BASE}/ad-plans/${id}`, { method: 'DELETE' });
}

