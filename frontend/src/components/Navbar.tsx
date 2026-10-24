'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useChat } from '../context/ChatContext';
import { NotificationBell } from './NotificationBell';
import { SearchAutocomplete } from './SearchAutocomplete';
import {
  Home,
  Compass,
  LogOut,
  LogIn,
  Menu,
  X,
  Sparkles,
  Sun,
  Moon,
  MessageCircle,
  Bookmark,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toggleMessenger, totalUnread } = useChat();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between gap-3 sm:gap-4">
        {/* Lado Izquierdo: Logo + Buscador Avanzado en Vivo */}
        <div className="flex items-center gap-3 md:gap-5 min-w-0">
          <Link href="/" className="flex items-center space-x-2.5 flex-shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="hidden xs:block">
              <span className="font-extrabold text-lg bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                SocialPulse
              </span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold ml-1.5 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
                Live
              </span>
            </div>
          </Link>

          {/* Buscador Avanzado con Autocompletado */}
          <div className="hidden sm:block">
            <SearchAutocomplete />
          </div>
        </div>

        {/* Centro: Pestañas de Navegación Principal */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          <Link
            href="/"
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              pathname === '/'
                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Feed</span>
          </Link>

          <Link
            href="/saved"
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              pathname === '/saved'
                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Bookmark className="w-4 h-4 text-amber-500" />
            <span>Guardados</span>
          </Link>

          <Link
            href="/#tendencias"
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <Compass className="w-4 h-4 text-violet-500" />
            <span>Explorar</span>
          </Link>
        </nav>

        {/* Lado Derecho: Tema, Mensajes, Notificaciones, Usuario y Salir */}
        <div className="flex items-center space-x-1.5 sm:space-x-2.5">
          {/* Botón de Modo Oscuro / Modo Claro */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro (Dark Pulse)'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {isAuthenticated && user ? (
            <>
              {/* Botón de Mensajería Directa (Chat 1-a-1) */}
              <button
                onClick={toggleMessenger}
                className="relative p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Mensajes Directos"
              >
                <MessageCircle className="w-5 h-5" />
                {totalUnread > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-xs">
                    {totalUnread > 9 ? '9+' : totalUnread}
                  </span>
                )}
              </button>

              {/* Notificaciones */}
              <NotificationBell />

              {/* Chip de Perfil */}
              <Link
                href={`/profile/${user.username}`}
                className="flex items-center space-x-2 pl-1 pr-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 transition-all border border-slate-200/60 dark:border-slate-700 group"
              >
                <img
                  src={user.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=U'}
                  alt={user.username}
                  className="w-7 h-7 rounded-full object-cover border border-white dark:border-slate-700 shadow-xs group-hover:scale-105 transition-transform"
                />
                <span className="hidden sm:inline text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate max-w-[100px]">
                  @{user.username}
                </span>
              </Link>

              {/* Botón Salir */}
              <button
                onClick={logout}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
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
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú desplegable Móvil */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-4 space-y-3 shadow-lg animate-in fade-in slide-in-from-top-1">
          {/* Buscador en Móvil con autocompletado */}
          <div className="w-full">
            <SearchAutocomplete />
          </div>

          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Home className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Feed Principal</span>
          </Link>

          <Link
            href="/saved"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Bookmark className="w-4 h-4 text-amber-500" />
            <span>Publicaciones Guardadas</span>
          </Link>

          {isAuthenticated && user ? (
            <>
              <button
                onClick={() => {
                  toggleMessenger();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
              >
                <MessageCircle className="w-4 h-4 text-indigo-500" />
                <span>Mensajes Directos {totalUnread > 0 ? `(${totalUnread})` : ''}</span>
              </button>

              <Link
                href={`/profile/${user.username}`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
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
                className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-left"
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
                className="flex items-center justify-center space-x-2 w-full py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
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
