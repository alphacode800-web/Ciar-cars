// =============================================================================
// CIAR Cars - Chat Messages API
// GET  /api/chat/rooms/[id]/messages  - Get messages for a room (paginated)
// POST /api/chat/rooms/[id]/messages  - Send a message to a room
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

// ============ GET: Messages in Room ============

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id: roomId } = await params;

    // Verify user is a participant in this room
    const membership = await db.chatRoomUser.findFirst({
      where: { roomId, userId: user.id },
    });

    if (!membership) {
      return NextResponse.json(
        { success: false, error: "You are not a participant in this chat room" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || String(DEFAULT_PAGE_SIZE))));
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      db.chatMessage.findMany({
        where: { roomId },
        skip,
        take: limit,
        orderBy: { createdAt: "asc" },
        include: {
          sender: {
            select: { id: true, name: true, avatar: true },
          },
          receiver: {
            select: { id: true, name: true, avatar: true },
          },
        },
      }),
      db.chatMessage.count({ where: { roomId } }),
    ]);

    // Mark messages as read
    await db.chatMessage.updateMany({
      where: {
        roomId,
        receiverId: user.id,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    // Update last read time
    await db.chatRoomUser.update({
      where: { id: membership.id },
      data: { lastReadAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      data: messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: skip + limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error: unknown) {
    console.error("[MESSAGES_GET]", error);
    if (error instanceof Error && error.name === "AuthError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// ============ POST: Send Message ============

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id: roomId } = await params;

    // Verify user is a participant in this room
    const membership = await db.chatRoomUser.findFirst({
      where: { roomId, userId: user.id },
    });

    if (!membership) {
      return NextResponse.json(
        { success: false, error: "You are not a participant in this chat room" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { content, type, imageUrl, receiverId } = body;

    if (!content) {
      return NextResponse.json(
        { success: false, error: "Message content is required" },
        { status: 400 }
      );
    }

    const validTypes = ["text", "image", "file", "system"];
    const messageType = validTypes.includes(type) ? type : "text";

    // Create message
    const message = await db.chatMessage.create({
      data: {
        roomId,
        senderId: user.id,
        content,
        type: messageType,
        imageUrl: imageUrl || null,
        receiverId: receiverId || null,
      },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true },
        },
        receiver: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    // Update room's last message
    await db.chatRoom.update({
      where: { id: roomId },
      data: {
        lastMessage: content.substring(0, 200),
        lastMessageAt: new Date(),
      },
    });

    // Increment car inquiries if this room has a car and it's the first message
    const room = await db.chatRoom.findUnique({
      where: { id: roomId },
      select: { carId: true },
    });

    if (room?.carId) {
      const messageCount = await db.chatMessage.count({
        where: { roomId, senderId: user.id },
      });
      if (messageCount === 1) {
        await db.car.update({
          where: { id: room.carId },
          data: { inquiriesCount: { increment: 1 } },
        });
      }
    }

    return NextResponse.json(
      { success: true, data: message, message: "Message sent" },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("[MESSAGES_POST]", error);
    if (error instanceof Error && error.name === "AuthError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to send message" },
      { status: 500 }
    );
  }
}
