'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../lib/api';
import { User, Post } from '../types';
import { Search, X, Users, FileText, ArrowRight } from 'lucide-react';

export const SearchAutocomplete: React.FC = () => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ users: User[]; posts: Post[] }>({
    users: [],
    posts: [],
  });

  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounce search en vivo
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults({ users: [], posts: [] });
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      api
        .search(query.trim())
        .then((res) => {
          if (res.success) {
            setResults(res.data);
            setIsOpen(true);
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSelect = () => {
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div ref={wrapperRef} className="relative w-48 sm:w-60 md:w-72 lg:w-80">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700/60 focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400 border border-transparent rounded-full px-3.5 py-1.5 transition-all">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0 mr-2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (results.users.length > 0 || results.posts.length > 0) {
                setIsOpen(true);
              }
            }}
            placeholder="Buscar usuarios o posts..."
            className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setIsOpen(false);
              }}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </form>

      {/* Popover flotante de Autocompletado */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <div className="w-5 h-5 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mx-auto" />
              <p className="text-[11px] text-slate-400 mt-2">Buscando en tiempo real...</p>
            </div>
          ) : results.users.length === 0 && results.posts.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">
              No se encontraron coincidencias para &quot;{query}&quot;
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700/60 text-xs">
              {/* Sección Usuarios */}
              {results.users.length > 0 && (
                <div className="p-2">
                  <div className="flex items-center space-x-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <Users className="w-3 h-3 text-indigo-500" />
                    <span>Usuarios</span>
                  </div>
                  <div className="space-y-1 mt-1">
                    {results.users.map((u) => (
                      <Link
                        key={u.id}
                        href={`/profile/${u.username}`}
                        onClick={handleSelect}
                        className="flex items-center space-x-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                      >
                        <img
                          src={u.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=U'}
                          alt={u.fullName}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-600"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                            {u.fullName}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">@{u.username}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Sección Publicaciones */}
              {results.posts.length > 0 && (
                <div className="p-2">
                  <div className="flex items-center space-x-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <FileText className="w-3 h-3 text-violet-500" />
                    <span>Publicaciones</span>
                  </div>
                  <div className="space-y-1 mt-1">
                    {results.posts.slice(0, 4).map((p) => (
                      <Link
                        key={p.id}
                        href={`/profile/${p.user.username}#post-${p.id}`}
                        onClick={handleSelect}
                        className="block p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                      >
                        <p className="text-xs text-slate-700 dark:text-slate-200 line-clamp-2 leading-relaxed group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {p.content}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          por {p.user.fullName} (@{p.user.username})
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Pie de página con ver todo */}
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-700/30 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold text-[11px] transition-colors"
              >
                <span>Ver todos los resultados para &quot;{query}&quot;</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
