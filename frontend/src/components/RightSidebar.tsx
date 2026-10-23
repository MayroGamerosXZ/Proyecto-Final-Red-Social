'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { User } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { UserPlus, Check, ExternalLink } from 'lucide-react';

interface RightSidebarProps {
  suggestions: User[];
  onFollowSuggestion?: (userId: string) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  suggestions,
  onFollowSuggestion,
}) => {
  const { user } = useAuth();
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  // FILTRADO ESTRICTO: Excluir al usuario actualmente autenticado (ej. @mayro_xz)
  const filteredSuggestions = suggestions.filter(
    (s) => s.id !== user?.id && s.username.toLowerCase() !== user?.username?.toLowerCase()
  );

  const handleFollowToggle = async (targetUser: User) => {
    const isCurrentlyFollowing = followingMap[targetUser.id];
    setLoadingMap((prev) => ({ ...prev, [targetUser.id]: true }));

    try {
      if (isCurrentlyFollowing) {
        await api.unfollowUser(targetUser.id);
        setFollowingMap((prev) => ({ ...prev, [targetUser.id]: false }));
      } else {
        await api.followUser(targetUser.id);
        setFollowingMap((prev) => ({ ...prev, [targetUser.id]: true }));
        if (onFollowSuggestion) {
          onFollowSuggestion(targetUser.id);
        }
      }
    } catch (err) {
      console.error('Error al cambiar seguimiento:', err);
    } finally {
      setLoadingMap((prev) => ({ ...prev, [targetUser.id]: false }));
    }
  };

  return (
    <aside className="space-y-5">
      {/* 1. Widget A quién seguir (Estilo Facebook) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/70 shadow-sm">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
            A quién seguir
          </h3>
          <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            Recomendados
          </span>
        </div>

        {filteredSuggestions.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center">
            No hay más recomendaciones por ahora.
          </p>
        ) : (
          <div className="space-y-3">
            {filteredSuggestions.map((u) => {
              const isFollowing = followingMap[u.id] || u.isFollowing;
              const isLoading = loadingMap[u.id];

              return (
                <div key={u.id} className="flex items-center justify-between gap-2">
                  <Link
                    href={`/profile/${u.username}`}
                    className="flex items-center space-x-2.5 min-w-0 group"
                  >
                    <img
                      src={u.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=U'}
                      alt={u.fullName}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0 group-hover:ring-2 group-hover:ring-indigo-500/25 transition-all"
                    />
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 truncate transition-colors">
                        {u.fullName}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">@{u.username}</p>
                    </div>
                  </Link>

                  <button
                    onClick={() => handleFollowToggle(u)}
                    disabled={isLoading}
                    className={`flex items-center space-x-1 px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex-shrink-0 ${
                      isFollowing
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20 hover:bg-indigo-700'
                        : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Siguiendo</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3 h-3" />
                        <span>Seguir</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Tarjeta Swagger / OpenAPI con destello y status pulsante */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 rounded-2xl p-5 text-white shadow-xl shadow-indigo-950/20 border-t-2 border-indigo-400">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 bg-indigo-800/40 px-2 py-0.5 rounded border border-indigo-700/50">
            Swagger / OpenAPI
          </span>
          <span className="inline-flex items-center space-x-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/50">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>API Online</span>
          </span>
        </div>

        <h4 className="text-sm font-bold mt-3 text-slate-100">Documentación Pública API</h4>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
          Explora y prueba en vivo los endpoints REST interactivos desplegados en Render.
        </p>

        <a
          href="https://proyecto-final-red-social.onrender.com/api/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center justify-center space-x-2 w-full py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/30"
        >
          <span>Abrir /api/docs</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </aside>
  );
};
