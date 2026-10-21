'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreatePostCard } from '../components/CreatePostCard';
import { PostCard } from '../components/PostCard';
import { Post, User } from '../types';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Users, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function FeedPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<'global' | 'following'>('global');
  const [posts, setPosts] = useState<Post[]>([]);
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Requerimiento primario: Si no está autenticado, redirigir inmediatamente a /login
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Cargar publicaciones solo si el usuario está autenticado
  useEffect(() => {
    if (!isAuthenticated) return;

    setLoading(true);
    const fetchPosts = tab === 'global' ? api.getGlobalFeed() : api.getFollowingFeed();

    fetchPosts
      .then((res) => {
        if (res.success) {
          setPosts(res.data);
        }
      })
      .catch((err) => console.error('Error al cargar posts:', err))
      .finally(() => setLoading(false));
  }, [tab, isAuthenticated]);

  // Cargar usuarios sugeridos
  useEffect(() => {
    if (!isAuthenticated) return;

    api
      .getSuggestions()
      .then((res) => {
        if (res.success) {
          setSuggestions(res.data);
        }
      })
      .catch((err) => console.error('Error al cargar sugerencias:', err));
  }, [isAuthenticated]);

  const handlePostCreated = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handleFollowSuggestion = async (userId: string) => {
    try {
      await api.followUser(userId);
      setSuggestions((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      console.error(err);
    }
  };

  // Pantalla de carga mientras se valida la sesión en el inicio
  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 animate-pulse">
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-slate-800">Verificando sesión...</p>
          <p className="text-xs text-slate-400 mt-0.5">Redirigiendo al inicio de sesión seguro</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* Columna Principal: Feed */}
      <div className="lg:col-span-2 space-y-5">
        {/* Pestañas de Navegación del Feed */}
        <div className="flex items-center space-x-1 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/60 max-w-xs">
          <button
            onClick={() => setTab('global')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
              tab === 'global'
                ? 'bg-white text-indigo-600 shadow-sm shadow-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Para ti</span>
          </button>
          <button
            onClick={() => setTab('following')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
              tab === 'following'
                ? 'bg-white text-indigo-600 shadow-sm shadow-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Siguiendo</span>
          </button>
        </div>

        {/* Formulario de creación de post con selector de fotos */}
        <CreatePostCard onPostCreated={handlePostCreated} />

        {/* Lista de publicaciones */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm animate-pulse">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-slate-200" />
                  <div className="space-y-2">
                    <div className="w-28 h-3.5 bg-slate-200 rounded" />
                    <div className="w-20 h-2.5 bg-slate-100 rounded" />
                  </div>
                </div>
                <div className="w-full h-12 bg-slate-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-100 shadow-sm">
            <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-700">No hay publicaciones disponibles</h3>
            <p className="text-xs text-slate-400 mt-1">
              {tab === 'following'
                ? 'Aún no sigues a usuarios con publicaciones. Sigue a creadores en el panel lateral.'
                : '¡Sé el primero en compartir algo con la comunidad!'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onPostDeleted={handlePostDeleted} />
            ))}
          </div>
        )}
      </div>

      {/* Columna Lateral: Sugerencias y Enlaces */}
      <div className="hidden lg:block space-y-5">
        {/* Widget Sugerencias de usuarios */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 text-sm">A quién seguir</h3>
            <span className="text-[10px] uppercase font-bold text-slate-400">Recomendados</span>
          </div>

          {suggestions.length === 0 ? (
            <p className="text-xs text-slate-400 py-2">No hay sugerencias en este momento.</p>
          ) : (
            <div className="space-y-3.5">
              {suggestions.map((u) => (
                <div key={u.id} className="flex items-center justify-between">
                  <Link href={`/profile/${u.username}`} className="flex items-center space-x-2.5 group min-w-0">
                    <img
                      src={u.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=U'}
                      alt={u.fullName}
                      className="w-8 h-8 rounded-full object-cover border border-slate-100 flex-shrink-0 group-hover:ring-2 group-hover:ring-indigo-500/20"
                    />
                    <div className="truncate">
                      <p className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600 truncate">
                        {u.fullName}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">@{u.username}</p>
                    </div>
                  </Link>

                  <button
                    onClick={() => handleFollowSuggestion(u.id)}
                    className="flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex-shrink-0"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>Seguir</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tarjeta de Rúbrica y Swagger */}
        <div className="bg-gradient-to-tr from-indigo-900 to-slate-900 rounded-2xl p-5 text-white shadow-lg shadow-indigo-900/10">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 bg-indigo-800/40 px-2 py-0.5 rounded">
            Swagger / OpenAPI
          </span>
          <h4 className="text-sm font-semibold mt-2.5">Documentación Pública API</h4>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Explora y prueba en vivo los endpoints REST interactivos de la red social.
          </p>
          <a
            href="https://proyecto-final-red-social.onrender.com/api/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold transition-colors shadow"
          >
            Abrir /api/docs →
          </a>
        </div>
      </div>
    </div>
  );
}
