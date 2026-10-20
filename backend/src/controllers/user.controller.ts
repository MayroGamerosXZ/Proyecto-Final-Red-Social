import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { emitNotificationToUser } from '../sockets/socket.server';

export const getProfileByUsername = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username } = req.params;
    const currentUserId = (req as AuthenticatedRequest).user?.userId;

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        fullName: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
        followers: currentUserId
          ? {
              where: { followerId: currentUserId },
              select: { id: true },
            }
          : false,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `El perfil '@${username}' no existe`,
      });
    }

    const isFollowing = currentUserId ? (user.followers?.length ?? 0) > 0 : false;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { followers, ...profileData } = user;

    return res.status(200).json({
      success: true,
      data: {
        ...profileData,
        isFollowing,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { fullName, bio, avatarUrl } = req.body;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(fullName && { fullName }),
        ...(bio !== undefined && { bio }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        bio: true,
        avatarUrl: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const followUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const followerId = req.user!.userId;
    const { id: followingId } = req.params;

    if (followerId === followingId) {
      return res.status(400).json({
        success: false,
        message: 'No puedes seguirte a ti mismo',
      });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: followingId },
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // Verificar si ya lo sigue
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (existingFollow) {
      return res.status(200).json({
        success: true,
        message: 'Ya sigues a este usuario',
      });
    }

    // Crear relación de seguimiento
    const follow = await prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
    });

    // Crear notificación y emitir por WebSocket
    const notification = await prisma.notification.create({
      data: {
        recipientId: followingId,
        actorId: followerId,
        type: 'FOLLOW',
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

    emitNotificationToUser(followingId, notification);

    return res.status(201).json({
      success: true,
      message: `Ahora sigues a @${targetUser.username}`,
      data: follow,
    });
  } catch (error) {
    next(error);
  }
};

export const unfollowUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const followerId = req.user!.userId;
    const { id: followingId } = req.params;

    await prisma.follow.deleteMany({
      where: {
        followerId,
        followingId,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Has dejado de seguir a este usuario',
    });
  } catch (error) {
    next(error);
  }
};

export const getSuggestedUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const currentUserId = req.user?.userId;

    const users = await prisma.user.findMany({
      where: {
        id: { not: currentUserId },
      },
      take: 5,
      select: {
        id: true,
        username: true,
        fullName: true,
        avatarUrl: true,
        bio: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};
