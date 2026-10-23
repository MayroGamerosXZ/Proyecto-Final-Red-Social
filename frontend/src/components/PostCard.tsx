'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Post, Comment } from '../types';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { api } from '../lib/api';
import {
  Heart,
  MessageCircle,
  Share2,
  Trash2,
  Send,
  Edit2,
  Check,
  X,
  UploadCloud,
  Smile,
  Copy,
} from 'lucide-react';

interface PostCardProps {
  post: Post;
  onPostDeleted?: (postId: string) => void;
  onPostUpdated?: (updatedPost: Post) => void;
  onHashtagClick?: (tag: string) => void;
}

const AVAILABLE_EMOJIS = ['❤️', '🔥', '😂', '👏', '🚀', '😍'];

// Helper para resaltar hashtags (#tag) en texto
function renderFormattedContent(text: string, onHashtagClick?: (tag: string) => void) {
  const parts = text.split(/(#[a-zA-Z0-9_]+)/g);
  return parts.map((part, index) => {
    if (part.startsWith('#')) {
      return (
        <span
          key={index}
          onClick={(e) => {
            e.stopPropagation();
            if (onHashtagClick) onHashtagClick(part);
          }}
          className="text-indigo-600 font-semibold hover:underline cursor-pointer"
        >
          {part}
        </span>
      );
    }
    return part;
  });
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onPostDeleted,
  onPostUpdated,
  onHashtagClick,
}) => {
  const { user, isAuthenticated } = useAuth();
  const { socket } = useSocket();

  // Estados de contenido
  const [content, setContent] = useState(post.content);
  const [imageUrl, setImageUrl] = useState(post.imageUrl || '');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editImageUrl, setEditImageUrl] = useState(post.imageUrl || '');
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState<string | null>(post.imageUrl || null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Estados de Reacciones Multi-Emoji
  const [likesCount, setLikesCount] = useState(post._count?.likes ?? 0);
  const [userReaction, setUserReaction] = useState<string | null>(post.userReaction || null);
  const [topReactions, setTopReactions] = useState<string[]>(
    post.topReactions || (post.isLiked ? ['❤️'] : [])
  );
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Estados de Comentarios
  const [commentsCount, setCommentsCount] = useState(post._count?.comments ?? 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Estado Toast de Enlace Copiado (Compartir)
  const [showCopiedToast, setShowCopiedToast] = useState(false);

  // Escuchar eventos en vivo de Socket.io
  useEffect(() => {
    if (!socket) return;

    const handleLikeUpdated = (data: {
      postId: string;
      likesCount: number;
      isLiked: boolean;
      userReaction?: string | null;
      topReactions?: string[];
    }) => {
      if (data.postId === post.id) {
        setLikesCount(data.likesCount);
        if (data.topReactions) setTopReactions(data.topReactions);
      }
    };

    const handleCommentCreated = (data: {
      postId: string;
      comment: Comment;
      commentsCount: number;
    }) => {
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
  }, [socket, post.id]);

  // Cerrar emoji picker al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Manejador de Reacción
  const handleSelectReaction = async (emoji: string) => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para reaccionar');
      return;
    }

    setShowEmojiPicker(false);

    // Optimistic UI
    const isSameEmoji = userReaction === emoji;
    const nextReaction = isSameEmoji ? null : emoji;
    const nextCount = isSameEmoji
      ? Math.max(0, likesCount - 1)
      : userReaction
      ? likesCount
      : likesCount + 1;

    setUserReaction(nextReaction);
    setLikesCount(nextCount);

    try {
      const res = await api.toggleLike(post.id, emoji);
      if (res.success) {
        setLikesCount(res.data.likesCount);
        setUserReaction(res.data.userReaction);
        if (res.data.topReactions) setTopReactions(res.data.topReactions);
      }
    } catch (err) {
      console.error(err);
      setUserReaction(userReaction);
      setLikesCount(likesCount);
    }
  };

  // Manejo de Edición
  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditImageFile(file);
      setEditPreviewUrl(URL.createObjectURL(file));
      setEditImageUrl('');
    }
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) return;

    try {
      setIsSavingEdit(true);
      let finalImageUrl = editImageUrl;

      if (editImageFile) {
        const uploadRes = await api.uploadImage(editImageFile);
        if (uploadRes.success) {
          finalImageUrl = uploadRes.url;
        }
      }

      const res = await api.updatePost(post.id, {
        content: editContent.trim(),
        imageUrl: editPreviewUrl ? finalImageUrl : '',
      });

      if (res.success) {
        setContent(res.data.content);
        setImageUrl(res.data.imageUrl || '');
        setIsEditing(false);
        setEditImageFile(null);
        if (onPostUpdated) onPostUpdated(res.data);
      }
    } catch (err: any) {
      alert(err.message || 'Error al guardar los cambios de la publicación');
    } finally {
      setIsSavingEdit(false);
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

  // Manejo de Comentarios
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

  // Manejo de Compartir (Copia link directo al portapapeles)
  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/profile/${post.user.username}#post-${post.id}`;
      await navigator.clipboard.writeText(shareUrl);
      setShowCopiedToast(true);
      setTimeout(() => setShowCopiedToast(false), 2500);
    } catch (err) {
      console.error('Error al copiar al portapapeles:', err);
    }
  };

  const isAuthor = user?.id === post.userId;

  return (
    <article
      id={`post-${post.id}`}
      className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/70 shadow-sm transition-all hover:border-slate-300 relative"
    >
      {/* Toast flotante de confirmación de Compartir */}
      {showCopiedToast && (
        <div className="absolute top-3 right-3 z-30 bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-lg flex items-center space-x-1.5 animate-in fade-in slide-in-from-top-1">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>¡Enlace copiado al portapapeles!</span>
        </div>
      )}

      {/* 1. Header del Post (Estilo Facebook) */}
      <div className="flex items-center justify-between mb-3">
        <Link
          href={`/profile/${post.user.username}`}
          className="flex items-center space-x-3 group min-w-0"
        >
          <img
            src={post.user.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=U'}
            alt={post.user.fullName}
            className="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0 group-hover:ring-2 group-hover:ring-indigo-500/25 transition-all"
          />
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-slate-900 group-hover:underline truncate">
              {post.user.fullName}
            </h4>
            <div className="flex items-center space-x-1.5 text-xs text-slate-400">
              <span className="truncate">@{post.user.username}</span>
              <span>•</span>
              <span className="flex-shrink-0">
                {new Date(post.createdAt).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        </Link>

        {isAuthor && (
          <div className="flex items-center space-x-1">
            <button
              onClick={() => {
                setIsEditing(!isEditing);
                setEditContent(content);
                setEditPreviewUrl(imageUrl || null);
              }}
              className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
              title="Editar publicación"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
              title="Eliminar publicación"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 2. Cuerpo del Post (Modo Edición vs Modo Vista) */}
      {isEditing ? (
        <div className="space-y-3 p-3 bg-slate-50 rounded-2xl border border-indigo-100 mb-3 animate-in fade-in duration-150">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
            Editando Publicación
          </span>
          <textarea
            rows={3}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full text-sm text-slate-800 bg-white rounded-xl p-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />

          <input
            type="file"
            ref={editFileInputRef}
            onChange={handleEditFileChange}
            accept="image/*"
            className="hidden"
          />

          {editPreviewUrl && (
            <div className="relative rounded-xl overflow-hidden border border-slate-200 max-h-48 bg-slate-900/5">
              <img
                src={editPreviewUrl}
                alt="Vista previa"
                className="w-full h-full object-cover max-h-48"
              />
              <button
                type="button"
                onClick={() => {
                  setEditPreviewUrl(null);
                  setEditImageFile(null);
                  setEditImageUrl('');
                }}
                className="absolute top-2 right-2 bg-slate-900/70 hover:bg-slate-900 text-white p-1 rounded-full transition-colors"
                title="Quitar foto"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => editFileInputRef.current?.click()}
              className="flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{editPreviewUrl ? 'Cambiar foto' : 'Añadir foto'}</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isSavingEdit || !editContent.trim()}
                className="flex items-center space-x-1 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isSavingEdit ? 'Guardando...' : 'Guardar'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm sm:text-[15px] text-slate-800 leading-relaxed mb-3 whitespace-pre-line">
            {renderFormattedContent(content, onHashtagClick)}
          </p>

          {/* 3. Contenedor Multimedia controlado (max-h-[520px]) */}
          {imageUrl && (
            <div className="mb-3 rounded-xl overflow-hidden border border-slate-100 max-h-[520px] bg-slate-900/5">
              <img
                src={imageUrl}
                alt="Publicación"
                className="w-full h-auto max-h-[520px] object-cover"
                loading="lazy"
              />
            </div>
          )}
        </>
      )}

      {/* 4. Footer de Interacción (Estilo Facebook) */}

      {/* 4.1. Fila de Métricas (Reacciones y Contador de Comentarios) */}
      <div className="flex items-center justify-between py-1.5 px-1 text-xs text-slate-500">
        <div className="flex items-center space-x-1.5">
          {topReactions.length > 0 && (
            <div className="flex items-center -space-x-1">
              {topReactions.map((em, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-xs shadow-xs border border-white"
                >
                  {em}
                </span>
              ))}
            </div>
          )}
          <span className="font-medium">
            {likesCount > 0 ? `${likesCount} Me gusta` : 'Sé el primero en reaccionar'}
          </span>
        </div>

        <button
          onClick={handleToggleComments}
          className="hover:underline font-medium text-slate-500"
        >
          {commentsCount} comentarios
        </button>
      </div>

      {/* Divisor sutil */}
      <hr className="border-slate-100 my-1" />

      {/* 4.2. Tres Botones de Acción Equitativos (grid-cols-3) */}
      <div className="grid grid-cols-3 gap-1 py-0.5">
        {/* Botón 1: Me gusta con Popover Multi-Emoji */}
        <div className="relative" ref={emojiPickerRef}>
          {showEmojiPicker && (
            <div className="absolute bottom-full left-0 mb-2 flex items-center space-x-1.5 bg-white rounded-full px-3 py-1.5 shadow-2xl border border-slate-200 z-30 animate-in zoom-in-95 duration-100">
              {AVAILABLE_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleSelectReaction(emoji)}
                  className="text-xl hover:scale-130 transition-transform p-1 rounded-full hover:bg-slate-50"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              if (!userReaction) {
                handleSelectReaction('❤️');
              } else {
                handleSelectReaction(userReaction); // Alternar quitar
              }
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              setShowEmojiPicker(true);
            }}
            className={`w-full flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-bold transition-all ${
              userReaction
                ? 'text-indigo-600 bg-indigo-50/70 scale-102'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span className="text-sm">{userReaction || '🤍'}</span>
            <span>{userReaction ? 'Reaccionado' : 'Me gusta'}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowEmojiPicker(!showEmojiPicker);
              }}
              className="text-slate-400 hover:text-slate-700 p-0.5"
              title="Más reacciones"
            >
              <Smile className="w-3.5 h-3.5" />
            </button>
          </button>
        </div>

        {/* Botón 2: Comentar */}
        <button
          onClick={handleToggleComments}
          className={`flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-bold transition-colors ${
            showComments
              ? 'text-indigo-600 bg-indigo-50/70'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <MessageCircle className="w-4 h-4 text-slate-500" />
          <span>Comentar</span>
        </button>

        {/* Botón 3: Compartir (Copia link directo) */}
        <button
          onClick={handleShare}
          className="flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          title="Copiar enlace de esta publicación"
        >
          <Share2 className="w-4 h-4 text-slate-500" />
          <span>Compartir</span>
        </button>
      </div>

      {/* 4.3. Sección Desplegable de Comentarios */}
      {showComments && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
          {isAuthenticated ? (
            <form onSubmit={handleAddComment} className="flex items-center space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribe un comentario..."
                className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!newComment.trim() || submittingComment}
                className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <p className="text-xs text-slate-400 italic">
              <Link href="/login" className="text-indigo-600 underline font-semibold">
                Inicia sesión
              </Link>{' '}
              para comentar en esta publicación.
            </p>
          )}

          {loadingComments ? (
            <p className="text-xs text-slate-400 py-2">Cargando comentarios...</p>
          ) : comments.length === 0 ? (
            <p className="text-xs text-slate-400 py-2 text-center">
              Aún no hay comentarios. ¡Sé el primero!
            </p>
          ) : (
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex items-start space-x-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100"
                >
                  <img
                    src={comment.user.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=U'}
                    alt={comment.user.username}
                    className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-xs font-bold text-slate-800">
                        {comment.user.fullName}
                      </span>
                      <span className="text-[10px] text-slate-400">@{comment.user.username}</span>
                    </div>
                    <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
                      {comment.content}
                    </p>
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
