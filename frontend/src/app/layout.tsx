import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { SocketProvider } from '../context/SocketContext';
import { Navbar } from '../components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SocialPulse - Red Social Fullstack en Tiempo Real',
  description: 'Plataforma social moderna con renderizado en el servidor (SSR), WebSockets en vivo, Swagger API y persistencia relacional PostgreSQL.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          <SocketProvider>
            <div className="min-h-screen flex flex-col bg-slate-50/50">
              <Navbar />
              <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {children}
              </main>
              <footer className="border-t border-slate-200/60 py-6 text-center text-xs text-slate-400">
                <p>SocialPulse © 2026 — Proyecto Final de Desarrollo Web Fullstack</p>
              </footer>
            </div>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
