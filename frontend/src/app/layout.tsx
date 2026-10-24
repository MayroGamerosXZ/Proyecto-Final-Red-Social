import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import { SocketProvider } from '../context/SocketContext';
import { ChatProvider } from '../context/ChatContext';
import { Navbar } from '../components/Navbar';
import { BottomNav } from '../components/BottomNav';
import { MessengerWidget } from '../components/MessengerWidget';

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
    <html lang="es" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <AuthProvider>
            <SocketProvider>
              <ChatProvider>
                <div className="min-h-screen flex flex-col bg-[#F0F2F5] dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
                  {/* Navbar Sticky Superior con Búsqueda y Tema */}
                  <Navbar />

                  {/* Contenedor Principal (hasta max-w-7xl para 3 columnas en desktop) */}
                  <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 lg:px-6 py-6 pb-20 md:pb-8">
                    {children}
                  </main>

                  {/* Widget Flotante de Mensajería Directa (Chat 1-a-1 en Tiempo Real) */}
                  <MessengerWidget />

                  {/* Barra de Navegación Inferior Fija para Móviles (< 768px) */}
                  <BottomNav />

                  {/* Pie de Página */}
                  <footer className="border-t border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-6 text-center text-xs text-slate-400 dark:text-slate-500">
                    <p>SocialPulse © 2026 — Proyecto Final de Desarrollo Web Fullstack</p>
                  </footer>
                </div>
              </ChatProvider>
            </SocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
