'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { NotificationBell } from './NotificationBell';
import {
  Home,
  Compass,
  LogOut,
  LogIn,
  Menu,
  X,
  Sparkles,
  Search,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between gap-4">
        {/* Lado Izquierdo: Logo + Buscador Global Integrado */}
        <div className="flex items-center gap-3 md:gap-5 min-w-0">
          <Link href="/" className="flex items-center space-x-2.5 flex-shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="hidden xs:block">
              <span className="font-extrabold text-lg bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                SocialPulse
              </span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold ml-1.5 px-1.5 py-0.5 bg-slate-100 rounded">
                Live
              </span>
            </div>
          </Link>

          {/* Buscador Global Integrado (Estilo Facebook) */}
          <form onSubmit={handleSearchSubmit} className="hidden sm:block">
            <div className="flex items-center bg-slate-100 hover:bg-slate-200/70 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-300 border border-transparent rounded-full px-3.5 py-1.5 w-48 md:w-64 lg:w-72 transition-all">
              <Search className="w-4 h-4 text-slate-400 flex-shrink-0 mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar usuarios o posts..."
                className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>
          </form>
        </div>

        {/* Centro: Pestañas de Navegación Principal */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          <Link
            href="/"
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              pathname === '/'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Feed</span>
          </Link>

          <Link
            href="/#tendencias"
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
          >
            <Compass className="w-4 h-4 text-violet-500" />
            <span>Explorar</span>
          </Link>
        </nav>

        {/* Lado Derecho: Usuario, Notificaciones y Salir */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {isAuthenticated && user ? (
            <>
              {/* Notificaciones */}
              <NotificationBell />

              {/* Chip de Perfil Redondeado Estilo Facebook */}
              <Link
                href={`/profile/${user.username}`}
                className="flex items-center space-x-2 pl-1 pr-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200/80 transition-all border border-slate-200/60 group"
              >
                <img
                  src={user.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=U'}
                  alt={user.username}
                  className="w-7 h-7 rounded-full object-cover border border-white shadow-xs group-hover:scale-105 transition-transform"
                />
                <span className="hidden sm:inline text-xs font-bold text-slate-700 group-hover:text-indigo-600 truncate max-w-[100px]">
                  @{user.username}
                </span>
              </Link>

              {/* Botón Salir */}
              <button
                onClick={logout}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                title="Cerrar Sesión"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Salir</span>
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                href="/login"
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Ingresar</span>
              </Link>
              <Link
                href="/register"
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-500/20 transition-all"
              >
                Registrarse
              </Link>
            </div>
          )}

          {/* Menú Móvil Botón */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú desplegable Móvil */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-4 space-y-3 shadow-lg animate-in fade-in slide-in-from-top-1">
          {/* Buscador en Móvil */}
          <form onSubmit={handleSearchSubmit}>
            <div className="flex items-center bg-slate-100 rounded-xl px-3 py-2 w-full">
              <Search className="w-4 h-4 text-slate-400 mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar usuarios o posts..."
                className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>
          </form>

          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            <Home className="w-4 h-4 text-indigo-600" />
            <span>Feed Principal</span>
          </Link>

          {isAuthenticated && user ? (
            <>
              <Link
                href={`/profile/${user.username}`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                <img
                  src={user.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=U'}
                  alt={user.username}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span>Mi Perfil (@{user.username})</span>
              </Link>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col space-y-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center space-x-2 w-full py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-700"
              >
                <LogIn className="w-4 h-4" />
                <span>Iniciar Sesión</span>
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center w-full py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white"
              >
                Crear Cuenta
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
