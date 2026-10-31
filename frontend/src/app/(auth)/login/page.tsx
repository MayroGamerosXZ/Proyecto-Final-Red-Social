'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { LogIn, AlertCircle, Eye } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, enterGuestMode, isAuthenticated, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Si ya tiene sesión activa, redirigir al feed
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor ingresa tu correo y contraseña registrados');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(email.trim(), password);
      router.replace('/');
    } catch (err: any) {
      setError(err.message || 'Credenciales inválidas. Verifica tu correo y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestExplore = () => {
    enterGuestMode();
    router.push('/');
  };

  return (
    <div className="max-w-md mx-auto my-6 sm:my-10 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none">
        {/* Encabezado con Logo Oficial SocialPulse */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center gap-3 mb-3 p-2.5 px-4 rounded-2xl bg-[#101524] shadow-lg shadow-indigo-500/20 border border-indigo-500/30">
            <img
              src="/logo-icon.png"
              alt="SocialPulse Logo"
              className="w-11 h-11 rounded-xl object-cover"
            />
            <div className="flex items-baseline space-x-1 pr-1">
              <span className="font-extrabold text-2xl tracking-tight text-white">
                Social
              </span>
              <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                Pulse
              </span>
            </div>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-800">
              Acceso a la Plataforma
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">Iniciar Sesión</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Ingresa tu correo y contraseña registrados para acceder a la red social
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-100 dark:border-red-900/60 flex items-center space-x-2 text-xs text-red-600 dark:text-red-400 font-medium animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@ejemplo.com"
              required
              className="w-full text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md shadow-indigo-500/20 hover:shadow-lg"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Validando credenciales...' : 'Ingresar a la Plataforma'}</span>
          </button>
        </form>

        {/* Opción de Modo Invitado (Solo Lectura) */}
        <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-700">
          <button
            type="button"
            onClick={handleGuestExplore}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200/80 dark:border-slate-600 transition-all"
          >
            <Eye className="w-4 h-4 text-indigo-500" />
            <span>Explorar como Invitado (Solo Lectura)</span>
          </button>
          <p className="text-[11px] text-center text-slate-400 dark:text-slate-500 mt-2">
            Visualiza publicaciones, tendencias y perfiles sin iniciar sesión.
          </p>
        </div>

        {/* Enlace a Registro */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 underline">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
