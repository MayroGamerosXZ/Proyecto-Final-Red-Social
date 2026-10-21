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
  Trash2,
  Send,
  Edit2,
  Check,
  X,
  UploadCloud,
  Smile,
} from 'lucide-react';

interface PostCardProps {
  post: Post;
  onPostDeleted?: (postId: string) => void;
  onPostUpdated?: (updatedPost: Post) => void;
}

const AVAILABLE_EMOJIS = ['❤️', '🔥', '😂', '👏', '🚀', '😍'];

export const PostCard: React.FC<PostCardProps> = ({ post, onPostDeleted, onPostUpdated }) => {
  const { user, isAuthenticated } = useAuth();
  const { socket } = useSocket();

  // Estados de contenido (soporta edición)
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
  const [likesCount, setLikesCount] = useState(post._count.likes);
  const [userReaction, setUserReaction] = useState<string | null>(post.userReaction || null);
  const [topReactions, setTopReactions] = useState<string[]>(post.topReactions || (post.isLiked ? ['❤️'] : []));
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Estados de Comentarios
  const [commentsCount, setCommentsCount] = useState(post._count.comments);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Escuchar eventos en vivo de Socket.io
  useEffect(() => {
    if (!socket) return;

    const handleLikeUpdated = (data: {
      postId: string;
      likesCount: number;
      isLiked: boolean;
      actorId: string;
    }) => {
      if (data.postId === post.id) {
        setLikesCount(data.likesCount);
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

  // Manejador de Reacción con Emoji
  const handleSelectReaction = async (emoji: string) => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para reaccionar');
      return;
    }

    setShowEmojiPicker(false);

    // Optimistic UI
    const isSameEmoji = userReaction === emoji;
    const nextReaction = isSameEmoji ? null : emoji;
    const nextCount = isSameEmoji ? Math.max(0, likesCount - 1) : userReaction ? likesCount : likesCount + 1;

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
      // Revertir
      setUserReaction(userReaction);
      setLikesCount(likesCount);
    }
  };

  // Manejo de Edición de Publicación
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

      // Si seleccionó una nueva foto local, subirla primero
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

      {/* Modo Edición vs Modo Vista */}
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
              <img src={editPreviewUrl} alt="Vista previa" className="w-full h-full object-cover max-h-48" />
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
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isSavingEdit || !editContent.trim()}
                className="flex items-center space-x-1 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isSavingEdit ? 'Guardando...' : 'Guardar'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-700 leading-relaxed mb-3 whitespace-pre-line">{content}</p>

          {imageUrl && (
            <div className="mb-4 rounded-xl overflow-hidden border border-slate-100 max-h-96 bg-slate-50">
              <img src={imageUrl} alt="Publicación" className="w-full h-full object-cover" />
            </div>
          )}
        </>
      )}

      {/* Barra de Reacciones con Multi-Emojis */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-slate-500 text-xs font-medium">
        <div className="flex items-center space-x-4">
          {/* Botón de Reacciones con Selector Flotante */}
          <div className="relative" ref={emojiPickerRef}>
            {/* Popover con los 6 emojis */}
            {showEmojiPicker && (
              <div className="absolute bottom-full left-0 mb-2 flex items-center space-x-1.5 bg-white rounded-full px-3 py-1.5 shadow-2xl border border-slate-200 z-30 animate-in zoom-in-95 duration-100">
                {AVAILABLE_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleSelectReaction(emoji)}
                    className="text-lg hover:scale-125 transition-transform p-1 rounded-full hover:bg-slate-50"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => {
                if (!userReaction) {
                  handleSelectReaction('❤️');
                } else {
                  setShowEmojiPicker(!showEmojiPicker);
                }
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                setShowEmojiPicker(true);
              }}
              className={`flex items-center space-x-1.5 py-1 px-2.5 rounded-xl transition-all ${
                userReaction
                  ? 'text-indigo-600 bg-indigo-50 font-bold border border-indigo-100'
                  : 'hover:text-red-500 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <span>{userReaction || '🤍'}</span>
              <span>{likesCount}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEmojiPicker(!showEmojiPicker);
                }}
                className="text-slate-400 hover:text-slate-600 ml-0.5"
                title="Elegir reacción"
              >
                <Smile className="w-3.5 h-3.5" />
              </button>
            </button>
          </div>

          {/* Botón Comentarios */}
          <button
            onClick={handleToggleComments}
            className={`flex items-center space-x-1.5 py-1 px-2.5 rounded-xl transition-colors ${
              showComments ? 'text-indigo-600 bg-indigo-50 font-semibold' : 'hover:text-indigo-600 hover:bg-slate-50'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>{commentsCount} comentarios</span>
          </button>
        </div>

        {/* Resumen de Emojis Reaccionados */}
        {topReactions.length > 0 && (
          <div className="flex items-center -space-x-1 text-sm bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
            {topReactions.map((em, idx) => (
              <span key={idx}>{em}</span>
            ))}
          </div>
        )}
      </div>

      {/* Sección desplegable de comentarios */}
      {showComments && (
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
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
