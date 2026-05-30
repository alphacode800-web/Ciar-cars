// =============================================================================
// CIAR Cars - API Auth Helper
// =============================================================================

import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { db } from "@/lib/db";
import { AuthError } from "@/lib/errors";

export { AuthError };

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

/**
 * Get authenticated user from request.
 * Uses NextAuth session cookie, then Bearer token, then X-User-Id (dev).
 */
export async function getAuthUser(
  request: NextRequest
): Promise<AuthUser | null> {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (token) {
      const id = (token.id as string | undefined) || token.sub;
      if (id) {
        return {
          id,
          email: (token.email as string) || "",
          role: (token.role as string) || "user",
        };
      }
    }

    const authHeader = request.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const bearerToken = authHeader.substring(7);
      try {
        const payload = JSON.parse(
          Buffer.from(bearerToken.split(".")[1], "base64").toString()
        );
        if (payload?.id) {
          return {
            id: payload.id,
            email: payload.email || "",
            role: payload.role || "user",
          };
        }
      } catch {
        // JWT decode failed
      }
    }

    if (process.env.NODE_ENV !== "production") {
      const userId = request.headers.get("X-User-Id");
      if (userId) {
        const user = await db.user.findUnique({
          where: { id: userId },
          select: { id: true, email: true, role: true },
        });
        if (user) return user;
      }
    }
  } catch {
    // Auth check failed
  }

  return null;
}

export async function requireAuth(
  request: NextRequest
): Promise<AuthUser | never> {
  const user = await getAuthUser(request);
  if (!user) {
    throw new AuthError("Authentication required", 401);
  }
  return user;
}

export async function requireAdmin(
  request: NextRequest
): Promise<AuthUser | never> {
  const user = await requireAuth(request);
  if (user.role !== "admin" && user.role !== "super_admin") {
    throw new AuthError("Admin access required", 403);
  }
  return user;
}
