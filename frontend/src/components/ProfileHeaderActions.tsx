'use client';

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { ProfileFollowButton } from './ProfileFollowButton';
import { EditProfileModal } from './EditProfileModal';
import { MessageCircle } from 'lucide-react';

interface ProfileHeaderActionsProps {
  profileUser: {
    id: string;
    username: string;
    fullName: string;
    bio?: string | null;
    avatarUrl?: string | null;
    isFollowing?: boolean;
  };
  onProfileUpdated?: (updated: { fullName: string; bio?: string; avatarUrl?: string }) => void;
}

export const ProfileHeaderActions: React.FC<ProfileHeaderActionsProps> = ({
  profileUser,
  onProfileUpdated,
}) => {
  const { user, isAuthenticated } = useAuth();
  const { openChatWith } = useChat();

  if (!isAuthenticated) {
    return null;
  }

  const isOwnProfile = user?.id === profileUser.id;

  if (isOwnProfile) {
    return (
      <EditProfileModal
        currentFullName={profileUser.fullName}
        currentBio={profileUser.bio}
        currentAvatarUrl={profileUser.avatarUrl}
        onProfileUpdated={(updated) => {
          if (onProfileUpdated) onProfileUpdated(updated);
        }}
      />
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => openChatWith(profileUser)}
        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors border border-indigo-200/50 dark:border-indigo-800 shadow-xs"
        title={`Enviar mensaje directo a ${profileUser.fullName}`}
      >
        <MessageCircle className="w-3.5 h-3.5" />
        <span>Mensaje</span>
      </button>

      <ProfileFollowButton
        userId={profileUser.id}
        initialIsFollowing={!!profileUser.isFollowing}
      />
    </div>
  );
};
