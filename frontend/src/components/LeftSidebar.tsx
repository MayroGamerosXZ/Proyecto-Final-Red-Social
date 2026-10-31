'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  User,
  Users,
  Bookmark,
  Code2,
  TrendingUp,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface LeftSidebarProps {
  onSelectTag?: (tag: string) => void;
  onSelectTab?: (tab: 'global' | 'following') => void;
  activeTab?: 'global' | 'following' | 'saved';
}

const TRENDING_TAGS = [
  { tag: '#Anime2026', count: '12.4k posts' },
  { tag: '#FullstackDev', count: '8.1k posts' },
  { tag: '#ChampionsLeague', count: '19.5k posts' },
  { tag: '#React19', count: '6.2k posts' },
  { tag: '#PostgreSQL', count: '4.8k posts' },
];

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  onSelectTag,
  onSelectTab,
  activeTab = 'global',
}) => {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleTabClick = (targetTab: 'global' | 'following') => {
    if (pathname === '/') {
      if (onSelectTab) onSelectTab(targetTab);
    } else {
      router.push(targetTab === 'following' ? '/?tab=following' : '/');
    }
  };

  const handleTagClick = (tag: string) => {
    if (pathname === '/' && onSelectTag) {
      onSelectTag(tag);
    } else {
      router.push(`/?q=${encodeURIComponent(tag)}`);
    }
  };

  return (
    <aside className="space-y-4">
      {/* 1. Tarjeta Mini-Perfil y Accesos Directos */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200/70 dark:border-slate-700 shadow-sm space-y-3">
        {user ? (
          <Link
            href={`/profile/${user.username}`}
            className="flex items-center space-x-3 p-2 -mx-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
          >
            <img
              src={user.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=U'}
              alt={user.fullName}
              className="w-11 h-11 rounded-full object-cover border border-slate-200 dark:border-slate-700 group-hover:ring-2 group-hover:ring-indigo-500/25 transition-all"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                {user.fullName}
              </h4>
              <p className="text-xs text-slate-400 truncate">@{user.username}</p>
            </div>
          </Link>
        ) : (
          <div className="flex items-center space-x-3 p-2 -mx-2">
            <img
              src="/logo-icon.png"
              alt="Visitante Invitado"
              className="w-10 h-10 rounded-xl object-cover border border-indigo-500/30 shadow-xs"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                Visitante Invitado
              </h4>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                Modo Solo Lectura
              </p>
            </div>
          </div>
        )}

        <hr className="border-slate-100 dark:border-slate-700" />

        {/* Lista de navegación vertical estilo Facebook */}
        <nav className="space-y-1">
          <button
            onClick={() => handleTabClick('global')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors text-left ${
              activeTab === 'global' && pathname === '/'
                ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Home className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Inicio (Feed)</span>
          </button>

          {user ? (
            <>
              <Link
                href={`/profile/${user.username}`}
                className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <User className="w-4 h-4 text-indigo-500" />
                <span>Mi Perfil</span>
              </Link>

              <button
                onClick={() => handleTabClick('following')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors text-left ${
                  activeTab === 'following' && pathname === '/'
                    ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Users className="w-4 h-4 text-violet-500" />
                <span>Amigos / Siguiendo</span>
              </button>

              {/* Acceso a Guardados (Bookmarks) ACTIVO */}
              <Link
                href="/saved"
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  activeTab === 'saved'
                    ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
              >
                <Bookmark className={`w-4 h-4 text-amber-500 ${activeTab === 'saved' ? 'fill-current' : ''}`} />
                <span className="flex-1">Guardados</span>
                <span className="text-[9px] bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold px-1.5 py-0.5 rounded">
                  Nuevo
                </span>
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
            >
              <User className="w-4 h-4 text-indigo-500" />
              <span>Iniciar Sesión / Registrarse</span>
            </Link>
          )}

          <a
            href="https://proyecto-final-red-social.onrender.com/api/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Code2 className="w-4 h-4 text-emerald-500" />
              <span>API Playground</span>
            </div>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </nav>
      </div>

      {/* 2. Tarjeta Tendencias en Pulse */}
      <div id="tendencias" className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200/70 dark:border-slate-700 shadow-sm">
        <div className="flex items-center space-x-2 mb-3">
          <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-xs uppercase tracking-wider">
            Tendencias en Pulse
          </h3>
        </div>

        <div className="space-y-2">
          {TRENDING_TAGS.map((item) => (
            <button
              key={item.tag}
              onClick={() => handleTagClick(item.tag)}
              className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-indigo-50/70 dark:hover:bg-slate-700/50 transition-colors group"
            >
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {item.tag}
                </p>
                <p className="text-[10px] text-slate-400">{item.count}</p>
              </div>
              <Sparkles className="w-3 h-3 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};
