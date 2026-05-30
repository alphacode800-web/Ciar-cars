import { NextRequest } from 'next/server';
import type { ZodSchema } from 'zod';
import { getAuthUser, requireAuth, requireAdmin } from '@/lib/api-auth';
import type { AuthUser } from '@/lib/api-auth';
import { handleApiError } from '@/lib/api-response';

type AuthMode = 'public' | 'user' | 'admin';

interface RouteContext {
  user: AuthUser | null;
  params: Record<string, string>;
}

interface HandlerOptions<TBody = unknown> {
  auth?: AuthMode;
  bodySchema?: ZodSchema<TBody>;
  querySchema?: ZodSchema;
}

export function createHandler<TBody = unknown>(
  handler: (req: NextRequest, ctx: RouteContext & { body?: TBody }) => Promise<Response>,
  options: HandlerOptions<TBody> = {}
) {
  return async (
    req: NextRequest,
    routeCtx?: { params?: Promise<Record<string, string>> }
  ): Promise<Response> => {
    try {
      let user: AuthUser | null = null;
      const authMode = options.auth ?? 'public';

      if (authMode === 'admin') {
        user = await requireAdmin(req);
      } else if (authMode === 'user') {
        user = await requireAuth(req);
      } else {
        user = await getAuthUser(req);
      }

      const params = routeCtx?.params ? await routeCtx.params : {};

      let body: TBody | undefined;
      if (options.bodySchema && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
        const raw = await req.json();
        body = options.bodySchema.parse(raw) as TBody;
      }

      if (options.querySchema) {
        const url = new URL(req.url);
        const query: Record<string, string> = {};
        url.searchParams.forEach((v, k) => {
          query[k] = v;
        });
        options.querySchema.parse(query);
      }

      return await handler(req, { user, params, body });
    } catch (error) {
      return handleApiError(error);
    }
  };
}
