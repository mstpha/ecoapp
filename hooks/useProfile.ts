import { useAuth } from '@/context/Authcontext';
import { fetchUserStats } from '@/lib/api/users';
import { queryKeys } from '@/lib/queryClient';
import { supabase } from '@/lib/supabase';
import { UserProfile, UserStats } from '@/types/user.types';
import { useQuery } from '@tanstack/react-query';

export const profileKeys = {
  all: ['profile'] as const,
  detail: (userId: string) => [...profileKeys.all, userId] as const,
  stats: (userId: string) => [...profileKeys.all, 'stats', userId] as const,
};

/* =========================
   FETCH PROFILE
========================= */

export async function fetchProfile(userId: string): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      avatar_url,
      missions_completed,
      created_at,
      updated_at
    `)
    .eq('id', userId)
    .single();

  if (error) throw new Error(error.message);
  if (!data) throw new Error('Profile not found');

  return {
    id: data.id,
    full_name: data.full_name,
    avatar_url: data.avatar_url,
    total_missions_completed: data.missions_completed ?? 0,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

/* =========================
   REACT QUERY HOOKS
========================= */

export function useProfile() {
  const { user } = useAuth();

  return useQuery<UserProfile>({
    queryKey: profileKeys.detail(user?.id ?? ''),
    queryFn: () => fetchProfile(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
}

// Single source of truth for user stats — delegates to lib/api/users.ts fetchUserStats
// which correctly computes stats from participations joined with missions by date
export function useUserStats() {
  const { data: userData } = useQuery({
    queryKey: ['user-session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    },
  });

  return useQuery<UserStats>({
    queryKey: queryKeys.users.stats(userData?.id || ''),
    queryFn: fetchUserStats,
    enabled: !!userData?.id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
  });
}