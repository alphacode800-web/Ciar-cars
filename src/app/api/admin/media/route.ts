import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/api-auth';
import { auditService } from '@/services/audit.service';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || undefined;
    const search = searchParams.get('search') || undefined;
    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') || 40)));

    const where: Record<string, unknown> = {};
    if (folder && folder !== 'all') where.folder = folder;
    if (search) {
      where.OR = [
        { originalName: { contains: search } },
        { filename: { contains: search } },
        { alt: { contains: search } },
      ];
    }

    const [total, items] = await Promise.all([
      db.mediaAsset.count({ where }),
      db.mediaAsset.findMany({
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
    console.error('[ADMIN_MEDIA_GET]', error);
    if (error instanceof Error && error.name === 'AuthError') {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to load media' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAdmin(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Media ID required' }, { status: 400 });
    }

    const asset = await db.mediaAsset.findUnique({ where: { id } });
    if (!asset) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    if (asset.url.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), 'public', asset.url.replace(/^\//, ''));
      await unlink(filePath).catch(() => undefined);
    }

    await db.mediaAsset.delete({ where: { id } });
    await auditService.log({
      userId: user.id,
      action: 'media.delete',
      entity: 'MediaAsset',
      entityId: id,
      details: { url: asset.url },
      ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
    });

    return NextResponse.json({ success: true, message: 'Media deleted' });
  } catch (error: unknown) {
    console.error('[ADMIN_MEDIA_DELETE]', error);
    if (error instanceof Error && error.name === 'AuthError') {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to delete media' }, { status: 500 });
  }
}
