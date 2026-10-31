import React, { cache } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProfileView } from '../../../components/ProfileView';
import { Post, User } from '../../../types';

interface ProfilePageProps {
  params: {
    username: string;
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Server-Side Data Fetching (SSR) con deduplicación por request (React.cache)
const getProfileData = cache(async (username: string): Promise<User | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/users/${username}`, {
      cache: 'no-store', // Garantiza SSR en cada petición para el perfil más reciente
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('Error al obtener perfil');
    }

    const json = await res.json();
    return json.data as User;
  } catch (error) {
    console.error('SSR getProfileData error:', error);
    return null;
  }
});

const getUserPosts = cache(async (username: string): Promise<Post[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/posts/user/${username}`, {
      cache: 'no-store', // SSR
    });

    if (!res.ok) return [];
    const json = await res.json();
    return json.data as Post[];
  } catch (error) {
    console.error('SSR getUserPosts error:', error);
    return [];
  }
});

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const profile = await getProfileData(params.username);
  if (!profile) {
    return { title: 'Perfil no encontrado - SocialPulse' };
  }
  return {
    title: `${profile.fullName} (@${profile.username}) - SocialPulse`,
    description: profile.bio || `Perfil de ${profile.fullName} en SocialPulse`,
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  // Ejecutar ambas consultas SSR en paralelo para reducir la latencia a la mitad
  const [profile, posts] = await Promise.all([
    getProfileData(params.username),
    getUserPosts(params.username),
  ]);

  if (!profile) {
    notFound();
  }

  return <ProfileView initialProfile={profile} initialPosts={posts} />;
}
