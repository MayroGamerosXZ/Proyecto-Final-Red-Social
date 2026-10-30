'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CreatePostCard } from '../components/CreatePostCard';
import { PostCard } from '../components/PostCard';
import { LeftSidebar } from '../components/LeftSidebar';
import { RightSidebar } from '../components/RightSidebar';
import { Post, User } from '../types';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Users, X, Search } from 'lucide-react';

function FeedContent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const tabParam = searchParams.get('tab') || '';

  const [tab, setTab] = useState<'global' | 'following'>(tabParam === 'following' ? 'following' : 'global');
  const [posts, setPosts] = useState<Post[]>([]);
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string>(queryParam);

  // Requerimiento primario: Si no está autenticado, redirigir inmediatamente a /login
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Si cambia la pestaña por parámetro de URL, sincronizar el feed
  useEffect(() => {
    if (tabParam === 'following' || tabParam === 'global') {
      setTab(tabParam as 'global' | 'following');
    }
  }, [tabParam]);

  // Si cambia el parámetro de búsqueda en la URL, actualizar el filtro
  useEffect(() => {
    setSelectedTag(queryParam);
  }, [queryParam]);

  // Cargar publicaciones según la pestaña seleccionada
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

  const handlePostUpdated = (updatedPost: Post) => {
    setPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
  };

  const handleFollowSuggestion = async (userId: string) => {
    try {
      setSuggestions((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleTagClick = (tag: string) => {
    setSelectedTag(tag);
    router.push(`/?q=${encodeURIComponent(tag)}`);
  };

  const clearFilter = () => {
    setSelectedTag('');
    router.push('/');
  };

  // Filtrado de posts si hay un término de búsqueda o tag activo
  const displayedPosts = selectedTag.trim()
    ? posts.filter(
        (p) =>
          p.content.toLowerCase().includes(selectedTag.toLowerCase()) ||
          p.user.username.toLowerCase().includes(selectedTag.toLowerCase()) ||
          p.user.fullName.toLowerCase().includes(selectedTag.toLowerCase())
      )
    : posts;

  // Pantalla de carga mientras se valida la sesión en el inicio
  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 animate-pulse">
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-slate-800">Verificando sesión...</p>
          <p className="text-xs text-slate-400 mt-0.5">
            Redirigiendo al inicio de sesión seguro de SocialPulse
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* ======================================================== */}
      {/* 1. Columna Izquierda (3 cols en Desktop): Menú y Tendencias */}
      {/* ======================================================== */}
      <aside className="hidden lg:block lg:col-span-3">
        <div className="sticky top-20 space-y-4">
          <LeftSidebar
            onSelectTag={handleTagClick}
            onSelectTab={(selected) => {
              setTab(selected);
              clearFilter();
              if (selected === 'following') {
                router.push('/?tab=following');
              } else {
                router.push('/');
              }
            }}
            activeTab={tab}
          />
        </div>
      </aside>

      {/* ======================================================== */}
      {/* 2. Columna Central (6 cols en Desktop): Feed y Publicaciones */}
      {/* ======================================================== */}
      <section className="col-span-1 lg:col-span-6 space-y-5">
        {/* Selector de Pestañas: Para ti / Siguiendo (Estilo Píldora Facebook) */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-2xl p-1.5 border border-slate-200/70 dark:border-slate-700 shadow-sm">
          <div className="flex items-center space-x-1 w-full sm:w-auto">
            <button
              onClick={() => {
                setTab('global');
                clearFilter();
              }}
              className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 py-2 px-4 rounded-xl text-xs font-bold transition-all ${
                tab === 'global' && !selectedTag
                  ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Para ti</span>
            </button>
            <button
              onClick={() => {
                setTab('following');
                clearFilter();
              }}
              className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 py-2 px-4 rounded-xl text-xs font-bold transition-all ${
                tab === 'following'
                  ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Siguiendo</span>
            </button>
          </div>

          <span className="hidden sm:inline-block text-[11px] font-semibold text-slate-400 dark:text-slate-500 pr-3">
            {posts.length} {posts.length === 1 ? 'publicación' : 'publicaciones'}
          </span>
        </div>

        {/* Banner de Filtro Activo (si buscó una etiqueta o usuario) */}
        {selectedTag && (
          <div className="flex items-center justify-between bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl px-4 py-2.5 text-xs text-indigo-900 dark:text-indigo-200">
            <div className="flex items-center space-x-2">
              <Search className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>
                Filtrando resultados por: <strong className="font-bold">{selectedTag}</strong>
              </span>
            </div>
            <button
              onClick={clearFilter}
              className="flex items-center space-x-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-bold bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800 shadow-xs transition-colors"
            >
              <X className="w-3 h-3" />
              <span>Limpiar</span>
            </button>
          </div>
        )}

        {/* Creador de Publicaciones Expandible / Colapsable */}
        <CreatePostCard onPostCreated={handlePostCreated} />

        {/* Lista de Publicaciones con Skeletons */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-sm animate-pulse space-y-4"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200" />
                  <div className="space-y-2 flex-1">
                    <div className="w-32 h-3.5 bg-slate-200 rounded" />
                    <div className="w-20 h-2.5 bg-slate-100 rounded" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-3 bg-slate-100 rounded" />
                  <div className="w-4/5 h-3 bg-slate-100 rounded" />
                </div>
                <div className="w-full h-48 bg-slate-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : displayedPosts.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-200/70 shadow-sm">
            <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">No se encontraron publicaciones</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {selectedTag
                ? `No hay publicaciones que coincidan con "${selectedTag}". Prueba con otra búsqueda o limpia el filtro.`
                : tab === 'following'
                ? 'Aún no sigues a usuarios con publicaciones. Explora los perfiles sugeridos a la derecha.'
                : '¡Sé el primero en compartir algo con la comunidad SocialPulse!'}
            </p>
            {selectedTag && (
              <button
                onClick={clearFilter}
                className="mt-4 px-3.5 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors"
              >
                Ver todas las publicaciones
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {displayedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onPostDeleted={handlePostDeleted}
                onPostUpdated={handlePostUpdated}
                onHashtagClick={handleTagClick}
              />
            ))}
          </div>
        )}
      </section>

      {/* ======================================================== */}
      {/* 3. Columna Derecha (3 cols en Desktop): Widgets y Swagger */}
      {/* ======================================================== */}
      <aside className="hidden md:block lg:col-span-3">
        <div className="sticky top-20 space-y-5">
          <RightSidebar
            suggestions={suggestions}
            onFollowSuggestion={handleFollowSuggestion}
          />
        </div>
      </aside>
    </div>
  );
}

export default function FeedPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
        </div>
      }
    >
      <FeedContent />
    </Suspense>
  );
}
