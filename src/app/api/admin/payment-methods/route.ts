import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/api-auth';
import { auditService } from '@/services/audit.service';
import { cmsService } from '@/services/cms.service';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    await cmsService.ensurePaymentMethods();
    const items = await db.paymentMethodItem.findMany({ orderBy: { order: 'asc' } });
    return NextResponse.json({ success: true, data: items });
  } catch (error: unknown) {
    console.error('[ADMIN_PAYMENT_METHODS_GET]', error);
    if (error instanceof Error && error.name === 'AuthError') {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to load payment methods' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin(request);
    const body = await request.json();
    const { name, imageUrl, order, isActive } = body;
    if (!name || !imageUrl) {
      return NextResponse.json({ success: false, error: 'name and imageUrl required' }, { status: 400 });
    }
    const maxOrder = await db.paymentMethodItem.aggregate({ _max: { order: true } });
    const item = await db.paymentMethodItem.create({
      data: {
        name,
        imageUrl,
        order: order ?? (maxOrder._max.order ?? 0) + 1,
        isActive: isActive ?? true,
      },
    });
    await auditService.log({
      userId: user.id,
      action: 'payment_method.create',
      entity: 'PaymentMethodItem',
      entityId: item.id,
      details: { name },
    });
    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error: unknown) {
    console.error('[ADMIN_PAYMENT_METHODS_POST]', error);
    if (error instanceof Error && error.name === 'AuthError') {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to create payment method' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAdmin(request);
    const body = await request.json();
    const { id, name, imageUrl, order, isActive, items } = body;

    // Bulk reorder
    if (Array.isArray(items)) {
      await Promise.all(
        items.map((it: { id: string; order: number; isActive?: boolean }) =>
          db.paymentMethodItem.update({
            where: { id: it.id },
            data: {
              order: it.order,
              ...(it.isActive !== undefined ? { isActive: it.isActive } : {}),
            },
          })
        )
      );
      await auditService.log({
        userId: user.id,
        action: 'payment_method.reorder',
        entity: 'PaymentMethodItem',
      });
      const all = await db.paymentMethodItem.findMany({ orderBy: { order: 'asc' } });
      return NextResponse.json({ success: true, data: all });
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });
    }

    const item = await db.paymentMethodItem.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(imageUrl !== undefined ? { imageUrl } : {}),
        ...(order !== undefined ? { order } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
      },
    });

    await auditService.log({
      userId: user.id,
      action: 'payment_method.update',
      entity: 'PaymentMethodItem',
      entityId: id,
    });

    return NextResponse.json({ success: true, data: item });
  } catch (error: unknown) {
    console.error('[ADMIN_PAYMENT_METHODS_PUT]', error);
    if (error instanceof Error && error.name === 'AuthError') {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to update payment method' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAdmin(request);
    const id = new URL(request.url).searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'id required' }, { status: 400 });
    }
    await db.paymentMethodItem.delete({ where: { id } });
    await auditService.log({
      userId: user.id,
      action: 'payment_method.delete',
      entity: 'PaymentMethodItem',
      entityId: id,
    });
    return NextResponse.json({ success: true, message: 'Deleted' });
  } catch (error: unknown) {
    console.error('[ADMIN_PAYMENT_METHODS_DELETE]', error);
    if (error instanceof Error && error.name === 'AuthError') {
      return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to delete' }, { status: 500 });
  }
}
