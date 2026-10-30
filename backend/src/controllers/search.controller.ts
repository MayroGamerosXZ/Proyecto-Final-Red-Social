import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export const globalSearch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUserId = (req as AuthenticatedRequest).user?.userId;
    const q = ((req.query.q as string) || '').trim();

    if (!q) {
      return res.status(200).json({
        success: true,
        data: {
          users: [],
          posts: [],
        },
      });
    }

    // Búsqueda de usuarios por username o fullName
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: q, mode: 'insensitive' } },
          { fullName: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 10,
      select: {
        id: true,
        username: true,
        fullName: true,
        avatarUrl: true,
        bio: true,
        _count: {
          select: {
            followers: true,
            posts: true,
          },
        },
      },
    });

    // Búsqueda de publicaciones por contenido o hashtag
    const posts = await prisma.post.findMany({
      where: {
        content: { contains: q, mode: 'insensitive' },
      },
      take: 15,
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
      data: {
        users,
        posts: formattedPosts,
      },
    });
  } catch (error) {
    next(error);
  }
};
