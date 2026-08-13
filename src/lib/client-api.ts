// User-facing API client — mirrors admin-api pattern

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
}

async function userFetch<T = unknown>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(endpoint, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    return await res.json();
  } catch {
    return { success: false, error: 'Network error' };
  }
}

export async function getUserDashboard() {
  return userFetch('/api/users/dashboard');
}

export async function getUserProfile() {
  return userFetch('/api/users/profile');
}

export async function updateUserProfile(data: Record<string, unknown>) {
  return userFetch('/api/users/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function getUserWallet(page = 1, limit = 20) {
  return userFetch(`/api/users/wallet?page=${page}&limit=${limit}`);
}

export async function topUpWallet(amount: number, method: string) {
  return userFetch('/api/users/wallet/topup', {
    method: 'POST',
    body: JSON.stringify({ amount, method }),
  });
}

export async function getUserBookings(params?: { page?: number; limit?: number; status?: string }) {
  const q = new URLSearchParams();
  if (params?.page) q.set('page', String(params.page));
  if (params?.limit) q.set('limit', String(params.limit));
  if (params?.status) q.set('status', params.status);
  return userFetch(`/api/rentals?${q.toString()}`);
}

export async function getUserListings(ownerId: string, page = 1) {
  return userFetch(`/api/cars?ownerId=${ownerId}&status=&page=${page}&limit=20`);
}

export async function getChatRooms() {
  return userFetch('/api/chat/rooms');
}

export async function getNotifications(page = 1) {
  return userFetch(`/api/users/notifications?page=${page}`);
}

export async function searchSuggest(q: string) {
  return userFetch(`/api/search/suggest?q=${encodeURIComponent(q)}`);
}

// ============ ADVERTISEMENTS ============
export async function getAdvertisements(params?: Record<string, string | number | boolean | undefined>) {
  const q = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') q.set(k, String(v));
    });
  }
  return userFetch(`/api/advertisements?${q.toString()}`);
}

export async function getAdvertisement(id: string) {
  return userFetch(`/api/advertisements/${id}`);
}

export async function createAdvertisement(data: Record<string, unknown>) {
  return userFetch('/api/advertisements', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateAdvertisement(id: string, data: Record<string, unknown>) {
  return userFetch(`/api/advertisements/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteAdvertisement(id: string) {
  return userFetch(`/api/advertisements/${id}`, { method: 'DELETE' });
}

export async function payAdvertisement(
  id: string,
  data: { method: 'wallet' | 'bank_transfer'; proofUrl?: string }
) {
  return userFetch(`/api/advertisements/${id}/pay`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getAdPlans() {
  return userFetch('/api/advertisements/plans');
}

export async function uploadAdMedia(file: File, kind: 'image' | 'video' = 'image') {
  const form = new FormData();
  form.append('file', file);
  form.append('folder', 'advertisements');
  form.append('kind', kind);
  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      credentials: 'include',
      body: form,
    });
    return await res.json();
  } catch {
    return { success: false, error: 'Network error' };
  }
}


export async function getHealth() {
  return userFetch('/api/health');
}
