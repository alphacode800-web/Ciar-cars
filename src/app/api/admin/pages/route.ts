import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import { cmsService } from '@/services/cms.service';
import { auditService } from '@/services/audit.service';
import { parseSectionContent } from '@/lib/cms-content';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const pages = await cmsService.listPages();
    return NextResponse.json({
      success: true,
      data: pages.map((p) => ({
        ...p,
        content: parseSectionContent(p.content),
      })),
    });
  } catch (error: unknown) {
    console.error('[ADMIN_PAGES_GET]', error);
    if (error instanceof Error && error.name === 'AuthError') {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to load pages' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAdmin(request);
    const body = await request.json();
    const { slug, title, status, content, seoTitle, seoDescription } = body;

    if (!slug) {
      return NextResponse.json({ success: false, error: 'slug is required' }, { status: 400 });
    }

    const page = await cmsService.updatePage(slug, {
      title,
      status,
      content,
      seoTitle,
      seoDescription,
    });

    await auditService.log({
      userId: user.id,
      action: 'page.update',
      entity: 'PageContent',
      entityId: page.id,
      details: { slug, status: page.status },
      ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
    });

    return NextResponse.json({
      success: true,
      data: { ...page, content: parseSectionContent(page.content) },
      message: 'Page updated',
    });
  } catch (error: unknown) {
    console.error('[ADMIN_PAGES_PUT]', error);
    if (error instanceof Error && error.name === 'AuthError') {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to update page' }, { status: 500 });
  }
}
