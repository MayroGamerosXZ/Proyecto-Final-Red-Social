'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { api } from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { username: string; email: string; password: string; fullName: string; bio?: string }) => Promise<void>;
  enterGuestMode: () => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const response = await api.getMe();
      if (response.success) {
        setUser(response.data);
      }
    } catch {
      logout();
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedGuest = sessionStorage.getItem('socialpulse_guest');
    if (savedToken) {
      setToken(savedToken);
      setIsGuest(false);
      refreshUser().finally(() => setIsLoading(false));
    } else if (savedGuest === 'true') {
      setIsGuest(true);
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    if (res.success) {
      sessionStorage.removeItem('socialpulse_guest');
      setIsGuest(false);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    }
  };

  const register = async (payload: { username: string; email: string; password: string; fullName: string; bio?: string }) => {
    const res = await api.register(payload);
    if (res.success) {
      sessionStorage.removeItem('socialpulse_guest');
      setIsGuest(false);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    }
  };

  const enterGuestMode = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    sessionStorage.setItem('socialpulse_guest', 'true');
    setIsGuest(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('socialpulse_guest');
    setToken(null);
    setUser(null);
    setIsGuest(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isGuest,
        isLoading,
        login,
        register,
        enterGuestMode,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
