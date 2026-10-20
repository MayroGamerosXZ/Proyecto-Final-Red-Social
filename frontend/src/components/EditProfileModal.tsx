'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { Edit3, X, UploadCloud, Check, Link as LinkIcon } from 'lucide-react';

interface EditProfileModalProps {
  currentFullName: string;
  currentBio?: string | null;
  currentAvatarUrl?: string | null;
  onProfileUpdated: (updated: { fullName: string; bio?: string; avatarUrl?: string }) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  currentFullName,
  currentBio,
  currentAvatarUrl,
  onProfileUpdated,
}) => {
  const { refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [fullName, setFullName] = useState(currentFullName);
  const [bio, setBio] = useState(currentBio || '');
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl || null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Por favor selecciona un archivo de imagen válido');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('La foto no debe superar los 5 MB');
        return;
      }
      setError('');
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAvatarUrl(''); // Limpiar URL si seleccionó archivo local
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('El nombre completo no puede estar vacío');
      return;
    }

    try {
      setLoading(true);
      setError('');

      let finalAvatarUrl: string = avatarUrl.trim();

      // Si seleccionó una foto desde su máquina, subirla
      if (avatarFile) {
        const uploadRes = await api.uploadImage(avatarFile);
        if (uploadRes.success && uploadRes.url) {
          finalAvatarUrl = uploadRes.url;
        }
      }

      const res = await api.updateProfile({
        fullName: fullName.trim(),
        bio: bio.trim(),
        avatarUrl: finalAvatarUrl || undefined,
      });

      if (res.success) {
        await refreshUser();
        onProfileUpdated({
          fullName: fullName.trim(),
          bio: bio.trim(),
          avatarUrl: finalAvatarUrl,
        });
        setIsOpen(false);
      }
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 transition-colors shadow-sm"
      >
        <Edit3 className="w-3.5 h-3.5" />
        <span>Editar Perfil</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-800">Editar mi Perfil</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <p className="text-xs text-red-500 mb-3 bg-red-50 p-2.5 rounded-xl border border-red-100">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Sección de Selección de Foto */}
              <div className="flex items-center space-x-4 p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
                <img
                  src={previewUrl || avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=U'}
                  alt="Avatar preview"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-200 shadow-sm flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://api.dicebear.com/7.x/initials/svg?seed=U';
                  }}
                />

                <div className="flex-1 min-w-0">
                  <span className="block text-xs font-bold text-slate-800 mb-1">
                    Foto de Perfil
                  </span>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>{avatarFile ? 'Cambiar archivo' : 'Subir foto'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowUrlInput(!showUrlInput)}
                      className="flex items-center space-x-1 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
                      title="Ingresar URL de imagen"
                    >
                      <LinkIcon className="w-3 h-3" />
                      <span>URL</span>
                    </button>
                  </div>

                  {avatarFile && (
                    <span className="block text-[10px] text-indigo-600 font-medium mt-1 truncate">
                      Archivo: {avatarFile.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Opción alternativa de URL si el usuario prefiere pegar enlace */}
              {showUrlInput && (
                <div className="animate-in fade-in duration-100">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    O pega la URL directa de la imagen
                  </label>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => {
                      setAvatarUrl(e.target.value);
                      setPreviewUrl(e.target.value);
                      setAvatarFile(null);
                    }}
                    placeholder="https://..."
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Biografía
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Cuéntanos un poco sobre ti..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{loading ? 'Subiendo y guardando...' : 'Guardar Cambios'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
