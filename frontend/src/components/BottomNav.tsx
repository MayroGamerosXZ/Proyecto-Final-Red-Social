'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Home, Compass, Plus, User as UserIcon, LogIn } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();

  const handleCreatePostClick = () => {
    // Si estamos en la página principal, hacer scroll suave al creador de posts
    const composer = document.getElementById('composer-card') || document.getElementById('composer-input');
    if (composer) {
      composer.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const textarea = composer.querySelector('textarea');
      if (textarea) textarea.focus();
    } else {
      window.location.href = '/#composer-card';
    }
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* 1. Feed */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors ${
            pathname === '/' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Feed</span>
        </Link>

        {/* 2. Explorar */}
        <Link
          href="/#tendencias"
          className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Explorar</span>
        </Link>

        {/* 3. Botón Central Destacado: Crear Post */}
        {isAuthenticated ? (
          <button
            onClick={handleCreatePostClick}
            type="button"
            className="flex items-center justify-center -mt-4 w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/35 hover:scale-105 active:scale-95 transition-transform"
            title="Crear nueva publicación"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        ) : (
          <Link
            href="/login"
            className="flex items-center justify-center -mt-4 w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/35"
          >
            <LogIn className="w-5 h-5" />
          </Link>
        )}

        {/* 4. Perfil */}
        {isAuthenticated && user ? (
          <Link
            href={`/profile/${user.username}`}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors ${
              pathname.includes(`/profile/${user.username}`)
                ? 'text-indigo-600 font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <img
              src={user.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=U'}
              alt={user.username}
              className={`w-5 h-5 rounded-full object-cover border ${
                pathname.includes(`/profile/${user.username}`)
                  ? 'border-indigo-600 ring-2 ring-indigo-500/30'
                  : 'border-slate-300'
              }`}
            />
            <span className="text-[10px] mt-0.5">Perfil</span>
          </Link>
        ) : (
          <Link
            href="/login"
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors ${
              pathname === '/login' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <UserIcon className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Ingresar</span>
          </Link>
        )}
      </div>
    </nav>
  );
};
