import { Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import {
  emitDirectMessage,
  emitMessagesRead,
  isUserOnline,
  getUserLastSeen,
  touchUserActivity,
} from '../sockets/socket.server';

/**
 * Obtener lista de conversaciones recientes del usuario autenticado
 */
export const getConversations = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const currentUserId = req.user!.userId;

    // Buscar todos los mensajes donde participa el usuario
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: currentUserId }, { receiverId: currentUserId }],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
            updatedAt: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
            updatedAt: true,
          },
        },
      },
    });

    // Agrupar por el otro usuario en la conversación
    const conversationsMap = new Map<string, any>();

    for (const msg of messages) {
      const otherUser = msg.senderId === currentUserId ? msg.receiver : msg.sender;
      if (!conversationsMap.has(otherUser.id)) {
        const memLastSeen = getUserLastSeen(otherUser.id);
        const msgTime = msg.senderId === otherUser.id ? msg.createdAt : null;
        const fallbackDate =
          msgTime && msgTime > otherUser.updatedAt ? msgTime : otherUser.updatedAt;

        conversationsMap.set(otherUser.id, {
          user: {
            id: otherUser.id,
            username: otherUser.username,
            fullName: otherUser.fullName,
            avatarUrl: otherUser.avatarUrl,
            isOnline: isUserOnline(otherUser.id),
            lastSeen: memLastSeen || fallbackDate.toISOString(),
          },
          lastMessage: {
            id: msg.id,
            content: msg.content,
            createdAt: msg.createdAt,
            senderId: msg.senderId,
            isRead: msg.isRead,
          },
          unreadCount:
            msg.receiverId === currentUserId && !msg.isRead ? 1 : 0,
        });
      } else {
        const existing = conversationsMap.get(otherUser.id);
        if (msg.receiverId === currentUserId && !msg.isRead) {
          existing.unreadCount += 1;
        }
        if (
          !getUserLastSeen(otherUser.id) &&
          msg.senderId === otherUser.id &&
          new Date(existing.user.lastSeen) < msg.createdAt
        ) {
          existing.user.lastSeen = msg.createdAt.toISOString();
        }
      }
    }

    const conversations = Array.from(conversationsMap.values());

    return res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener el historial de mensajes con un usuario específico
 */
export const getMessagesWithUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const currentUserId = req.user!.userId;
    const { userId: otherUserId } = req.params;

    // Verificar existencia del otro usuario
    const otherUser = await prisma.user.findUnique({
      where: { id: otherUserId },
      select: {
        id: true,
        username: true,
        fullName: true,
        avatarUrl: true,
        updatedAt: true,
      },
    });

    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // Marcar como leídos los mensajes recibidos de este usuario
    const updateResult = await prisma.message.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: currentUserId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    if (updateResult.count > 0) {
      emitMessagesRead(otherUserId, currentUserId);
    }

    // Obtener historial ordenado cronológicamente
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: currentUserId },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });

    const lastMsgFromOther = [...messages].reverse().find((m) => m.senderId === otherUserId);
    const memLastSeen = getUserLastSeen(otherUserId);
    const fallbackDate =
      lastMsgFromOther && lastMsgFromOther.createdAt > otherUser.updatedAt
        ? lastMsgFromOther.createdAt
        : otherUser.updatedAt;

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: otherUser.id,
          username: otherUser.username,
          fullName: otherUser.fullName,
          avatarUrl: otherUser.avatarUrl,
          isOnline: isUserOnline(otherUserId),
          lastSeen: memLastSeen || fallbackDate.toISOString(),
        },
        messages,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Enviar un mensaje directo a otro usuario
 */
export const sendMessage = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const senderId = req.user!.userId;
    const { userId: receiverId } = req.params;
    const { content } = req.body;

    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'El contenido del mensaje no puede estar vacío',
      });
    }

    if (content.trim().length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'El contenido del mensaje no puede exceder 2000 caracteres',
      });
    }

    if (senderId === receiverId) {
      return res.status(400).json({
        success: false,
        message: 'No puedes enviarte un mensaje a ti mismo',
      });
    }

    // Verificar que el receptor exista
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'El usuario destinatario no existe',
      });
    }

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        content: content.trim(),
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Actualizar última actividad del remitente y emitir mensaje en vivo por WebSocket
    touchUserActivity(senderId);
    emitDirectMessage(receiverId, message);

    return res.status(201).json({
      success: true,
      message: 'Mensaje enviado exitosamente',
      data: message,
    });
  } catch (error) {
    next(error);
  }
};
