// =============================================================================
// CIAR Cars - Chat Rooms API
// GET  /api/chat/rooms      - Get chat rooms for current user
// POST /api/chat/rooms      - Create or get chat room (with carId + otherUserId)
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

// ============ GET: User's Chat Rooms ============

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const rooms = await db.chatRoomUser.findMany({
      where: { userId: user.id },
      include: {
        room: {
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true,
                    city: true,
                    rating: true,
                    totalReviews: true,
                  },
                },
              },
            },
            _count: {
              select: { messages: true },
            },
          },
        },
      },
      orderBy: { room: { lastMessageAt: "desc" } },
    });

    // Get unique carIds from rooms to batch-fetch car data
    const carIds = rooms
      .map((r) => r.room.carId)
      .filter((id): id is string => !!id);
    const uniqueCarIds = [...new Set(carIds)];

    const carsData = uniqueCarIds.length > 0
      ? await db.car.findMany({
          where: { id: { in: uniqueCarIds } },
          select: {
            id: true,
            title: true,
            brand: true,
            model: true,
            year: true,
            price: true,
          },
        })
      : [];

    // Also fetch primary images for these cars
    const carImages = uniqueCarIds.length > 0
      ? await db.carImage.findMany({
          where: { carId: { in: uniqueCarIds }, isPrimary: true },
          select: { carId: true, url: true },
        })
      : [];

    const carMap = new Map(carsData.map((c) => [c.id, c]));
    const carImageMap = new Map(carImages.map((ci) => [ci.carId, ci.url]));

    const formattedRooms = rooms
      .map((r) => {
        const otherParticipants = r.room.participants
          .filter((p) => p.userId !== user.id)
          .map((p) => p.user);

        const carId = r.room.carId;
        const car = carId ? carMap.get(carId) : undefined;
        const carImageUrl = carId ? carImageMap.get(carId) : undefined;

        return {
          id: r.room.id,
          type: r.room.type,
          car: car
            ? { ...car, primaryImage: carImageUrl || null }
            : null,
          participants: otherParticipants,
          lastMessage: r.room.lastMessage,
          lastMessageAt: r.room.lastMessageAt,
          isArchived: r.room.isArchived,
          unreadCount: r.room._count.messages,
          lastReadAt: r.lastReadAt,
          isMuted: r.isMuted,
          createdAt: r.room.createdAt,
        };
      });

    return NextResponse.json({
      success: true,
      data: formattedRooms,
    });
  } catch (error: unknown) {
    console.error("[CHAT_ROOMS_GET]", error);
    if (error instanceof Error && error.name === "AuthError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to fetch chat rooms" },
      { status: 500 }
    );
  }
}

// ============ POST: Create or Get Chat Room ============

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const body = await request.json();
    const { carId, otherUserId } = body;

    if (!otherUserId) {
      return NextResponse.json(
        { success: false, error: "otherUserId is required" },
        { status: 400 }
      );
    }

    if (otherUserId === user.id) {
      return NextResponse.json(
        { success: false, error: "You cannot create a chat room with yourself" },
        { status: 400 }
      );
    }

    // Verify other user exists
    const otherUser = await db.user.findUnique({
      where: { id: otherUserId },
      select: { id: true, name: true, isActive: true, isBanned: true },
    });

    if (!otherUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check if a room already exists between these two users for this car
    let room;

    if (carId) {
      // Find existing room with same participants and car
      const existingParticipants = await db.chatRoomUser.findMany({
        where: { userId: user.id },
        select: { roomId: true },
      });

      for (const ep of existingParticipants) {
        const otherParticipant = await db.chatRoomUser.findFirst({
          where: {
            roomId: ep.roomId,
            userId: otherUserId,
          },
        });

        if (otherParticipant) {
          const existingRoom = await db.chatRoom.findFirst({
            where: { id: ep.roomId, carId },
          });

          if (existingRoom) {
            room = existingRoom;
            break;
          }
        }
      }
    }

    // If no existing room, create one
    if (!room) {
      room = await db.chatRoom.create({
        data: {
          carId: carId || null,
          type: "private",
          participants: {
            create: [
              { userId: user.id },
              { userId: otherUserId },
            ],
          },
        },
        include: {
          participants: {
            include: {
              user: {
                select: { id: true, name: true, avatar: true },
              },
            },
          },
        },
      });
    } else {
      // Re-fetch with full relations
      room = await db.chatRoom.findUnique({
        where: { id: room.id },
        include: {
          participants: {
            include: {
              user: {
                select: { id: true, name: true, avatar: true },
              },
            },
          },
        },
      });
    }

    // Fetch car data if carId exists
    let carData = null;
    if (room.carId) {
      const car = await db.car.findUnique({
        where: { id: room.carId },
        select: {
          id: true,
          title: true,
          brand: true,
          model: true,
          year: true,
          price: true,
        },
      });
      if (car) {
        const primaryImage = await db.carImage.findFirst({
          where: { carId: car.id, isPrimary: true },
          select: { url: true },
        });
        carData = { ...car, primaryImage: primaryImage?.url || null };
      }
    }

    const responseData = {
      ...room,
      car: carData,
    };

    return NextResponse.json(
      { success: true, data: responseData, message: "Chat room ready" },
      { status: room.type === "private" ? 200 : 201 }
    );
  } catch (error: unknown) {
    console.error("[CHAT_ROOMS_POST]", error);
    if (error instanceof Error && error.name === "AuthError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to create chat room" },
      { status: 500 }
    );
  }
}
