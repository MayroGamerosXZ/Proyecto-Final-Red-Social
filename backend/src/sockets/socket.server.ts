import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../config/db';
import { AuthUserPayload } from '../middlewares/authMiddleware';

let io: SocketIOServer | null = null;

// Registro en memoria de sesiones activas y última conexión por usuario
const onlineUsers = new Map<string, Set<string>>();
const lastSeenMap = new Map<string, string>();

export const isUserOnline = (userId: string): boolean => {
  const sockets = onlineUsers.get(userId);
  return Boolean(sockets && sockets.size > 0);
};

export const getUserLastSeen = (userId: string): string | null => {
  return lastSeenMap.get(userId) || null;
};

export const touchUserActivity = (userId: string): void => {
  const now = new Date();
  lastSeenMap.set(userId, now.toISOString());
};

export interface AuthenticatedSocket extends Socket {
  user?: AuthUserPayload;
}

export const initSocketServer = (httpServer: HttpServer): SocketIOServer => {
  const configuredOrigins = env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean);
  const defaultAllowedOrigins = [
    'http://localhost:3000',
    'http://localhost:10000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:10000',
    'https://proyecto-final-red-social.onrender.com',
  ];
  const allAllowedOrigins = Array.from(new Set([...configuredOrigins, ...defaultAllowedOrigins]));

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: (requestOrigin, callback) => {
        if (!requestOrigin || allAllowedOrigins.includes('*') || allAllowedOrigins.includes(requestOrigin)) {
          return callback(null, true);
        }
        if (/^https:\/\/.*\.vercel\.app$/.test(requestOrigin) || /^https:\/\/.*\.onrender\.com$/.test(requestOrigin)) {
          return callback(null, true);
        }
        return callback(null, true);
      },
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Middleware de autenticación de Socket.io
  io.use((socket: AuthenticatedSocket, next) => {
    const token =
      socket.handshake.auth?.token ||
      (socket.handshake.headers['authorization'] as string)?.replace('Bearer ', '');

    if (!token) {
      // Permitir conexión anónima solo para eventos públicos del feed
      return next();
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as AuthUserPayload;
      socket.user = decoded;
      next();
    } catch (err) {
      console.warn(`[Socket.io] Token inválido en handshake: ${(err as Error).message}`);
      return next();
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.user?.userId;
    console.log(`[Socket.io] Cliente conectado: ${socket.id} (Usuario: ${userId || 'Anónimo'})`);

    // Si está autenticado, unirlo a su sala privada personal y registrar presencia en línea
    if (userId) {
      const userRoom = `user_${userId}`;
      socket.join(userRoom);
      console.log(`[Socket.io] Usuario ${userId} unido a sala: ${userRoom}`);

      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
      }
      onlineUsers.get(userId)!.add(socket.id);

      const now = new Date();
      const nowIso = now.toISOString();
      lastSeenMap.set(userId, nowIso);
      prisma.user.update({ where: { id: userId }, data: { updatedAt: now } }).catch(() => {});

      io?.emit('user:presence_changed', {
        userId,
        isOnline: true,
        lastSeen: nowIso,
      });
    }

    // Unirse a sala global del feed para recibir actualizaciones de posts
    socket.join('feed_global');

    socket.on('disconnect', (reason) => {
      console.log(`[Socket.io] Cliente desconectado: ${socket.id} (${reason})`);
      if (userId && onlineUsers.has(userId)) {
        const userSockets = onlineUsers.get(userId)!;
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          const now = new Date();
          const nowIso = now.toISOString();
          lastSeenMap.set(userId, nowIso);
          prisma.user.update({ where: { id: userId }, data: { updatedAt: now } }).catch(() => {});

          io?.emit('user:presence_changed', {
            userId,
            isOnline: false,
            lastSeen: nowIso,
          });
        }
      }
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.io no ha sido inicializado aún.');
  }
  return io;
};

// Funciones utilitarias para emitir eventos
export const emitNotificationToUser = (recipientId: string, notification: unknown) => {
  if (!io) return;
  io.to(`user_${recipientId}`).emit('notification:new', notification);
};

export const emitPostLikeUpdated = (
  postId: string,
  likesCount: number,
  isLiked: boolean,
  actorId: string,
  topReactions?: string[],
  reactionCounts?: Record<string, number>
) => {
  if (!io) return;
  io.to('feed_global').emit('post:like_updated', {
    postId,
    likesCount,
    isLiked,
    actorId,
    topReactions,
    reactionCounts,
  });
};

export const emitCommentCreated = (postId: string, comment: unknown, commentsCount: number) => {
  if (!io) return;
  io.to('feed_global').emit('post:comment_created', {
    postId,
    comment,
    commentsCount,
  });
};

export const emitDirectMessage = (receiverId: string, message: unknown) => {
  if (!io) return;
  io.to(`user_${receiverId}`).emit('chat:message_received', message);
};

export const emitMessagesRead = (senderId: string, readerId: string) => {
  if (!io) return;
  io.to(`user_${senderId}`).emit('chat:messages_read', { readerId });
};
