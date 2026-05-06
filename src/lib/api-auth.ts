// =============================================================================
// CIAR Cars - API Auth Helper
// =============================================================================
// Simplified auth helper for API routes.
// Extracts userId from request headers or body for use in route handlers.
// In production, you'd use getServerSession from next-auth with proper JWT verification.

import { NextRequest } from "next/server";
import { db } from "@/lib/db";

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

/**
 * Get authenticated user from request.
 * Checks Authorization header for Bearer token (JWT).
 * Falls back to X-User-Id header (for development / testing).
 */
export async function getAuthUser(
  request: NextRequest
): Promise<AuthUser | null> {
  try {
    // Try Bearer token (JWT) from Authorization header
    const authHeader = request.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      // Decode JWT payload (base64)
      try {
        const payload = JSON.parse(
          Buffer.from(token.split(".")[1], "base64").toString()
        );
        if (payload?.id) {
          return {
            id: payload.id,
            email: payload.email || "",
            role: payload.role || "user",
          };
        }
      } catch {
        // JWT decode failed, try fallback
      }
    }

    // Fallback: X-User-Id header (development only)
    const userId = request.headers.get("X-User-Id");
    if (userId) {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, role: true },
      });
      if (user) {
        return user;
      }
    }
  } catch {
    // Auth check failed
  }

  return null;
}

/**
 * Require authentication. Returns user or throws error response.
 */
export async function requireAuth(
  request: NextRequest
): Promise<AuthUser | never> {
  const user = await getAuthUser(request);
  if (!user) {
    throw new AuthError("Authentication required", 401);
  }
  return user;
}

/**
 * Require admin role. Returns user or throws error response.
 */
export async function requireAdmin(
  request: NextRequest
): Promise<AuthUser | never> {
  const user = await requireAuth(request);
  if (user.role !== "admin" && user.role !== "super_admin") {
    throw new AuthError("Admin access required", 403);
  }
  return user;
}

/**
 * Custom error class for auth failures.
 */
export class AuthError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 401) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AuthError";
  }
}
