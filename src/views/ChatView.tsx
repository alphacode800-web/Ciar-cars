'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import {
  Search,
  Send,
  ImagePlus,
  Smile,
  MoreVertical,
  Phone,
  Archive,
  BellOff,
  Bell,
  ChevronLeft,
  Check,
  CheckCheck,
  X,
  MessageSquare,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/store/auth-store';
import { useAppStore } from '@/store/app-store';
import type { ChatRoom, ChatMessage, ChatSocketEvents } from '@/types';
import { cn } from '@/lib/utils';
import { format, isToday, isYesterday, isSameDay, parseISO } from 'date-fns';

// ============ Types ============

interface ChatRoomListItem {
  id: string;
  type: string;
  car: {
    id: string;
    title: string;
    brand: string;
    model: string;
    year: number;
    images: { url: string; isPrimary: boolean }[];
    price: number;
  } | null;
  participants: {
    id: string;
    name: string | null;
    avatar: string | null;
    isOnline?: boolean;
  }[];
  lastMessage: string | null;
  lastMessageAt: string | null;
  isArchived: boolean;
  unreadCount: number;
  lastReadAt: string | null;
  isMuted: boolean;
  createdAt: string;
}

interface TypingUser {
  userId: string;
  userName: string;
}

// ============ Helper Functions ============

function formatMessageTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (isToday(d)) return format(d, 'HH:mm');
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMM d');
}

function formatChatListTime(date: string | Date | null): string {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (isToday(d)) return format(d, 'HH:mm');
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMM d, yyyy');
}

function getDateSeparator(messages: ChatMessage[], index: number): string | null {
  if (index === 0) return 'Today';
  const curr = typeof messages[index].createdAt === 'string'
    ? parseISO(messages[index].createdAt as string)
    : new Date(messages[index].createdAt);
  const prev = typeof messages[index - 1].createdAt === 'string'
    ? parseISO(messages[index - 1].createdAt as string)
    : new Date(messages[index - 1].createdAt);

  if (!isSameDay(curr, prev)) {
    if (isToday(curr)) return 'Today';
    if (isYesterday(curr)) return 'Yesterday';
    return format(curr, 'EEEE, MMMM d, yyyy');
  }
  return null;
}

// ============ Typing Indicator ============

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex items-end gap-2 px-4 py-2"
    >
      <div className="rounded-2xl rounded-bl-sm bg-muted px-4 py-3">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-2 w-2 rounded-full bg-muted-foreground/50"
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ============ Chat List Skeleton ============

function ChatListSkeleton() {
  return (
    <div className="space-y-1 p-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg p-2">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-3 w-12" />
        </div>
      ))}
    </div>
  );
}

// ============ Message Bubble ============

