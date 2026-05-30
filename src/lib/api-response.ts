import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError, AuthError, ValidationError } from '@/lib/errors';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function buildPagination(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

export function apiSuccess<T>(
  data: T,
  init?: { status?: number; message?: string; pagination?: PaginationMeta }
) {
  return NextResponse.json(
    {
      success: true as const,
      data,
      ...(init?.message ? { message: init.message } : {}),
      ...(init?.pagination ? { pagination: init.pagination } : {}),
    },
    { status: init?.status ?? 200 }
  );
}

export function apiError(
  error: string,
  status = 400,
  extras?: { code?: string; details?: Record<string, string[]> }
) {
  return NextResponse.json(
    {
      success: false as const,
      error,
      ...(extras?.code ? { code: extras.code } : {}),
      ...(extras?.details ? { details: extras.details } : {}),
    },
    { status }
  );
}

export function handleApiError(error: unknown) {
  if (error instanceof AuthError) {
    return apiError(error.message, error.statusCode, { code: error.code });
  }
  if (error instanceof ValidationError) {
    return apiError(error.message, error.statusCode, {
      code: error.code,
      details: error.details,
    });
  }
  if (error instanceof AppError) {
    return apiError(error.message, error.statusCode, {
      code: error.code,
      details: error.details,
    });
  }
  if (error instanceof ZodError) {
    const details: Record<string, string[]> = {};
    for (const issue of error.issues) {
      const key = issue.path.join('.') || 'body';
      details[key] = [...(details[key] ?? []), issue.message];
    }
    return apiError('Validation failed', 422, {
      code: 'VALIDATION_ERROR',
      details,
    });
  }

  console.error('[API Error]', error);
  return apiError('Internal server error', 500, { code: 'INTERNAL_ERROR' });
}
