import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim();
    const phone = body.phone ? String(body.phone).trim() : null;
    const subject = body.subject ? String(body.subject).trim() : null;
    const message = String(body.message || '').trim();

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: 'Invalid email' }, { status: 400 });
    }

    const row = await db.contactMessage.create({
      data: {
        name: name.slice(0, 120),
        email: email.slice(0, 180),
        phone: phone?.slice(0, 40) ?? null,
        subject: subject?.slice(0, 200) ?? null,
        message: message.slice(0, 5000),
        status: 'new',
      },
    });

    return NextResponse.json(
      { success: true, data: { id: row.id }, message: 'Message received' },
      { status: 201 }
    );
  } catch (error) {
    console.error('[CONTACT_POST]', error);
    return NextResponse.json({ success: false, error: 'Failed to send message' }, { status: 500 });
  }
}
