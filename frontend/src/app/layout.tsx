import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { SocketProvider } from '../context/SocketContext';
import { Navbar } from '../components/Navbar';
import { BottomNav } from '../components/BottomNav';

export const metadata: Metadata = {
  title: 'SocialPulse - Red Social Fullstack en Tiempo Real',
  description:
    'Plataforma social moderna con renderizado en el servidor (SSR), WebSockets en vivo, Swagger API y persistencia relacional PostgreSQL.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">
        <AuthProvider>
          <SocketProvider>
            <div className="min-h-screen flex flex-col bg-[#F0F2F5] text-slate-900">
              {/* Navbar Sticky Superior */}
              <Navbar />

              {/* Contenedor Principal (hasta max-w-7xl para 3 columnas en desktop) */}
              <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 lg:px-6 py-6 pb-20 md:pb-8">
                {children}
              </main>

              {/* Barra de Navegación Inferior Fija para Móviles (< 768px) */}
              <BottomNav />

              {/* Pie de Página */}
              <footer className="border-t border-slate-200/80 bg-white/50 py-6 text-center text-xs text-slate-400">
                <p>SocialPulse © 2026 — Proyecto Final de Desarrollo Web Fullstack</p>
              </footer>
            </div>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
