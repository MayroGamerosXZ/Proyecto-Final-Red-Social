'use client';

import React from 'react';
import Link from 'next/link';
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
  activeTab?: 'global' | 'following';
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

  return (
    <aside className="space-y-4">
      {/* 1. Tarjeta Mini-Perfil y Accesos Directos */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/70 shadow-sm space-y-3">
        {user ? (
          <Link
            href={`/profile/${user.username}`}
            className="flex items-center space-x-3 p-2 -mx-2 rounded-xl hover:bg-slate-50 transition-colors group"
          >
            <img
              src={user.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=U'}
              alt={user.fullName}
              className="w-11 h-11 rounded-full object-cover border border-slate-200 group-hover:ring-2 group-hover:ring-indigo-500/25 transition-all"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                {user.fullName}
              </h4>
              <p className="text-xs text-slate-400 truncate">@{user.username}</p>
            </div>
          </Link>
        ) : (
          <div className="p-2 -mx-2 text-center">
            <p className="text-xs text-slate-400">Bienvenido a SocialPulse</p>
          </div>
        )}

        <hr className="border-slate-100" />

        {/* Lista de navegación vertical estilo Facebook */}
        <nav className="space-y-1">
          <button
            onClick={() => onSelectTab && onSelectTab('global')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors text-left ${
              activeTab === 'global'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Home className="w-4 h-4 text-indigo-600" />
            <span>Inicio (Feed)</span>
          </button>

          {user && (
            <Link
              href={`/profile/${user.username}`}
              className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
            >
              <User className="w-4 h-4 text-indigo-500" />
              <span>Mi Perfil</span>
            </Link>
          )}

          <button
            onClick={() => onSelectTab && onSelectTab('following')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors text-left ${
              activeTab === 'following'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 text-violet-500" />
            <span>Amigos / Siguiendo</span>
          </button>

          <div
            title="Próximamente: Guardados"
            className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 cursor-not-allowed hover:bg-slate-50"
          >
            <Bookmark className="w-4 h-4 text-slate-400" />
            <span className="flex-1">Guardados</span>
            <span className="text-[9px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded">Pronto</span>
          </div>

          <a
            href="https://proyecto-final-red-social.onrender.com/api/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Code2 className="w-4 h-4 text-emerald-600" />
              <span>API Playground</span>
            </div>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </nav>
      </div>

      {/* 2. Tarjeta Tendencias en Pulse */}
      <div id="tendencias" className="bg-white rounded-2xl p-4 border border-slate-200/70 shadow-sm">
        <div className="flex items-center space-x-2 mb-3">
          <TrendingUp className="w-4 h-4 text-indigo-600" />
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
            Tendencias en Pulse
          </h3>
        </div>

        <div className="space-y-2">
          {TRENDING_TAGS.map((item) => (
            <button
              key={item.tag}
              onClick={() => onSelectTag && onSelectTag(item.tag)}
              className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-indigo-50/70 transition-colors group"
            >
              <div>
                <p className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">
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
