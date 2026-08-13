import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/api-auth';
import { auditService } from '@/services/audit.service';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') || 20)));
    const search = searchParams.get('search') || undefined;

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { comment: { contains: search } },
        { user: { name: { contains: search } } },
        { car: { title: { contains: search } } },
      ];
    }

    const [total, items] = await Promise.all([
      db.review.count({ where }),
      db.review.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          car: { select: { id: true, title: true, brand: true, model: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    });
  } catch (error: unknown) {
    console.error('[ADMIN_REVIEWS_GET]', error);
    if (error instanceof Error && error.name === 'AuthError') {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to load reviews' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAdmin(request);
    const id = new URL(request.url).searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });
    }
    await db.review.delete({ where: { id } });
    await auditService.log({
      userId: user.id,
      action: 'review.delete',
      entity: 'Review',
      entityId: id,
    });
    return NextResponse.json({ success: true, message: 'Review deleted' });
  } catch (error: unknown) {
    console.error('[ADMIN_REVIEWS_DELETE]', error);
    if (error instanceof Error && error.name === 'AuthError') {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to delete review' }, { status: 500 });
  }
}
