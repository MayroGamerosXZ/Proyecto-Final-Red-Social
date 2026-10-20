export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  bio?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
  _count?: {
    posts: number;
    followers: number;
    following: number;
  };
  isFollowing?: boolean;
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl?: string | null;
  };
  _count: {
    likes: number;
    comments: number;
  };
  isLiked?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl?: string | null;
  };
}

export interface Notification {
  id: string;
  recipientId: string;
  actorId: string;
  type: 'LIKE' | 'COMMENT' | 'FOLLOW';
  postId?: string | null;
  isRead: boolean;
  createdAt: string;
  actor: {
    id: string;
    username: string;
    fullName: string;
    avatarUrl?: string | null;
  };
  post?: {
    id: string;
    content: string;
    imageUrl?: string | null;
  } | null;
}
