import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/api-auth';
import { auditService } from '@/services/audit.service';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') || 20)));
    const search = searchParams.get('search') || undefined;

    const where: Record<string, unknown> = {};
    if (status && status !== 'all') where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { subject: { contains: search } },
        { message: { contains: search } },
      ];
    }

    const [total, items] = await Promise.all([
      db.contactMessage.count({ where }),
      db.contactMessage.findMany({
        where,
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
    console.error('[ADMIN_CONTACT_GET]', error);
    if (error instanceof Error && error.name === 'AuthError') {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to load messages' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAdmin(request);
    const body = await request.json();
    const { id, status } = body;
    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'id and status required' }, { status: 400 });
    }
    const row = await db.contactMessage.update({
      where: { id },
      data: { status },
    });
    await auditService.log({
      userId: user.id,
      action: 'contact.update',
      entity: 'ContactMessage',
      entityId: id,
      details: { status },
    });
    return NextResponse.json({ success: true, data: row });
  } catch (error: unknown) {
    console.error('[ADMIN_CONTACT_PUT]', error);
    if (error instanceof Error && error.name === 'AuthError') {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to update message' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAdmin(request);
    const id = new URL(request.url).searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });
    }
    await db.contactMessage.delete({ where: { id } });
    await auditService.log({
      userId: user.id,
      action: 'contact.delete',
      entity: 'ContactMessage',
      entityId: id,
    });
    return NextResponse.json({ success: true, message: 'Deleted' });
  } catch (error: unknown) {
    console.error('[ADMIN_CONTACT_DELETE]', error);
    if (error instanceof Error && error.name === 'AuthError') {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to delete' }, { status: 500 });
  }
}
