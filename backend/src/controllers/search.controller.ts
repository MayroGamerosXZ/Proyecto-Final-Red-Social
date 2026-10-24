import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';

export const globalSearch = async (req: Request, res: Response, next: NextFunction) => {
  try {
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
      },
    });

    const formattedPosts = posts.map((post) => {
      const topReactions = Array.from(new Set(post.likes.map((l) => l.emoji))).slice(0, 3);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { likes, ...rest } = post;
      return {
        ...rest,
        topReactions,
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
