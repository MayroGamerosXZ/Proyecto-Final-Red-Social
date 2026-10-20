'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Post, Comment } from '../types';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { api } from '../lib/api';
import { Heart, MessageCircle, Trash2, Send } from 'lucide-react';

interface PostCardProps {
  post: Post;
  onPostDeleted?: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onPostDeleted }) => {
  const { user, isAuthenticated } = useAuth();
  const { socket } = useSocket();

  const [likesCount, setLikesCount] = useState(post._count.likes);
  const [isLiked, setIsLiked] = useState(!!post.isLiked);
  const [commentsCount, setCommentsCount] = useState(post._count.comments);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Escuchar eventos en vivo de Socket.io para este post en específico
  useEffect(() => {
    if (!socket) return;

    const handleLikeUpdated = (data: { postId: string; likesCount: number; isLiked: boolean; actorId: string }) => {
      if (data.postId === post.id) {
        setLikesCount(data.likesCount);
        if (user && data.actorId === user.id) {
          setIsLiked(data.isLiked);
        }
      }
    };

    const handleCommentCreated = (data: { postId: string; comment: Comment; commentsCount: number }) => {
      if (data.postId === post.id) {
        setCommentsCount(data.commentsCount);
        setComments((prev) => {
          if (prev.some((c) => c.id === data.comment.id)) return prev;
          return [...prev, data.comment];
        });
      }
    };

    socket.on('post:like_updated', handleLikeUpdated);
    socket.on('post:comment_created', handleCommentCreated);

    return () => {
      socket.off('post:like_updated', handleLikeUpdated);
      socket.off('post:comment_created', handleCommentCreated);
    };
  }, [socket, post.id, user]);

  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para dar like');
      return;
    }

    // Actualización optimista inmediata
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount((prev) => (newLikedState ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const res = await api.toggleLike(post.id);
      if (res.success) {
        setLikesCount(res.data.likesCount);
        setIsLiked(res.data.isLiked);
      }
    } catch (err) {
      // Revertir si falla
      setIsLiked(!newLikedState);
      setLikesCount((prev) => (!newLikedState ? prev + 1 : Math.max(0, prev - 1)));
      console.error(err);
    }
  };

  const handleToggleComments = async () => {
    if (!showComments && comments.length === 0) {
      try {
        setLoadingComments(true);
        const res = await api.getComments(post.id);
        if (res.success) {
          setComments(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingComments(false);
      }
    }
    setShowComments(!showComments);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !isAuthenticated) return;

    try {
      setSubmittingComment(true);
      const res = await api.addComment(post.id, newComment.trim());
      if (res.success) {
        setNewComment('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta publicación?')) return;
    try {
      const res = await api.deletePost(post.id);
      if (res.success && onPostDeleted) {
        onPostDeleted(post.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const isAuthor = user?.id === post.userId;

  return (
    <article className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm transition-all hover:border-slate-200">
      {/* Encabezado del Post */}
      <div className="flex items-center justify-between mb-3">
        <Link href={`/profile/${post.user.username}`} className="flex items-center space-x-3 group">
          <img
            src={post.user.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=U'}
            alt={post.user.fullName}
            className="w-10 h-10 rounded-full object-cover border border-slate-200 group-hover:ring-2 group-hover:ring-indigo-500/30 transition-all"
          />
          <div>
            <h4 className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
              {post.user.fullName}
            </h4>
            <div className="flex items-center space-x-1 text-xs text-slate-400">
              <span>@{post.user.username}</span>
              <span>•</span>
              <span>
                {new Date(post.createdAt).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        </Link>

        {isAuthor && (
          <button
            onClick={handleDelete}
            className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
            title="Eliminar publicación"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Contenido del Post */}
      <p className="text-sm text-slate-700 leading-relaxed mb-3 whitespace-pre-line">{post.content}</p>

      {/* Imagen adjunta */}
      {post.imageUrl && (
        <div className="mb-4 rounded-xl overflow-hidden border border-slate-100 max-h-96 bg-slate-50">
          <img src={post.imageUrl} alt="Publicación" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Barra de Acciones / Contadores */}
      <div className="flex items-center space-x-6 pt-2 border-t border-slate-50 text-slate-500 text-xs font-medium">
        {/* Botón Like */}
        <button
          onClick={handleToggleLike}
          className={`flex items-center space-x-1.5 py-1 px-2.5 rounded-lg transition-colors ${
            isLiked ? 'text-red-600 bg-red-50 font-semibold' : 'hover:text-red-500 hover:bg-slate-50'
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          <span>{likesCount}</span>
        </button>

        {/* Botón Comentarios */}
        <button
          onClick={handleToggleComments}
          className={`flex items-center space-x-1.5 py-1 px-2.5 rounded-lg transition-colors ${
            showComments ? 'text-indigo-600 bg-indigo-50 font-semibold' : 'hover:text-indigo-600 hover:bg-slate-50'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          <span>{commentsCount} comentarios</span>
        </button>
      </div>

      {/* Sección desplegable de comentarios */}
      {showComments && (
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
          {/* Formulario nuevo comentario */}
          {isAuthenticated ? (
            <form onSubmit={handleAddComment} className="flex items-center space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribe un comentario respetuoso..."
                className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!newComment.trim() || submittingComment}
                className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <p className="text-xs text-slate-400 italic">
              <Link href="/login" className="text-indigo-600 underline">
                Inicia sesión
              </Link>{' '}
              para unirte a los comentarios.
            </p>
          )}

          {/* Lista de comentarios */}
          {loadingComments ? (
            <p className="text-xs text-slate-400 py-2">Cargando comentarios...</p>
          ) : comments.length === 0 ? (
            <p className="text-xs text-slate-400 py-2">Aún no hay comentarios. ¡Sé el primero!</p>
          ) : (
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {comments.map((comment) => (
                <div key={comment.id} className="flex items-start space-x-2.5 bg-slate-50 p-2.5 rounded-xl">
                  <img
                    src={comment.user.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=U'}
                    alt={comment.user.username}
                    className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-semibold text-slate-800">{comment.user.fullName}</span>
                      <span className="text-[10px] text-slate-400">@{comment.user.username}</span>
                    </div>
                    <p className="text-xs text-slate-700 mt-0.5">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
};
