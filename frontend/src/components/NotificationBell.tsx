'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Heart, MessageSquare, UserPlus, Check } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { api } from '../lib/api';

export const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, setUnreadCount, setNotifications } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cargar notificaciones iniciales del servidor
  useEffect(() => {
    api
      .getNotifications()
      .then((res) => {
        if (res.success) {
          setNotifications(res.data.notifications);
          setUnreadCount(res.data.unreadCount);
        }
      })
      .catch((err) => console.error('Error al cargar notificaciones:', err));
  }, [setNotifications, setUnreadCount]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (id: string, isRead: boolean) => {
    if (!isRead) {
      try {
        await api.markNotificationAsRead(id);
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Notificaciones"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-slate-800 dark:text-white text-sm">Notificaciones</h3>
              {unreadCount > 0 && (
                <span className="bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs px-2 py-0.5 rounded-full font-medium">
                  {unreadCount} nuevas
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center space-x-1 font-medium"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Marcar todas</span>
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-700">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-400 dark:text-slate-400 text-sm">
                No tienes notificaciones aún
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n.id, n.isRead)}
                  className={`flex items-start space-x-3 p-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/60 cursor-pointer transition-colors ${
                    !n.isRead ? 'bg-indigo-50/40 dark:bg-indigo-950/40' : ''
                  }`}
                >
                  <img
                    src={n.actor.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=U'}
                    alt={n.actor.username}
                    className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-800 dark:text-slate-200 leading-snug">
                      <span className="font-semibold">{n.actor.fullName}</span>{' '}
                      {n.type === 'LIKE' && 'le gustó tu publicación.'}
                      {n.type === 'COMMENT' && 'comentó en tu publicación.'}
                      {n.type === 'FOLLOW' && 'comenzó a seguirte.'}
                    </p>
                    <span className="text-[10px] text-slate-400 dark:text-slate-400 block mt-1">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex-shrink-0">
                    {n.type === 'LIKE' && <Heart className="w-4 h-4 text-red-500 fill-current" />}
                    {n.type === 'COMMENT' && <MessageSquare className="w-4 h-4 text-blue-500" />}
                    {n.type === 'FOLLOW' && <UserPlus className="w-4 h-4 text-indigo-500" />}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
