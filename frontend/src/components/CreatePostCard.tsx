'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Post } from '../types';
import { Image as ImageIcon, Send, Sparkles, X } from 'lucide-react';

interface CreatePostCardProps {
  onPostCreated: (newPost: Post) => void;
}

export const CreatePostCard: React.FC<CreatePostCardProps> = ({ onPostCreated }) => {
  const { user, isAuthenticated } = useAuth();
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isAuthenticated || !user) {
    return (
      <div className="bg-gradient-to-r from-indigo-50 to-violet-50 rounded-2xl p-6 border border-indigo-100 text-center shadow-sm">
        <Sparkles className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
        <h3 className="text-base font-semibold text-slate-800">Únete a la conversación</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          Inicia sesión o regístrate para compartir tus publicaciones e interactuar en tiempo real.
        </p>
        <div className="flex items-center justify-center space-x-3">
          <a
            href="/login"
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 transition-colors shadow-sm"
          >
            Iniciar Sesión
          </a>
          <a
            href="/register"
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Crear Cuenta Gratis
          </a>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setIsSubmitting(true);
      setError('');
      const res = await api.createPost({
        content: content.trim(),
        imageUrl: imageUrl.trim() || undefined,
      });

      if (res.success) {
        setContent('');
        setImageUrl('');
        setShowImageInput(false);
        onPostCreated(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Error al publicar');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start space-x-3">
        <img
          src={user.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=U'}
          alt={user.fullName}
          className="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <form onSubmit={handleSubmit}>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`¿Qué estás pensando hoy, ${user.fullName.split(' ')[0]}?`}
              className="w-full text-sm text-slate-800 placeholder-slate-400 bg-slate-50 rounded-xl p-3 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
            />

            {/* Input de imagen condicional */}
            {showImageInput && (
              <div className="mt-2 relative">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Pega la URL de tu imagen (ej. https://...)"
                  className="w-full text-xs text-slate-800 placeholder-slate-400 bg-slate-50 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* Previsualización de la imagen */}
            {imageUrl && (
              <div className="mt-2 relative rounded-xl overflow-hidden border border-slate-200 max-h-52 bg-slate-100">
                <img
                  src={imageUrl}
                  alt="Vista previa"
                  className="w-full h-full object-cover"
                  onError={() => setError('La URL de la imagen no es válida')}
                />
              </div>
            )}

            {error && <p className="text-xs text-red-500 mt-2 font-medium">{error}</p>}

            <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowImageInput(!showImageInput)}
                className={`flex items-center space-x-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                  showImageInput || imageUrl
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>{imageUrl ? 'Imagen adjunta' : 'Agregar foto'}</span>
              </button>

              <button
                type="submit"
                disabled={!content.trim() || isSubmitting}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-500/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Publicando...' : 'Publicar'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
