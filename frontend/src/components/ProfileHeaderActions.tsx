'use client';

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ProfileFollowButton } from './ProfileFollowButton';
import { EditProfileModal } from './EditProfileModal';

interface ProfileHeaderActionsProps {
  profileUser: {
    id: string;
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
    <ProfileFollowButton
      userId={profileUser.id}
      initialIsFollowing={!!profileUser.isFollowing}
    />
  );
};
