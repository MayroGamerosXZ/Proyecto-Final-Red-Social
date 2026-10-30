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
        userReaction: null,
        topReactions: [],
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { content, imageUrl } = req.body;

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
        message: 'No tienes autorización para editar esta publicación (solo el autor puede hacerlo)',
      });
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        content: content !== undefined ? content : post.content,
        imageUrl: imageUrl !== undefined ? (imageUrl || null) : post.imageUrl,
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
        likes: {
          select: {
            emoji: true,
            userId: true,
          },
        },
      },
    });

    const userLike = updatedPost.likes.find((l) => l.userId === userId);
    const topReactions = Array.from(new Set(updatedPost.likes.map((l) => l.emoji)));
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { likes, ...rest } = updatedPost;

    return res.status(200).json({
      success: true,
      message: 'Publicación actualizada exitosamente',
      data: {
        ...rest,
        isLiked: !!userLike,
        userReaction: userLike ? userLike.emoji : null,
        topReactions,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getGlobalFeed = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUserId = (req as AuthenticatedRequest).user?.userId;
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
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
        likes: {
          select: {
            emoji: true,
            userId: true,
          },
        },
        bookmarks: currentUserId
          ? {
              where: { userId: currentUserId },
              select: { id: true },
            }
          : false,
      },
    });

    const formattedPosts = posts.map((post) => {
      const userLike = currentUserId ? post.likes.find((l) => l.userId === currentUserId) : null;
      const topReactions = Array.from(new Set(post.likes.map((l) => l.emoji))).slice(0, 3);
      const isBookmarked = Boolean(currentUserId && (post as any).bookmarks?.length > 0);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { likes, bookmarks, ...rest } = post as any;
      return {
        ...rest,
        isLiked: !!userLike,
        userReaction: userLike ? userLike.emoji : null,
        topReactions,
        isBookmarked,
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
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
    const skip = (page - 1) * limit;

    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followingIds = following.map((f) => f.followingId);
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
          select: {
            emoji: true,
            userId: true,
          },
        },
        bookmarks: {
          where: { userId },
          select: { id: true },
        },
      },
    });

    const formattedPosts = posts.map((post) => {
      const userLike = post.likes.find((l) => l.userId === userId);
      const topReactions = Array.from(new Set(post.likes.map((l) => l.emoji))).slice(0, 3);
      const isBookmarked = Boolean((post as any).bookmarks?.length > 0);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { likes, bookmarks, ...rest } = post as any;
      return {
        ...rest,
        isLiked: !!userLike,
        userReaction: userLike ? userLike.emoji : null,
        topReactions,
        isBookmarked,
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
        likes: {
          select: {
            emoji: true,
            userId: true,
          },
        },
        bookmarks: currentUserId
          ? {
              where: { userId: currentUserId },
              select: { id: true },
            }
          : false,
      },
    });

    const formattedPosts = posts.map((post) => {
      const userLike = currentUserId ? post.likes.find((l) => l.userId === currentUserId) : null;
      const topReactions = Array.from(new Set(post.likes.map((l) => l.emoji))).slice(0, 3);
      const isBookmarked = Boolean(currentUserId && (post as any).bookmarks?.length > 0);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { likes, bookmarks, ...rest } = post as any;
      return {
        ...rest,
        isLiked: !!userLike,
        userReaction: userLike ? userLike.emoji : null,
        topReactions,
        isBookmarked,
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

    let chosenEmoji = '❤️';
    if (req.body?.emoji !== undefined && req.body?.emoji !== null) {
      if (typeof req.body.emoji !== 'string' || req.body.emoji.trim().length === 0 || req.body.emoji.length > 16) {
        return res.status(400).json({
          success: false,
          message: 'El emoji debe ser una cadena de texto no vacía de máximo 16 caracteres',
        });
      }
      chosenEmoji = req.body.emoji.trim();
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Publicación no encontrada',
      });
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    let isLiked = false;
    let userReaction: string | null = null;

    if (existingLike) {
      if (existingLike.emoji === chosenEmoji) {
        // Mismo emoji: Quitar reacción (toggle off)
        await prisma.like.delete({
          where: { id: existingLike.id },
        });
        isLiked = false;
        userReaction = null;
      } else {
        // Distinto emoji: Actualizar al nuevo emoji
        await prisma.like.update({
          where: { id: existingLike.id },
          data: { emoji: chosenEmoji },
        });
        isLiked = true;
        userReaction = chosenEmoji;
      }
    } else {
      // Nueva reacción con el emoji seleccionado
      await prisma.like.create({
        data: {
          userId,
          postId,
          emoji: chosenEmoji,
        },
      });
      isLiked = true;
      userReaction = chosenEmoji;

      // Notificar al autor si es otro usuario
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

        emitNotificationToUser(post.userId, notification);
      }
    }

    // Calcular estadísticas de reacciones
    const allLikes = await prisma.like.findMany({
      where: { postId },
      select: { emoji: true },
    });

    const likesCount = allLikes.length;
    const topReactions = Array.from(new Set(allLikes.map((l) => l.emoji))).slice(0, 3);

    // Emitir por WebSocket
    emitPostLikeUpdated(postId, likesCount, isLiked, userId);

    return res.status(200).json({
      success: true,
      data: {
        postId,
        likesCount,
        isLiked,
        userReaction,
        topReactions,
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

export const toggleBookmark = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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

    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existingBookmark) {
      await prisma.bookmark.delete({
        where: { id: existingBookmark.id },
      });

      return res.status(200).json({
        success: true,
        message: 'Publicación eliminada de tus guardados',
        data: {
          postId,
          isBookmarked: false,
        },
      });
    } else {
      await prisma.bookmark.create({
        data: {
          userId,
          postId,
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Publicación guardada exitosamente en tus marcadores',
        data: {
          postId,
          isBookmarked: true,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getSavedPosts = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        post: {
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
              select: {
                emoji: true,
                userId: true,
              },
            },
          },
        },
      },
    });

    const formattedPosts = bookmarks.map((b) => {
      const post = b.post;
      const userLike = post.likes.find((l) => l.userId === userId);
      const topReactions = Array.from(new Set(post.likes.map((l) => l.emoji))).slice(0, 3);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { likes, ...rest } = post;
      return {
        ...rest,
        isLiked: !!userLike,
        userReaction: userLike ? userLike.emoji : null,
        topReactions,
        isBookmarked: true,
        bookmarkedAt: b.createdAt,
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
