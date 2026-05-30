import { NextRequest } from 'next/server';
import { createHandler } from '@/lib/api-handler';
import { apiError, apiSuccess, buildPagination, handleApiError } from '@/lib/api-response';
import { requireAuth } from '@/lib/api-auth';
import { db } from '@/lib/db';
import { savedSearchSchema } from '@/validators/auth.schema';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '20'));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      db.savedSearch.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      db.savedSearch.count({ where: { userId: user.id } }),
    ]);

    return apiSuccess(
      items.map((s) => ({
        ...s,
        filters: JSON.parse(s.filters),
      })),
      { pagination: buildPagination(page, limit, total) }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export const POST = createHandler(
  async (_req, { user, body }) => {
    const saved = await db.savedSearch.create({
      data: {
        userId: user!.id,
        name: body!.name ?? 'Saved search',
        filters: JSON.stringify(body!.filters),
      },
    });

    return apiSuccess(
      { ...saved, filters: body!.filters },
      { status: 201, message: 'Search saved' }
    );
  },
  { auth: 'user', bodySchema: savedSearchSchema }
);

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const id = new URL(request.url).searchParams.get('id');
    if (!id) {
      return apiError('Missing id parameter', 400);
    }

    await db.savedSearch.deleteMany({ where: { id, userId: user.id } });
    return apiSuccess({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
