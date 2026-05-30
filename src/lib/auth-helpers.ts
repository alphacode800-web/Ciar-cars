import type { User } from '@/types';
import { UserRole } from '@/types';

export type LoginType = 'user' | 'admin';

export const ADMIN_LOGIN_PATH = '/admin/login';

export function isAdminRole(role?: string | null): boolean {
  return role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;
}

function sessionUserToStoreUser(sessionUser: {
  id?: string;
  email?: string;
  name?: string | null;
  role?: string;
}): User {
  return {
    id: sessionUser.id || '',
    email: sessionUser.email || '',
    name: sessionUser.name || '',
    role: (sessionUser.role as User['role']) || UserRole.USER,
    isActive: true,
    isBanned: false,
    walletBalance: 0,
    rating: 0,
    totalReviews: 0,
    totalListings: 0,
    totalSales: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function fetchSessionUser() {
  const sessionRes = await fetch('/api/auth/session', { credentials: 'include' });
  const session = await sessionRes.json();
  return session?.user ?? null;
}

export async function syncAuthStoreFromSession(
  setUser: (user: User) => void
): Promise<User | null> {
  const sessionUser = await fetchSessionUser();
  if (!sessionUser) return null;
  const user = sessionUserToStoreUser(sessionUser);
  setUser(user);
  return user;
}

function parseAuthError(url?: string): string | undefined {
  if (!url?.includes('/api/auth/error')) return undefined;
  try {
    const parsed = new URL(url, 'http://localhost');
    return decodeURIComponent(parsed.searchParams.get('error') || 'Authentication failed');
  } catch {
    return 'Authentication failed';
  }
}

export async function signInWithCredentials(
  email: string,
  password: string,
  loginType: LoginType
): Promise<{ ok: boolean; error?: string }> {
  const csrfRes = await fetch('/api/auth/csrf', { credentials: 'include' });
  const csrfData = await csrfRes.json().catch(() => ({}));
  const csrfToken = csrfData.csrfToken as string | undefined;

  if (!csrfToken) {
    return { ok: false, error: 'Could not start sign in. Please refresh the page.' };
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const callbackUrl = `${origin}/`;

  const body = new URLSearchParams({
    csrfToken,
    email,
    password,
    loginType,
    callbackUrl,
    json: 'true',
  });

  const res = await fetch('/api/auth/callback/credentials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
    credentials: 'include',
  });

  const data = (await res.json().catch(() => ({}))) as {
    url?: string;
    error?: string;
  };

  const authError = data.error || parseAuthError(data.url);
  if (authError) {
    return { ok: false, error: authError };
  }

  if (data.url && !data.url.includes('/api/auth/error')) {
    return { ok: true };
  }

  return { ok: false, error: 'Invalid credentials' };
}
