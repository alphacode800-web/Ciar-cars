import { createServer } from 'http';
import { Server, Socket } from 'socket.io';

// =============================================================================
// CIAR Cars - Chat Service (Socket.io)
// Port: 3004 | Path: '/' (required for Caddy gateway)
// =============================================================================

const PORT = 3004;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChatUser {
  id: string;
  socketId: string;
  joinedAt: Date;
}

interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  imageUrl?: string | null;
  isRead: boolean;
  readAt?: Date | null;
  createdAt: Date;
}

interface RoomState {
  id: string;
  users: Map<string, ChatUser>; // userId -> ChatUser
  messages: ChatMessage[];
  lastMessageAt: Date;
}

// ---------------------------------------------------------------------------
// In-memory stores
// ---------------------------------------------------------------------------

const rooms = new Map<string, RoomState>();

/** Reverse lookup: socketId -> Set of roomIds the socket has joined */
const socketRooms = new Map<string, Set<string>>();

/** Generate a unique message ID */
const generateId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getOrCreateRoom(roomId: string): RoomState {
  let room = rooms.get(roomId);
  if (!room) {
    room = {
      id: roomId,
      users: new Map(),
      messages: [],
      lastMessageAt: new Date(),
    };
    rooms.set(roomId, room);
    console.log(`[room] Created new room: ${roomId}`);
  }
  return room;
}

function getRoomUserList(room: RoomState): { id: string; joinedAt: Date }[] {
  return Array.from(room.users.values()).map((u) => ({
    id: u.id,
    joinedAt: u.joinedAt,
  }));
}

function emitError(socket: Socket, message: string, event?: string) {
  console.warn(`[error] socket=${socket.id} event=${event ?? 'unknown'}: ${message}`);
  socket.emit('error', { message });
}

function joinSocketToRoom(socketId: string, roomId: string) {
  const set = socketRooms.get(socketId) ?? new Set();
  set.add(roomId);
  socketRooms.set(socketId, set);
}

function removeSocketFromRoom(socketId: string, roomId: string) {
  const set = socketRooms.get(socketId);
  if (set) {
    set.delete(roomId);
    if (set.size === 0) socketRooms.delete(socketId);
  }
}

// ---------------------------------------------------------------------------
// Socket.io server
// ---------------------------------------------------------------------------

const httpServer = createServer();