function MessageBubble({
  message,
  isOwn,
  showAvatar,
  showSenderName,
  senderName,
  senderAvatar,
  isFirstInGroup,
}: {
  message: ChatMessage;
  isOwn: boolean;
  showAvatar: boolean;
  showSenderName: boolean;
  senderName: string;
  senderAvatar: string | null;
  isFirstInGroup: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex gap-2 px-4',
        isOwn ? 'flex-row-reverse' : 'flex-row',
        isFirstInGroup ? 'mt-4' : 'mt-0.5'
      )}
    >
      {/* Avatar */}
      {!isOwn && showAvatar && (
        <Avatar className="mt-auto h-8 w-8 shrink-0">
          <AvatarImage src={senderAvatar || undefined} alt={senderName} />
          <AvatarFallback className="text-xs">
            {senderName?.charAt(0)?.toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>
      )}
      {!isOwn && !showAvatar && <div className="w-8 shrink-0" />}

      <div className={cn('max-w-[75%] md:max-w-[60%]', isOwn && 'flex flex-col items-end')}>
        {showSenderName && !isOwn && (
          <span className="mb-1 ml-2 text-xs font-medium text-muted-foreground">
            {senderName}
          </span>
        )}

        {message.type === 'system' ? (
          <div className="flex items-center justify-center px-4 py-2">
            <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              {message.content}
            </span>
          </div>
        ) : (
          <>
            <div
              className={cn(
                'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                isOwn
                  ? 'rounded-br-sm bg-primary text-primary-foreground'
                  : 'rounded-bl-sm bg-muted text-foreground',
                isFirstInGroup && !isOwn && 'rounded-bl-lg',
                isFirstInGroup && isOwn && 'rounded-br-lg'
              )}
            >
              {message.type === 'image' && message.imageUrl ? (
                <img
                  src={message.imageUrl}
                  alt="Shared image"
                  className="max-h-64 rounded-lg object-cover"
                />
              ) : (
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
              )}
            </div>

            <div
              className={cn(
                'mt-0.5 flex items-center gap-1',
                isOwn ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              <span className="text-[10px] text-muted-foreground/70">
                {formatMessageTime(message.createdAt)}
              </span>
              {isOwn && (
                <span className="text-muted-foreground/70">
                  {message.isRead ? (
                    <CheckCheck className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

// ============ Empty State ============

function EmptyChatState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="rounded-full bg-muted p-6">
        <MessageSquare className="h-10 w-10 text-muted-foreground" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-foreground">Select a conversation</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a chat from the sidebar to start messaging
        </p>
      </div>
    </div>
  );
}

// ============ Main Component ============

export default function ChatView() {
  const { user } = useAuthStore();
  const { viewParams } = useAppStore();

  const [rooms, setRooms] = useState<ChatRoomListItem[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<ChatRoomListItem[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoomListItem | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [showMobileSidebar, setShowMobileSidebar] = useState(true);
  const [isNewMessages, setIsNewMessages] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ============ Initialize Socket ============

  useEffect(() => {
    if (!user) return;

    const socket: Socket<ChatSocketEvents> = io('/?XTransformPort=3004', {
      transports: ['websocket'],
      query: { userId: user.id },
    });

    socket.on('connect', () => {
      console.log('[Chat] Connected:', socket.id);
    });

    socket.on('message:new', (message: ChatMessage) => {
      setMessages((prev) => {
        const exists = prev.find((m) => m.id === message.id);
        if (exists) return prev;
        return [...prev, message];
      });

      // Update room's last message
      setRooms((prev) =>
        prev.map((r) =>
          r.id === message.roomId
            ? { ...r, lastMessage: message.content, lastMessageAt: message.createdAt as unknown as string }
            : r
        )
      );

      // Scroll to bottom if near bottom
      const scrollArea = scrollAreaRef.current;
      if (scrollArea) {
        const isNearBottom = scrollArea.scrollHeight - scrollArea.scrollTop - scrollArea.clientHeight < 150;
        if (isNearBottom) {
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        } else {
          setIsNewMessages(true);
        }
      }
    });

    socket.on('user:typing', (payload: { roomId: string; userId: string }) => {
      if (selectedRoom && payload.roomId === selectedRoom.id && payload.userId !== user.id) {
        setTypingUsers((prev) => {
          if (prev.find((u) => u.userId === payload.userId)) return prev;
          const room = rooms.find((r) => r.id === payload.roomId);
          const participant = room?.participants.find((p) => p.id === payload.userId);
          return [...prev, { userId: payload.userId, userName: participant?.name || 'Someone' }];
        });
      }
    });

    socket.on('user:stop-typing', (payload: { roomId: string; userId: string }) => {
      setTypingUsers((prev) => prev.filter((u) => u.userId !== payload.userId));
    });

    socket.on('message:read:receipt', (payload: { roomId: string; messageId: string }) => {
      if (selectedRoom && payload.roomId === selectedRoom.id) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === payload.messageId ? { ...m, isRead: true, readAt: new Date() } : m
          )
        );
      }
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  // ============ Fetch Chat Rooms ============

  const fetchRooms = useCallback(async () => {
    try {
      setIsLoadingRooms(true);
      const res = await fetch('/api/chat/rooms');
      const data = await res.json();
      if (data.success) {
        setRooms(data.data);
      }
    } catch (error) {
      console.error('[Chat] Failed to fetch rooms:', error);
    } finally {
      setIsLoadingRooms(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // ============ Filter Rooms ============

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredRooms(rooms);
      return;
    }
    const q = searchQuery.toLowerCase();
    setFilteredRooms(
      rooms.filter((r) => {
        const participantName = r.participants?.[0]?.name?.toLowerCase() || '';
        const carTitle = r.car?.title?.toLowerCase() || '';
        const lastMsg = r.lastMessage?.toLowerCase() || '';
        return participantName.includes(q) || carTitle.includes(q) || lastMsg.includes(q);
      })
    );
  }, [searchQuery, rooms]);

  // ============ Select Room ============

  const selectRoom = useCallback(
    async (room: ChatRoomListItem) => {
      setSelectedRoom(room);
      setShowMobileSidebar(false);
      setIsLoadingMessages(true);
      setMessages([]);
      setIsNewMessages(false);

      // Join socket room
      if (socketRef.current) {
        socketRef.current.emit('room:join', room.id);
      }

      try {
        const res = await fetch(`/api/chat/rooms/${room.id}/messages`);
        const data = await res.json();
        if (data.success) {
          setMessages(data.data || []);
          setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'instant' }), 100);
        }
      } catch (error) {
        console.error('[Chat] Failed to fetch messages:', error);
      } finally {
        setIsLoadingMessages(false);
      }

      // Update unread count
      setRooms((prev) =>
        prev.map((r) => (r.id === room.id ? { ...r, unreadCount: 0 } : r))
      );
    },
    []
  );

  // ============ Auto-select room from params ============

  useEffect(() => {
    if (viewParams.roomId && rooms.length > 0) {
      const room = rooms.find((r) => r.id === viewParams.roomId);
      if (room) selectRoom(room);
    }
  }, [viewParams.roomId, rooms, selectRoom]);

  // ============ Send Message ============

  const sendMessage = useCallback(() => {
    if (!messageText.trim() || !selectedRoom || !socketRef.current || isSending) return;

    setIsSending(true);
    const content = messageText.trim();
    setMessageText('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Stop typing
    if (socketRef.current) {
      socketRef.current.emit('message:send', {
        roomId: selectedRoom.id,
        content,
        type: 'text',
      });
    }

    setIsSending(false);
  }, [messageText, selectedRoom, isSending]);

  // ============ Typing Handler ============

  const handleTyping = useCallback(() => {
    if (!selectedRoom || !socketRef.current) return;

    socketRef.current.emit('typing:start', { roomId: selectedRoom.id });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current) {
        socketRef.current.emit('typing:stop', { roomId: selectedRoom.id });
      }
    }, 2000);
  }, [selectedRoom]);

  // ============ Textarea Auto-resize ============

  const handleTextareaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setMessageText(e.target.value);
      const textarea = e.target;
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
      handleTyping();
    },
    [handleTyping]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  // ============ Scroll to bottom ============

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setIsNewMessages(false);
  }, []);

  // ============ Get other user info ============

  const otherUser = useMemo(() => {
    if (!selectedRoom || !selectedRoom.participants?.length) return null;
    return selectedRoom.participants[0];
  }, [selectedRoom]);

  // ============ Render ============

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden rounded-xl border bg-background shadow-sm">
      {/* ========== Left Sidebar ========== */}
      <AnimatePresence>
        {showMobileSidebar && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 380, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="flex h-full flex-col border-r bg-background md:block"
          >
            {/* Sidebar Header */}
            <div className="border-b p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Messages</h2>
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setShowMobileSidebar(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="relative mt-3">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Chat List */}
            <ScrollArea className="flex-1">
              {isLoadingRooms ? (
                <ChatListSkeleton />
              ) : filteredRooms.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <MessageSquare className="mb-2 h-8 w-8 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? 'No conversations found' : 'No conversations yet'}
                  </p>
                </div>
              ) : (
                <div className="space-y-0.5 p-2">
                  {filteredRooms.map((room) => {
                    const participant = room.participants?.[0];
                    const isActive = selectedRoom?.id === room.id;

                    return (
                      <motion.button
                        key={room.id}
                        onClick={() => selectRoom(room)}
                        whileHover={{ x: 2 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          'flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors',
                          isActive
                            ? 'bg-primary/10 text-foreground'
                            : 'hover:bg-muted/50 text-foreground'
                        )}
                      >
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <Avatar className="h-12 w-12">
                            <AvatarImage
                              src={participant?.avatar || undefined}
                              alt={participant?.name || 'User'}
                            />
                            <AvatarFallback className="bg-primary/10 text-sm font-medium">
                              {participant?.name?.charAt(0)?.toUpperCase() || '?'}
                            </AvatarFallback>
                          </Avatar>
                        </div>

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate text-sm font-semibold">
                              {participant?.name || 'Unknown User'}
                            </span>
                            <span className="shrink-0 text-[11px] text-muted-foreground">
                              {formatChatListTime(room.lastMessageAt)}
                            </span>
                          </div>

                          {/* Car info */}
                          {room.car && (
                            <div className="mt-0.5 flex items-center gap-1.5">
                              {room.car.images?.[0] && (
                                <img
                                  src={room.car.images[0].url}
                                  alt=""
                                  className="h-4 w-4 rounded-sm object-cover"
                                />
                              )}
                              <span className="truncate text-[11px] text-muted-foreground">
                                {room.car.brand} {room.car.model} {room.car.year}
                              </span>
                            </div>
                          )}

                          {/* Last message */}
                          <div className="mt-0.5 flex items-center justify-between gap-2">
                            <p className="truncate text-xs text-muted-foreground">
                              {room.lastMessage || 'No messages yet'}
                            </p>
                            {room.unreadCount > 0 && (
                              <Badge className="shrink-0 h-5 min-w-5 rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground flex items-center justify-center">
                                {room.unreadCount > 99 ? '99+' : room.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Muted indicator */}
                        {room.isMuted && (
                          <BellOff className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== Right Chat Area ========== */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {selectedRoom ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setShowMobileSidebar(true)}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>

                <Avatar className="h-10 w-10">
                  <AvatarImage src={otherUser?.avatar || undefined} alt={otherUser?.name || ''} />
                  <AvatarFallback className="text-sm">
                    {otherUser?.name?.charAt(0)?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <h3 className="text-sm font-semibold">{otherUser?.name || 'Unknown User'}</h3>
                  {selectedRoom.car && (
                    <button
                      onClick={() =>
                        useAppStore.getState().setView('detail', { carId: selectedRoom.car!.id })
                      }
                      className="text-xs text-primary hover:underline"
                    >
                      {selectedRoom.car.brand} {selectedRoom.car.model} {selectedRoom.car.year}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Phone className="h-4 w-4" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem>
                      <Archive className="mr-2 h-4 w-4" />
                      {selectedRoom.isArchived ? 'Unarchive' : 'Archive'}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      {selectedRoom.isMuted ? (
                        <>
                          <Bell className="mr-2 h-4 w-4" />
                          Unmute
                        </>
                      ) : (
                        <>
                          <BellOff className="mr-2 h-4 w-4" />
                          Mute
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive focus:text-destructive">
                      Clear History
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Messages Area */}
            <div ref={scrollAreaRef} className="flex-1 overflow-y-auto">
              {isLoadingMessages ? (
                <div className="space-y-4 p-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className={cn('flex gap-2', i % 2 === 0 && 'flex-row-reverse')}>
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className={cn('h-12 rounded-2xl', i % 2 === 0 ? 'w-48' : 'w-64')} />
                    </div>
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
                  <div className="rounded-full bg-muted p-4">
                    <MessageSquare className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No messages yet. Say hello!
                  </p>
                </div>
              ) : (
                <div className="pb-4">
                  {messages.map((msg, idx) => {
                    const dateSep = getDateSeparator(messages, idx);
                    const prevMsg = idx > 0 ? messages[idx - 1] : null;
                    const isOwn = msg.senderId === user?.id;
                    const isFirstInGroup =
                      !prevMsg ||
                      prevMsg.senderId !== msg.senderId ||
                      (msg.createdAt instanceof Date && prevMsg.createdAt instanceof Date
                        ? (msg.createdAt.getTime() - prevMsg.createdAt.getTime()) / 1000 > 180
                        : false);

                    return (
                      <div key={msg.id}>
                        {dateSep && (
                          <div className="flex items-center justify-center py-3">
                            <div className="rounded-full bg-muted px-3 py-1">
                              <span className="text-xs font-medium text-muted-foreground">{dateSep}</span>
                            </div>
                          </div>
                        )}
                        {msg.type === 'system' ? (
                          <div className="flex items-center justify-center px-4 py-2">
                            <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                              {msg.content}
                            </span>
                          </div>
                        ) : (
                          <MessageBubble
                            message={msg}
                            isOwn={isOwn}
                            showAvatar={isFirstInGroup}
                            showSenderName={isFirstInGroup}
                            senderName={msg.sender?.name || 'Unknown'}
                            senderAvatar={msg.sender?.avatar || null}
                            isFirstInGroup={isFirstInGroup}
                          />
                        )}
                      </div>
                    );
                  })}

                  {/* Typing indicator */}
                  <AnimatePresence>
                    {typingUsers.length > 0 && <TypingIndicator />}
                  </AnimatePresence>

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* New messages indicator */}
            <AnimatePresence>
              {isNewMessages && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-24 left-1/2 z-10 -translate-x-1/2"
                >
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={scrollToBottom}
                    className="rounded-full shadow-lg"
                  >
                    New messages
                    <ChevronLeft className="ml-1 h-3 w-3 rotate-90" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Area */}
            <div className="border-t bg-background p-3">
              <div className="flex items-end gap-2">
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground" disabled>
                    <ImagePlus className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground" disabled>
                    <Smile className="h-5 w-5" />
                  </Button>
                </div>

                <div className="relative flex-1">
                  <textarea
                    ref={textareaRef}
                    value={messageText}
                    onChange={handleTextareaChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    rows={1}
                    className="flex w-full resize-none rounded-xl border border-input bg-transparent px-4 py-2.5 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ maxHeight: '120px' }}
                  />
                </div>

                <Button
                  size="icon"
                  onClick={sendMessage}
                  disabled={!messageText.trim() || isSending}
                  className={cn(
                    'h-9 w-9 shrink-0 rounded-full transition-all',
                    messageText.trim()
                      ? 'bg-primary text-primary-foreground shadow-md hover:bg-primary/90'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <EmptyChatState />
        )}
      </div>
    </div>
  );
}
