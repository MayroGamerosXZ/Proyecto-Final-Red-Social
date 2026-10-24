'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { api } from '../lib/api';
import { Message } from '../types';
import {
  X,
  Send,
  MessageCircle,
  ArrowLeft,
  Sparkles,
  CheckCheck,
} from 'lucide-react';

export const MessengerWidget: React.FC = () => {
  const {
    isOpen,
    activeTarget,
    conversations,
    closeMessenger,
    openChatWith,
    refreshConversations,
  } = useChat();
  const { user, isAuthenticated } = useAuth();
  const { socket } = useSocket();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Cargar mensajes cuando cambia el usuario activo
  useEffect(() => {
    if (!activeTarget || !isAuthenticated) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);
    api
      .getMessages(activeTarget.id)
      .then((res) => {
        if (res.success) {
          setMessages(res.data.messages || []);
          refreshConversations();
        }
      })
      .catch((err) => console.error('Error al cargar mensajes:', err))
      .finally(() => setLoadingMessages(false));
  }, [activeTarget, isAuthenticated, refreshConversations]);

  // Scroll automático hacia el final de los mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Escuchar mensajes entrantes en vivo para la conversación activa
  useEffect(() => {
    if (!socket || !activeTarget) return;

    const handleIncoming = (msg: Message) => {
      if (msg.senderId === activeTarget.id) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on('chat:message_received', handleIncoming);

    return () => {
      socket.off('chat:message_received', handleIncoming);
    };
  }, [socket, activeTarget]);

  if (!isAuthenticated || !isOpen) {
    return null;
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeTarget || sending) return;

    const contentToSend = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const res = await api.sendMessage(activeTarget.id, contentToSend);
      if (res.success) {
        setMessages((prev) => [...prev, res.data]);
        refreshConversations();
      }
    } catch (err: any) {
      alert(err.message || 'Error al enviar mensaje');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-3 sm:right-6 z-50 w-[92vw] sm:w-96 max-h-[540px] h-[500px] bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-700 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200">
      {/* 1. Cabecera del Messenger */}
      <div className="p-3.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 text-white flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-2.5 min-w-0">
          {activeTarget && (
            <button
              onClick={() => openChatWith(null as any)}
              className="p-1 -ml-1 hover:bg-white/20 rounded-full transition-colors"
              title="Volver a la lista"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          {activeTarget ? (
            <div className="flex items-center space-x-2 min-w-0">
              <img
                src={activeTarget.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=U'}
                alt={activeTarget.fullName}
                className="w-8 h-8 rounded-full object-cover border border-white/40 flex-shrink-0"
              />
              <div className="min-w-0">
                <h4 className="text-xs font-bold truncate">{activeTarget.fullName}</h4>
                <p className="text-[10px] text-indigo-200 truncate">@{activeTarget.username}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold">Mensajes Directos</h4>
                <p className="text-[10px] text-indigo-200">Chat en vivo SocialPulse</p>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={closeMessenger}
          className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-white"
          title="Cerrar chat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Cuerpo: Vista de Chat o Lista de Conversaciones */}
      {activeTarget ? (
        <>
          {/* Hilo de Mensajes */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5 bg-slate-50/70 dark:bg-slate-900/60">
            {loadingMessages ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-6 h-6 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4 space-y-2">
                <Sparkles className="w-8 h-8 text-indigo-400" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Comienza una conversación con {activeTarget.fullName.split(' ')[0]}
                </p>
                <p className="text-[11px] text-slate-400">
                  Los mensajes se entregan instantáneamente en tiempo real.
                </p>
              </div>
            ) : (
              messages.map((m) => {
                const isMine = m.senderId === user?.id;
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[78%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed ${
                        isMine
                          ? 'bg-indigo-600 text-white rounded-br-xs shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-xs border border-slate-200/80 dark:border-slate-700 shadow-xs'
                      }`}
                    >
                      {m.content}
                    </div>
                    <span className="text-[9px] text-slate-400 mt-0.5 px-1 flex items-center space-x-1">
                      <span>
                        {new Date(m.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {isMine && <CheckCheck className="w-2.5 h-2.5 text-indigo-400" />}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Formulario de envío */}
          <form
            onSubmit={handleSendMessage}
            className="p-2.5 bg-white dark:bg-slate-800 border-t border-slate-200/80 dark:border-slate-700 flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 text-xs bg-slate-100 dark:bg-slate-700/60 text-slate-800 dark:text-slate-100 rounded-2xl px-3.5 py-2 border border-transparent focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || sending}
              className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full disabled:opacity-40 transition-colors shadow-xs"
              title="Enviar mensaje"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </>
      ) : (
        /* Lista de Conversaciones Activas */
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-700/60">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-2">
              <MessageCircle className="w-10 h-10 text-slate-300 dark:text-slate-600" />
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200">
                No tienes conversaciones activas
              </h4>
              <p className="text-[11px] text-slate-400 max-w-xs">
                Entra al perfil de cualquier usuario y pulsa "Enviar Mensaje" para chatear.
              </p>
            </div>
          ) : (
            conversations.map((c) => (
              <div
                key={c.user.id}
                onClick={() => openChatWith(c.user)}
                className="flex items-center space-x-3 p-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-2xl cursor-pointer transition-colors"
              >
                <div className="relative">
                  <img
                    src={c.user.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=U'}
                    alt={c.user.fullName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-600"
                  />
                  {c.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs">
                      {c.unreadCount}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                      {c.user.fullName}
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      {new Date(c.lastMessage.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {c.lastMessage.senderId === user?.id ? 'Tú: ' : ''}
                    {c.lastMessage.content}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
