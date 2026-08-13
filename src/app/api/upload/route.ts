import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { requireAuth } from '@/lib/api-auth';
import { db } from '@/lib/db';
import { auditService } from '@/services/audit.service';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 40 * 1024 * 1024; // 40MB for ad videos

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (user.role === 'guest') {
      return NextResponse.json(
        { success: false, error: 'Upload not allowed for this account' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const folder = String(formData.get('folder') || 'general').slice(0, 64);
    const alt = formData.get('alt') ? String(formData.get('alt')).slice(0, 255) : null;
    const mediaKind = String(formData.get('kind') || 'image'); // image | video

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    const isVideo = mediaKind === 'video' || VIDEO_TYPES.includes(file.type);
    const allowVideo = folder === 'advertisements' || folder.startsWith('ads');

    if (isVideo) {
      if (!allowVideo) {
        return NextResponse.json(
          { success: false, error: 'Video uploads are only allowed for advertisements' },
          { status: 400 }
        );
      }
      if (!VIDEO_TYPES.includes(file.type)) {
        return NextResponse.json(
          { success: false, error: 'Invalid video type. Use MP4, WebM, or MOV.' },
          { status: 400 }
        );
      }
      if (file.size > MAX_VIDEO_SIZE) {
        return NextResponse.json(
          { success: false, error: 'Video too large. Maximum size is 40MB.' },
          { status: 400 }
        );
      }
    } else {
      if (!IMAGE_TYPES.includes(file.type)) {
        return NextResponse.json(
          { success: false, error: 'Invalid file type. Use JPG, PNG, WebP, or GIF.' },
          { status: 400 }
        );
      }
      if (file.size > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          { success: false, error: 'File too large. Maximum size is 5MB.' },
          { status: 400 }
        );
      }
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', folder);
    await mkdir(uploadsDir, { recursive: true });

    const ext = file.name.split('.').pop()?.toLowerCase() || (isVideo ? 'mp4' : 'jpg');
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadsDir, safeName), buffer);

    const url = `/uploads/${folder}/${safeName}`;

    let asset: { id?: string; url: string; filename: string; mimeType?: string } | null = null;
    try {
      asset = await db.mediaAsset.create({
        data: {
          url,
          filename: safeName,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          alt,
          folder,
          uploadedBy: user.id,
        },
      });
    } catch {
      // MediaAsset table may not exist yet during migration windows
    }

    if (user.role === 'admin' || user.role === 'super_admin') {
      await auditService
        .log({
          userId: user.id,
          action: 'media.upload',
          entity: 'MediaAsset',
          entityId: asset?.id,
          details: { url, folder, mimeType: file.type, size: file.size, kind: isVideo ? 'video' : 'image' },
          ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
          userAgent: request.headers.get('user-agent') ?? undefined,
        })
        .catch(() => undefined);
    }

    return NextResponse.json({
      success: true,
      url,
      kind: isVideo ? 'video' : 'image',
      data: asset ?? { url, filename: safeName, mimeType: file.type },
    });
  } catch (error: unknown) {
    console.error('[UPLOAD_POST]', error);
    if (error instanceof Error && error.name === 'AuthError') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Upload failed' },
      { status: 500 }
    );
  }
}
