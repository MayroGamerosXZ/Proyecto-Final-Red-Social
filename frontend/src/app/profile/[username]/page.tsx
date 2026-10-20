import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Calendar, MapPin, Sparkles } from 'lucide-react';
import { ProfileFollowButton } from '../../../components/ProfileFollowButton';
import { PostCard } from '../../../components/PostCard';
import { Post } from '../../../types';

interface ProfilePageProps {
  params: {
    username: string;
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Server-Side Data Fetching (SSR)
async function getProfileData(username: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/users/${username}`, {
      cache: 'no-store', // Garantiza SSR en cada petición
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('Error al obtener perfil');
    }

    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error('SSR getProfileData error:', error);
    return null;
  }
}

async function getUserPosts(username: string) {
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
}

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
  const profile = await getProfileData(params.username);

  if (!profile) {
    notFound();
  }

  const posts = await getUserPosts(params.username);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Tarjeta Principal de Perfil (SSR) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
          <img
            src={profile.avatarUrl || 'https://api.dicebear.com/7.x/initials/svg?seed=U'}
            alt={profile.fullName}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-white shadow-xl shadow-slate-200/50"
          />

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800">{profile.fullName}</h1>
                <p className="text-xs sm:text-sm text-indigo-600 font-medium">@{profile.username}</p>
              </div>

              {/* Botón interactivo de seguimiento */}
              <div>
                <ProfileFollowButton
                  userId={profile.id}
                  initialIsFollowing={!!profile.isFollowing}
                />
              </div>
            </div>

            {profile.bio && (
              <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed max-w-xl">
                {profile.bio}
              </p>
            )}

            <div className="flex items-center justify-center sm:justify-start space-x-4 mt-4 text-xs text-slate-400">
              <div className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  Miembro desde{' '}
                  {new Date(profile.createdAt).toLocaleDateString([], {
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Contadores Estadísticos */}
            <div className="flex items-center justify-center sm:justify-start space-x-6 mt-5 pt-4 border-t border-slate-100">
              <div>
                <span className="block font-bold text-slate-800 text-sm">
                  {profile._count?.posts ?? posts.length}
                </span>
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Posts</span>
              </div>
              <div>
                <span className="block font-bold text-slate-800 text-sm">
                  {profile._count?.followers ?? 0}
                </span>
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Seguidores</span>
              </div>
              <div>
                <span className="block font-bold text-slate-800 text-sm">
                  {profile._count?.following ?? 0}
                </span>
                <span className="text-[11px] text-slate-400 uppercase font-semibold">Siguiendo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Publicaciones del Usuario */}
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-800 text-sm px-1">
          Publicaciones de {profile.fullName.split(' ')[0]} ({posts.length})
        </h3>

        {posts.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-sm">
            <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Este usuario aún no ha publicado nada.</p>
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
}
