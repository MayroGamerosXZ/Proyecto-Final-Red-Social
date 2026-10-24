'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Post, User } from '../../types';
import { LeftSidebar } from '../../components/LeftSidebar';
import { RightSidebar } from '../../components/RightSidebar';
import { PostCard } from '../../components/PostCard';
import { Bookmark, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function SavedPostsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    setLoading(true);
    api
      .getSavedPosts()
      .then((res) => {
        if (res.success) {
          setPosts(res.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));

    api
      .getSuggestions()
      .then((res) => {
        if (res.success) setSuggestions(res.data);
      })
      .catch((err) => console.error(err));
  }, [isAuthenticated]);

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handlePostUpdated = (updated: Post) => {
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Columna Izquierda: Menú */}
      <aside className="hidden lg:block lg:col-span-3">
        <div className="sticky top-20 space-y-4">
          <LeftSidebar activeTab={'saved' as any} />
        </div>
      </aside>

      {/* Columna Central: Publicaciones Guardadas */}
      <section className="col-span-1 lg:col-span-6 space-y-5">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200/70 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Bookmark className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Publicaciones Guardadas
              </h2>
              <p className="text-[11px] text-slate-400">
                Tu colección personal de marcadores y lecturas pendientes
              </p>
            </div>
          </div>
          <span className="text-xs font-bold bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-full text-slate-600 dark:text-slate-300">
            {posts.length} {posts.length === 1 ? 'guardado' : 'guardados'}
          </span>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200/70 dark:border-slate-700 shadow-sm animate-pulse space-y-4"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div className="space-y-2 flex-1">
                    <div className="w-32 h-3.5 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="w-20 h-2.5 bg-slate-100 dark:bg-slate-600 rounded" />
                  </div>
                </div>
                <div className="w-full h-12 bg-slate-100 dark:bg-slate-700 rounded-xl" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-10 text-center border border-slate-200/70 dark:border-slate-700 shadow-sm">
            <Bookmark className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
              No tienes publicaciones guardadas todavía
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Haz clic en el icono de marcador en cualquier publicación de tu feed para guardarla y
              verla aquí cuando quieras.
            </p>
            <Link
              href="/"
              className="inline-flex items-center space-x-1.5 mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explorar el Feed</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onPostDeleted={handlePostDeleted}
                onPostUpdated={handlePostUpdated}
              />
            ))}
          </div>
        )}
      </section>

      {/* Columna Derecha: Widgets */}
      <aside className="hidden md:block lg:col-span-3">
        <div className="sticky top-20 space-y-5">
          <RightSidebar suggestions={suggestions} />
        </div>
      </aside>
    </div>
  );
}