const io = new Server(httpServer, {
  // DO NOT change the path — Caddy forwards based on XTransformPort
  path: '/',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// ---------------------------------------------------------------------------
// Connection lifecycle
// ---------------------------------------------------------------------------

io.on('connection', (socket: Socket) => {
  console.log(`[connect] socket=${socket.id} total=${io.sockets.sockets.size}`);

  // ---- room:join ----------------------------------------------------------
  socket.on(
    'room:join',
    (payload: { roomId: string; userId: string }, ack?: (ok: boolean) => void) => {
      try {
        const { roomId, userId } = payload;

        if (!roomId || !userId) {
          emitError(socket, 'roomId and userId are required', 'room:join');
          ack?.(false);
          return;
        }

        const room = getOrCreateRoom(roomId);

        // Register the user in the room
        room.users.set(userId, { id: userId, socketId: socket.id, joinedAt: new Date() });
        room.lastMessageAt = new Date();

        // Track which rooms this socket belongs to
        joinSocketToRoom(socket.id, roomId);

        // Join the Socket.io room so we can broadcast efficiently
        socket.join(roomId);

        // Send recent messages to the joining user
        const recentMessages = room.messages.slice(-50); // last 50 messages
        socket.emit('room:history', {
          roomId,
          messages: recentMessages,
        });

        // Broadcast updated room state to everyone in the room
        io.to(roomId).emit('room:updated', {
          id: roomId,
          onlineUsers: getRoomUserList(room),
          onlineCount: room.users.size,
          lastMessageAt: room.lastMessageAt,
        });

        // Also emit room:joined to the joining socket as confirmation
        socket.emit('room:joined', {
          id: roomId,
          onlineUsers: getRoomUserList(room),
          onlineCount: room.users.size,
        });

        console.log(`[room:join] userId=${userId} roomId=${roomId} online=${room.users.size}`);
        ack?.(true);
      } catch (err) {
        console.error(`[room:join] Error:`, err);
        emitError(socket, 'Failed to join room', 'room:join');
        ack?.(false);
      }
    },
  );

  // ---- room:leave ---------------------------------------------------------
  socket.on(
    'room:leave',
    (payload: { roomId: string; userId: string }, ack?: (ok: boolean) => void) => {
      try {
        const { roomId, userId } = payload;

        if (!roomId || !userId) {
          emitError(socket, 'roomId and userId are required', 'room:leave');
          ack?.(false);
          return;
        }

        const room = rooms.get(roomId);
        if (!room) {
          emitError(socket, 'Room not found', 'room:leave');
          ack?.(false);
          return;
        }

        // Only remove if the socket matches
        const roomUser = room.users.get(userId);
        if (roomUser && roomUser.socketId === socket.id) {
          room.users.delete(userId);
          socket.leave(roomId);
          removeSocketFromRoom(socket.id, roomId);
        }

        // Broadcast updated room state
        io.to(roomId).emit('room:updated', {
          id: roomId,
          onlineUsers: getRoomUserList(room),
          onlineCount: room.users.size,
          lastMessageAt: room.lastMessageAt,
        });

        // Notify the leaving user
        socket.emit('room:left', { roomId });

        // Clean up empty rooms (optional: keep in memory for history)
        if (room.users.size === 0) {
          console.log(`[room:leave] Room ${roomId} is now empty`);
        }

        console.log(`[room:leave] userId=${userId} roomId=${roomId} online=${room.users.size}`);
        ack?.(true);
      } catch (err) {
        console.error(`[room:leave] Error:`, err);
        emitError(socket, 'Failed to leave room', 'room:leave');
        ack?.(false);
      }
    },
  );

  // ---- message:send -------------------------------------------------------
  socket.on(
    'message:send',
    (
      payload: {
        roomId: string;
        userId: string;
        content: string;
        type?: 'text' | 'image' | 'file' | 'system';
        imageUrl?: string | null;
      },
      ack?: (message: ChatMessage | null) => void,
    ) => {
      try {
        const { roomId, userId, content, type = 'text', imageUrl = null } = payload;

        if (!roomId || !userId || !content) {
          emitError(socket, 'roomId, userId, and content are required', 'message:send');
          ack?.(null);
          return;
        }

        const room = getOrCreateRoom(roomId);

        // Optionally verify the user is in the room (not required for initial message)
        // const isMember = room.users.has(userId);
        // if (!isMember) { emitError(socket, 'Not a member of this room', 'message:send'); ack?.(null); return; }

        const message: ChatMessage = {
          id: generateId(),
          roomId,
          senderId: userId,
          content,
          type,
          imageUrl,
          isRead: false,
          createdAt: new Date(),
        };

        // Store in memory
        room.messages.push(message);
        room.lastMessageAt = new Date();

        // Broadcast to all users in the room (including sender)
        io.to(roomId).emit('message:new', message);

        console.log(
          `[message:send] userId=${userId} roomId=${roomId} type=${type} len=${content.length}`,
        );
        ack?.(message);
      } catch (err) {
        console.error(`[message:send] Error:`, err);
        emitError(socket, 'Failed to send message', 'message:send');
        ack?.(null);
      }
    },
  );

  // ---- message:read -------------------------------------------------------
  socket.on(
    'message:read',
    (
      payload: { roomId: string; messageId: string; userId: string },
      ack?: (ok: boolean) => void,
    ) => {
      try {
        const { roomId, messageId, userId } = payload;

        if (!roomId || !messageId || !userId) {
          emitError(socket, 'roomId, messageId, and userId are required', 'message:read');
          ack?.(false);
          return;
        }

        const room = rooms.get(roomId);
        if (!room) {
          emitError(socket, 'Room not found', 'message:read');
          ack?.(false);
          return;
        }

        const message = room.messages.find((m) => m.id === messageId);
        if (!message) {
          emitError(socket, 'Message not found', 'message:read');
          ack?.(false);
          return;
        }

        const readAt = new Date();
        message.isRead = true;
        message.readAt = readAt;

        // Notify the original sender that their message was read
        io.to(roomId).emit('message:read:receipt', {
          roomId,
          messageId,
          userId,
          readAt,
        });

        console.log(
          `[message:read] userId=${userId} roomId=${roomId} messageId=${messageId}`,
        );
        ack?.(true);
      } catch (err) {
        console.error(`[message:read] Error:`, err);
        emitError(socket, 'Failed to mark message as read', 'message:read');
        ack?.(false);
      }
    },
  );

  // ---- typing:start -------------------------------------------------------
  socket.on('typing:start', (payload: { roomId: string; userId: string }) => {
    try {
      const { roomId, userId } = payload;

      if (!roomId || !userId) {
        emitError(socket, 'roomId and userId are required', 'typing:start');
        return;
      }

      // Broadcast to all OTHER sockets in the room (exclude sender)
      socket.to(roomId).emit('user:typing', { roomId, userId });

      console.log(`[typing:start] userId=${userId} roomId=${roomId}`);
    } catch (err) {
      console.error(`[typing:start] Error:`, err);
    }
  });

  // ---- typing:stop --------------------------------------------------------
  socket.on('typing:stop', (payload: { roomId: string; userId: string }) => {
    try {
      const { roomId, userId } = payload;

      if (!roomId || !userId) {
        emitError(socket, 'roomId and userId are required', 'typing:stop');
        return;
      }

      socket.to(roomId).emit('user:stop-typing', { roomId, userId });

      console.log(`[typing:stop] userId=${userId} roomId=${roomId}`);
    } catch (err) {
      console.error(`[typing:stop] Error:`, err);
    }
  });

  // ---- disconnect ---------------------------------------------------------
  socket.on('disconnect', (reason) => {
    console.log(`[disconnect] socket=${socket.id} reason=${reason}`);

    const joinedRoomIds = socketRooms.get(socket.id);
    if (joinedRoomIds) {
      for (const roomId of joinedRoomIds) {
        const room = rooms.get(roomId);
        if (!room) continue;

        // Find and remove the user whose socketId matches
        for (const [userId, user] of room.users.entries()) {
          if (user.socketId === socket.id) {
            room.users.delete(userId);

            // Broadcast updated room state
            io.to(roomId).emit('room:updated', {
              id: roomId,
              onlineUsers: getRoomUserList(room),
              onlineCount: room.users.size,
              lastMessageAt: room.lastMessageAt,
            });

            // Send a system message about the disconnection
            const sysMsg: ChatMessage = {
              id: generateId(),
              roomId,
              senderId: 'system',
              content: `User ${userId} disconnected`,
              type: 'system',
              isRead: true,
              createdAt: new Date(),
            };
            room.messages.push(sysMsg);
            io.to(roomId).emit('message:new', sysMsg);

            console.log(
              `[disconnect] Removed userId=${userId} from roomId=${roomId} remaining=${room.users.size}`,
            );
            break;
          }
        }
      }
      socketRooms.delete(socket.id);
    }
  });

  // ---- error handler for the socket ---------------------------------------
  socket.on('error', (err) => {
    console.error(`[socket:error] socket=${socket.id}:`, err);
  });
});

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------

httpServer.listen(PORT, () => {
  console.log(`[ciar-chat] Chat service running on port ${PORT}`);
  console.log(`[ciar-chat] Path: '/' | CORS: * | Transports: websocket, polling`);
});

// ---------------------------------------------------------------------------
// Graceful shutdown
// ---------------------------------------------------------------------------

function shutdown(signal: string) {
  console.log(`[shutdown] Received ${signal}, closing chat service...`);
  io.close(() => {
    console.log('[shutdown] All sockets closed');
    httpServer.close(() => {
      console.log('[shutdown] HTTP server closed');
      process.exit(0);
    });
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
