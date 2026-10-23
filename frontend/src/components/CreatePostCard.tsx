'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Post } from '../types';
import {
  Send,
  Sparkles,
  X,
  UploadCloud,
  Link as LinkIcon,
  Image as ImageIcon,
  Smile,
} from 'lucide-react';

interface CreatePostCardProps {
  onPostCreated: (newPost: Post) => void;
  id?: string;
}

export const CreatePostCard: React.FC<CreatePostCardProps> = ({
  onPostCreated,
  id = 'composer-card',
}) => {
  const { user, isAuthenticated } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isAuthenticated || !user) {
    return (
      <div className="bg-gradient-to-r from-indigo-50 to-violet-50 rounded-2xl p-6 border border-indigo-100 text-center shadow-sm">
        <Sparkles className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-slate-800">Únete a la conversación</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          Inicia sesión o regístrate para compartir tus publicaciones e interactuar en tiempo real.
        </p>
        <div className="flex items-center justify-center space-x-3">
          <a
            href="/login"
            className="px-4 py-2 text-xs font-bold rounded-xl bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 transition-colors shadow-sm"
          >
            Iniciar Sesión
          </a>
          <a
            href="/register"
            className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Crear Cuenta Gratis
          </a>
        </div>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP)');
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        setError('La imagen no debe superar los 15 MB');
        return;
      }
      setError('');
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setImageUrl('');
      setIsExpanded(true);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setImageUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !selectedFile && !imageUrl) return;

    try {
      setIsSubmitting(true);
      setError('');

      let finalImageUrl: string | undefined = imageUrl.trim() || undefined;

      // Si seleccionó una imagen local desde su equipo, subirla primero
      if (selectedFile) {
        const uploadRes = await api.uploadImage(selectedFile);
        if (uploadRes.success && uploadRes.url) {
          finalImageUrl = uploadRes.url;
        }
      }

      const res = await api.createPost({
        content: content.trim(),
        imageUrl: finalImageUrl,
      });

      if (res.success) {
        setContent('');
        handleRemoveImage();
        setShowUrlInput(false);
        setIsExpanded(false);
        onPostCreated(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Error al publicar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const firstName = user.fullName.split(' ')[0];

  return (
    <div
      id={id}
      className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/70 shadow-sm transition-all hover:border-slate-300"
    >
      <form onSubmit={handleSubmit}>
        <div className="flex items-start space-x-3">
          <img
            src={user.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=U'}
            alt={user.fullName}
            className="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0"
          />

          <div className="flex-1 min-w-0">
            {/* Si no está expandido, se muestra como una barra de 1 línea tipo Facebook */}
            {!isExpanded ? (
              <div
                onClick={() => {
                  setIsExpanded(true);
                  setTimeout(() => textareaRef.current?.focus(), 50);
                }}
                className="w-full bg-slate-100 hover:bg-slate-200/70 text-slate-500 rounded-full px-4 py-2.5 text-xs sm:text-sm cursor-pointer transition-colors"
              >
                ¿Qué estás pensando hoy, {firstName}?
              </div>
            ) : (
              <div className="space-y-3 animate-in fade-in duration-150">
                <textarea
                  ref={textareaRef}
                  rows={3}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={`¿Qué estás pensando hoy, ${firstName}?`}
                  className="w-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-slate-50 rounded-xl p-3 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
                />

                {/* Input file oculto */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {/* Miniatura de Previsualización de Imagen con Botón ✕ */}
                {previewUrl && (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 max-h-64 bg-slate-900/5 group">
                    <img
                      src={previewUrl}
                      alt="Vista previa local"
                      className="w-full h-full object-cover max-h-64"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-slate-900/70 hover:bg-slate-900 text-white p-1.5 rounded-full transition-colors shadow"
                      title="Quitar foto"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-slate-900/70 text-white text-[10px] px-2 py-0.5 rounded-md backdrop-blur-sm">
                      {selectedFile?.name || 'Imagen lista'}
                    </div>
                  </div>
                )}

                {/* Campo Vía URL */}
                {showUrlInput && !previewUrl && (
                  <div className="relative animate-in fade-in">
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Pega una URL directa de imagen (https://...)"
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

                {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Barra de Acciones inferior (Estilo Facebook) */}
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100">
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Botón 1: Subir Foto Local */}
            <button
              type="button"
              onClick={() => {
                setIsExpanded(true);
                fileInputRef.current?.click();
              }}
              className={`flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                selectedFile
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>{selectedFile ? 'Cambiar foto' : 'Subir foto'}</span>
            </button>

            {/* Botón 2: Vía URL */}
            <button
              type="button"
              onClick={() => {
                setIsExpanded(true);
                setShowUrlInput(!showUrlInput);
              }}
              className="flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-700 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
              title="Pegar enlace de imagen"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Vía URL</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {isExpanded && (
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  setContent('');
                  handleRemoveImage();
                }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl"
              >
                Cancelar
              </button>
            )}

            <button
              type="submit"
              disabled={(!content.trim() && !selectedFile && !imageUrl) || isSubmitting}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-500/20 active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Publicando...' : 'Publicar'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
