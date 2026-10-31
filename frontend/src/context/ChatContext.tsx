'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { api } from '../lib/api';
import { Conversation, Message } from '../types';

interface ChatTargetUser {
  id: string;
  username: string;
  fullName: string;
  avatarUrl?: string | null;
  isOnline?: boolean;
  lastSeen?: string | null;
}

interface ChatContextType {
  isOpen: boolean;
  activeTarget: ChatTargetUser | null;
  conversations: Conversation[];
  totalUnread: number;
  openChatWith: (target: ChatTargetUser) => void;
  syncTargetPresence: (userId: string, isOnline?: boolean, lastSeen?: string | null) => void;
  toggleMessenger: () => void;
  closeMessenger: () => void;
  refreshConversations: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const { socket } = useSocket();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTarget, setActiveTarget] = useState<ChatTargetUser | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [totalUnread, setTotalUnread] = useState(0);

  const refreshConversations = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.getConversations();
      if (res.success) {
        setConversations(res.data);
        const unread = res.data.reduce((acc: number, c: Conversation) => acc + (c.unreadCount || 0), 0);
        setTotalUnread(unread);
      }
    } catch (err) {
      console.error('Error al cargar conversaciones:', err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  // Escuchar mensajes entrantes y cambios de presencia en vivo vía WebSocket
  useEffect(() => {
    if (!socket || !isAuthenticated) return;

    const handleMessageReceived = (msg: Message) => {
      // Si el mensaje es del usuario activo actual, no sumar a totalUnread si el chat está abierto
      if (activeTarget?.id === msg.senderId && isOpen) {
        // En vista activa
      } else {
        setTotalUnread((prev) => prev + 1);
      }
      refreshConversations();
    };

    const handlePresenceChanged = (data: {
      userId: string;
      isOnline: boolean;
      lastSeen: string;
    }) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.user.id === data.userId
            ? {
                ...c,
                user: {
                  ...c.user,
                  isOnline: data.isOnline,
                  lastSeen: data.lastSeen,
                },
              }
            : c
        )
      );
      setActiveTarget((prev) =>
        prev && prev.id === data.userId
          ? {
              ...prev,
              isOnline: data.isOnline,
              lastSeen: data.lastSeen,
            }
          : prev
      );
    };

    socket.on('chat:message_received', handleMessageReceived);
    socket.on('user:presence_changed', handlePresenceChanged);

    return () => {
      socket.off('chat:message_received', handleMessageReceived);
      socket.off('user:presence_changed', handlePresenceChanged);
    };
  }, [socket, isAuthenticated, activeTarget, isOpen, refreshConversations]);

  const syncTargetPresence = useCallback(
    (userId: string, isOnline?: boolean, lastSeen?: string | null) => {
      setActiveTarget((prev) =>
        prev && prev.id === userId
          ? {
              ...prev,
              isOnline: isOnline ?? prev.isOnline,
              lastSeen: lastSeen !== undefined ? lastSeen : prev.lastSeen,
            }
          : prev
      );
    },
    []
  );

  const openChatWith = (target: ChatTargetUser) => {
    setActiveTarget(target);
    setIsOpen(true);
  };

  const toggleMessenger = () => {
    setIsOpen((prev) => !prev);
  };

  const closeMessenger = () => {
    setIsOpen(false);
    setActiveTarget(null);
  };

  return (
    <ChatContext.Provider
      value={{
        isOpen,
        activeTarget,
        conversations,
        totalUnread,
        openChatWith,
        syncTargetPresence,
        toggleMessenger,
        closeMessenger,
        refreshConversations,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat debe ser utilizado dentro de un ChatProvider');
  }
  return context;
};
