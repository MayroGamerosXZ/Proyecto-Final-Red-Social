'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { UserCheck, UserPlus } from 'lucide-react';

interface ProfileFollowButtonProps {
  userId: string;
  initialIsFollowing: boolean;
  onFollowToggle?: (newIsFollowing: boolean) => void;
}

export const ProfileFollowButton: React.FC<ProfileFollowButtonProps> = ({
  userId,
  initialIsFollowing,
  onFollowToggle,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated || user?.id === userId) {
    return null;
  }

  const handleToggle = async () => {
    try {
      setLoading(true);
      if (isFollowing) {
        await api.unfollowUser(userId);
        setIsFollowing(false);
        if (onFollowToggle) onFollowToggle(false);
      } else {
        await api.followUser(userId);
        setIsFollowing(true);
        if (onFollowToggle) onFollowToggle(true);
      }
    } catch (err) {
      console.error('Error al cambiar estado de seguimiento:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm ${
        isFollowing
          ? 'bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 border border-slate-200'
          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
      }`}
    >
      {isFollowing ? (
        <>
          <UserCheck className="w-3.5 h-3.5" />
          <span>Siguiendo</span>
        </>
      ) : (
        <>
          <UserPlus className="w-3.5 h-3.5" />
          <span>Seguir</span>
        </>
      )}
    </button>
  );
};
