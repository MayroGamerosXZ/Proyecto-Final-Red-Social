'use client';

import React, { useState } from 'react';
import { User, Post } from '../types';
import { useAuth } from '../context/AuthContext';
import { ProfileHeaderActions } from './ProfileHeaderActions';
import { PostCard } from './PostCard';
import { CreatePostCard } from './CreatePostCard';
import {
  Calendar,
  Globe,
  Briefcase,
  Sparkles,
  Image as ImageIcon,
  Users,
  Info,
  FileText,
} from 'lucide-react';

interface ProfileViewProps {
  initialProfile: User;
  initialPosts: Post[];
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  initialProfile,
  initialPosts,
}) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<User>(initialProfile);
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [activeTab, setActiveTab] = useState<'posts' | 'photos' | 'about'>('posts');

  const isOwnProfile = user?.id === profile.id || user?.username === profile.username;

  // Extraer todas las imágenes que el usuario ha subido en sus publicaciones
  const userPhotos = posts.filter((p) => Boolean(p.imageUrl));

  const handlePostCreated = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
    setProfile((prev) => ({
      ...prev,
      _count: {
        posts: (prev._count?.posts ?? prev._count?.posts ?? 0) + 1,
        followers: prev._count?.followers ?? 0,
        following: prev._count?.following ?? 0,
      },
    }));
  };

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    setProfile((prev) => ({
      ...prev,
      _count: {
        posts: Math.max(0, (prev._count?.posts ?? 1) - 1),
        followers: prev._count?.followers ?? 0,
        following: prev._count?.following ?? 0,
      },
    }));
  };

  const handlePostUpdated = (updatedPost: Post) => {
    setPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
  };

  const handleProfileUpdated = (updated: {
    fullName: string;
    bio?: string;
    avatarUrl?: string;
  }) => {
    setProfile((prev) => ({
      ...prev,
      fullName: updated.fullName,
      bio: updated.bio,
      avatarUrl: updated.avatarUrl || prev.avatarUrl,
    }));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ======================================================== */}
      {/* 1. Cabecera Principal con Banner de Portada (Estilo FB) */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl border border-slate-200/70 shadow-sm overflow-hidden">
        {/* Banner de Portada con Gradiente Vibrante y Patrón */}
        <div className="h-44 sm:h-60 w-full relative bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800 overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-violet-400/20 rounded-full blur-2xl" />
          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-white shadow-xs">
            SocialPulse Profile
          </div>
        </div>

        {/* Zona Inferior de la Cabecera con Avatar Superpuesto */}
        <div className="px-4 sm:px-8 pb-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 relative z-10 mb-4">
            {/* Avatar Superpuesto con Anillo Blanco */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end space-y-3 sm:space-y-0 sm:space-x-5 text-center sm:text-left">
              <img
                src={profile.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=U'}
                alt={profile.fullName}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-white shadow-xl bg-white flex-shrink-0 ring-1 ring-slate-200/60"
              />

              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {profile.fullName}
                </h1>
                <p className="text-xs sm:text-sm font-bold text-indigo-600">
                  @{profile.username}
                </p>

                {/* Métricas: Posts, Seguidores, Siguiendo */}
                <div className="flex items-center justify-center sm:justify-start space-x-3 text-xs text-slate-500 pt-1">
                  <span>
                    <strong className="text-slate-800 font-bold">
                      {profile._count?.posts ?? posts.length}
                    </strong>{' '}
                    Posts
                  </span>
                  <span>•</span>
                  <span>
                    <strong className="text-slate-800 font-bold">
                      {profile._count?.followers ?? 0}
                    </strong>{' '}
                    Seguidores
                  </span>
                  <span>•</span>
                  <span>
                    <strong className="text-slate-800 font-bold">
                      {profile._count?.following ?? 0}
                    </strong>{' '}
                    Siguiendo
                  </span>
                </div>
              </div>
            </div>

            {/* Botón de Acción en la Cabecera (Editar o Seguir) */}
            <div className="flex-shrink-0">
              <ProfileHeaderActions
                profileUser={profile}
                onProfileUpdated={handleProfileUpdated}
              />
            </div>
          </div>

          <hr className="border-slate-100 my-2" />

          {/* Barra de Sub-Navegación de Pestañas */}
          <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-1">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'posts'
                  ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Publicaciones</span>
            </button>

            <button
              onClick={() => setActiveTab('photos')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'photos'
                  ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Fotos ({userPhotos.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('about')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'about'
                  ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>Acerca de</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. Layout Inferior de 2 Columnas (Estilo Facebook)       */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Columna Izquierda: Detalles / Intro + Fotos Recientes (4 cols) */}
        <aside className="col-span-1 lg:col-span-4 space-y-5">
          {/* Tarjeta 1: Detalles / Intro */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Detalles</h3>

            {profile.bio ? (
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {profile.bio}
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic">Sin biografía configurada.</p>
            )}

            <hr className="border-slate-100" />

            <div className="space-y-3 text-xs text-slate-600 font-medium">
              <div className="flex items-center space-x-2.5">
                <Briefcase className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <span>Desarrollador Fullstack en SocialPulse</span>
              </div>

              <div className="flex items-center space-x-2.5">
                <Globe className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <a
                  href="https://proyecto-final-red-social.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline truncate"
                >
                  socialpulse.vercel.app
                </a>
              </div>

              <div className="flex items-center space-x-2.5">
                <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>
                  Miembro desde{' '}
                  {new Date(profile.createdAt).toLocaleDateString([], {
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Tarjeta 2: Fotos Recientes */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">Fotos Recientes</h3>
              <button
                onClick={() => setActiveTab('photos')}
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                Ver todas ({userPhotos.length})
              </button>
            </div>

            {userPhotos.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                No hay fotos compartidas aún.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {userPhotos.slice(0, 6).map((item) => (
                  <div
                    key={item.id}
                    className="aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200/60 group relative cursor-pointer"
                  >
                    <img
                      src={item.imageUrl || ''}
                      alt="Foto reciente"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Columna Derecha: Muro de Publicaciones o Vista de Pestaña (8 cols) */}
        <section className="col-span-1 lg:col-span-8 space-y-5">
          {activeTab === 'posts' && (
            <>
              {/* Creador de posts si es el perfil del usuario autenticado */}
              {isOwnProfile && <CreatePostCard onPostCreated={handlePostCreated} />}

              {/* Muro de Posts */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h3 className="font-bold text-slate-800 text-sm">
                    Publicaciones de {profile.fullName.split(' ')[0]} ({posts.length})
                  </h3>
                </div>

                {posts.length === 0 ? (
                  <div className="bg-white rounded-2xl p-10 text-center border border-slate-200/70 shadow-sm">
                    <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <h4 className="text-sm font-bold text-slate-700">Sin publicaciones</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Este usuario no ha publicado nada todavía.
                    </p>
                  </div>
                ) : (
                  posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onPostDeleted={handlePostDeleted}
                      onPostUpdated={handlePostUpdated}
                    />
                  ))
                )}
              </div>
            </>
          )}

          {activeTab === 'photos' && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-sm">
                Todas las Fotos ({userPhotos.length})
              </h3>
              {userPhotos.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  No hay fotografías para mostrar.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {userPhotos.map((item) => (
                    <div
                      key={item.id}
                      className="aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group relative"
                    >
                      <img
                        src={item.imageUrl || ''}
                        alt="Foto"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'about' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200/70 shadow-sm space-y-5">
              <h3 className="font-bold text-slate-800 text-sm">Información y Detalles</h3>
              <div className="space-y-4 text-xs sm:text-sm text-slate-700">
                <div>
                  <span className="block font-bold text-slate-400 uppercase text-[10px]">
                    Nombre Completo
                  </span>
                  <p className="mt-1 font-semibold text-slate-800">{profile.fullName}</p>
                </div>
                <div>
                  <span className="block font-bold text-slate-400 uppercase text-[10px]">
                    Usuario
                  </span>
                  <p className="mt-1 font-semibold text-indigo-600">@{profile.username}</p>
                </div>
                <div>
                  <span className="block font-bold text-slate-400 uppercase text-[10px]">
                    Biografía
                  </span>
                  <p className="mt-1 leading-relaxed">
                    {profile.bio || 'Sin biografía disponible'}
                  </p>
                </div>
                <div>
                  <span className="block font-bold text-slate-400 uppercase text-[10px]">
                    Fecha de Registro
                  </span>
                  <p className="mt-1">
                    {new Date(profile.createdAt).toLocaleDateString([], {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
