import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import {
  emitNotificationToUser,
  emitPostLikeUpdated,
  emitCommentCreated,
} from '../sockets/socket.server';

export const createPost = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { content, imageUrl } = req.body;

    const post = await prisma.post.create({
      data: {
        userId,
        content,
        imageUrl: imageUrl || null,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Publicación creada exitosamente',
      data: {
        ...post,
        isLiked: false,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getGlobalFeed = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUserId = (req as AuthenticatedRequest).user?.userId;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const skip = (page - 1) * limit;

    const posts = await prisma.post.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        likes: currentUserId
          ? {
              where: { userId: currentUserId },
              select: { id: true },
            }
          : false,
      },
    });

    const formattedPosts = posts.map((post) => {
      const isLiked = currentUserId ? (post.likes?.length ?? 0) > 0 : false;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { likes, ...rest } = post;
      return {
        ...rest,
        isLiked,
      };
    });

    return res.status(200).json({
      success: true,
      data: formattedPosts,
    });
  } catch (error) {
    next(error);
  }
};

export const getFollowingFeed = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const skip = (page - 1) * limit;

    // Obtener los IDs de usuarios que sigue
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followingIds = following.map((f) => f.followingId);
    // Incluir también los posts propios
    followingIds.push(userId);

    const posts = await prisma.post.findMany({
      where: {
        userId: { in: followingIds },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        likes: {
          where: { userId },
          select: { id: true },
        },
      },
    });

    const formattedPosts = posts.map((post) => {
      const isLiked = (post.likes?.length ?? 0) > 0;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { likes, ...rest } = post;
      return {
        ...rest,
        isLiked,
      };
    });

    return res.status(200).json({
      success: true,
      data: formattedPosts,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserPosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username } = req.params;
    const currentUserId = (req as AuthenticatedRequest).user?.userId;

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    const posts = await prisma.post.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        likes: currentUserId
          ? {
              where: { userId: currentUserId },
              select: { id: true },
            }
          : false,
      },
    });

    const formattedPosts = posts.map((post) => {
      const isLiked = currentUserId ? (post.likes?.length ?? 0) > 0 : false;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { likes, ...rest } = post;
      return {
        ...rest,
        isLiked,
      };
    });

    return res.status(200).json({
      success: true,
      data: formattedPosts,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Publicación no encontrada',
      });
    }

    if (post.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes autorización para eliminar esta publicación (solo el autor puede hacerlo)',
      });
    }

    await prisma.post.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: 'Publicación eliminada correctamente',
    });
  } catch (error) {
    next(error);
  }
};

export const toggleLike = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { id: postId } = req.params;

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Publicación no encontrada',
      });
    }

    // Comprobar si ya le dio like
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    let isLiked = false;

    if (existingLike) {
      // Quitar like
      await prisma.like.delete({
        where: { id: existingLike.id },
      });
      isLiked = false;
    } else {
      // Dar like
      await prisma.like.create({
        data: {
          userId,
          postId,
        },
      });
      isLiked = true;

      // Crear notificación para el dueño del post (si no es el mismo usuario)
      if (post.userId !== userId) {
        const notification = await prisma.notification.create({
          data: {
            recipientId: post.userId,
            actorId: userId,
            type: 'LIKE',
            postId,
          },
          include: {
            actor: {
              select: {
                id: true,
                username: true,
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        });

        // Emitir notificación en vivo por WebSocket al dueño del post
        emitNotificationToUser(post.userId, notification);
      }
    }

    // Contar total actual de likes
    const likesCount = await prisma.like.count({
      where: { postId },
    });

    // Emitir actualización de contador en vivo a todos los clientes suscritos al feed
    emitPostLikeUpdated(postId, likesCount, isLiked, userId);

    return res.status(200).json({
      success: true,
      data: {
        postId,
        likesCount,
        isLiked,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createComment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { id: postId } = req.params;
    const { content } = req.body;

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Publicación no encontrada',
      });
    }

    const comment = await prisma.comment.create({
      data: {
        userId,
        postId,
        content,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });

    const commentsCount = await prisma.comment.count({
      where: { postId },
    });

    // Crear notificación para el dueño del post si es otro usuario
    if (post.userId !== userId) {
      const notification = await prisma.notification.create({
        data: {
          recipientId: post.userId,
          actorId: userId,
          type: 'COMMENT',
          postId,
        },
        include: {
          actor: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatarUrl: true,
            },
          },
        },
      });

      emitNotificationToUser(post.userId, notification);
    }

    // Emitir evento en vivo de comentario creado
    emitCommentCreated(postId, comment, commentsCount);

    return res.status(201).json({
      success: true,
      message: 'Comentario agregado',
      data: comment,
    });
  } catch (error) {
    next(error);
  }
};

export const getComments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: postId } = req.params;

    const comments = await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (error) {
    next(error);
  }
};
