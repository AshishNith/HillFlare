import type { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { env } from '../config/env';

let io: Server | null = null;

// Track online users: userId -> Set<socketId>
const onlineUsers = new Map<string, Set<string>>();

export const initSockets = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: env.corsOrigin === '*' ? true : env.corsOrigin.split(',').map((o) => o.trim()),
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    let userId: string | null = null;

    // Client registers their userId after connecting
    socket.on('user:register', (id: string) => {
      userId = id;
      socket.join(`user:${id}`); // Personal room for user-level events

      if (!onlineUsers.has(id)) {
        onlineUsers.set(id, new Set());
      }
      onlineUsers.get(id)!.add(socket.id);

      // Broadcast to everyone that this user is online
      io?.emit('user:online', { userId: id });

      // Send the full online list to the newly connected client
      socket.emit('user:onlineList', { userIds: Array.from(onlineUsers.keys()) });
    });

    socket.on('chat:join', (chatId: string) => {
      socket.join(chatId);
    });

    socket.on('chat:leave', (chatId: string) => {
      socket.leave(chatId);
    });

    socket.on('chat:typing', (payload: { chatId: string; userId: string }) => {
      socket.to(payload.chatId).emit('chat:typing', payload);
    });

    socket.on('chat:stopTyping', (payload: { chatId: string; userId: string }) => {
      socket.to(payload.chatId).emit('chat:stopTyping', payload);
    });

    socket.on('disconnect', () => {
      if (userId) {
        const sockets = onlineUsers.get(userId);
        if (sockets) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            onlineUsers.delete(userId);
            io?.emit('user:offline', { userId });
          }
        }
      }
    });
  });

  return io;
};

export const getIo = (): Server | null => io;

export const isUserOnline = (userId: string): boolean => onlineUsers.has(userId);

export const getOnlineUserIds = (): string[] => Array.from(onlineUsers.keys());

/**
 * Check if a given user has a socket currently joined to a specific room (e.g. a chatId).
 */
export const isUserInRoom = async (userId: string, room: string): Promise<boolean> => {
  if (!io) return false;
  const sockets = onlineUsers.get(userId);
  if (!sockets || sockets.size === 0) return false;

  const roomSockets = await io.in(room).fetchSockets();
  const roomSocketIds = new Set(roomSockets.map((s) => s.id));

  for (const sid of sockets) {
    if (roomSocketIds.has(sid)) return true;
  }
  return false;
};
