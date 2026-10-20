'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { NotificationBell } from './NotificationBell';
import { Home, User, LogOut, LogIn, Menu, X, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo y Nombre */}
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                SocialPulse
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase tracking-wider text-slate-400 font-bold ml-1.5 px-1.5 py-0.5 bg-slate-100 rounded">
                Live
              </span>
            </div>
          </Link>

          {/* Navegación Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/"
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Feed</span>
            </Link>

            {isAuthenticated && user ? (
              <>
                <Link
                  href={`/profile/${user.username}`}
                  className="flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
                >
                  <img
                    src={user.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=U'}
                    alt={user.username}
                    className="w-6 h-6 rounded-full object-cover border border-slate-200"
                  />
                  <span>@{user.username}</span>
                </Link>

                <NotificationBell />

                <button
                  onClick={logout}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors ml-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Salir</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Ingresar</span>
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all hover:shadow-lg"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* Botón Menú Móvil */}
          <div className="flex items-center space-x-2 md:hidden">
            {isAuthenticated && <NotificationBell />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú desplegable Móvil */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-2 pb-4 space-y-2 animate-in fade-in slide-in-from-top-1">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Home className="w-4 h-4 text-indigo-600" />
            <span>Feed Principal</span>
          </Link>

          {isAuthenticated && user ? (
            <>
              <Link
                href={`/profile/${user.username}`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <User className="w-4 h-4 text-indigo-600" />
                <span>Mi Perfil (@{user.username})</span>
              </Link>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-2 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 text-left"
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
                className="flex items-center justify-center space-x-2 w-full py-2.5 rounded-xl text-sm font-medium border border-slate-200 text-slate-700"
              >
                <LogIn className="w-4 h-4" />
                <span>Iniciar Sesión</span>
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center w-full py-2.5 rounded-xl text-sm font-medium bg-indigo-600 text-white"
              >
                Crear Cuenta
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
