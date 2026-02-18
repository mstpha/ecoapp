import { useAuth } from '@/context/Authcontext';
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
   FETCH USER STATS
========================= */

export async function fetchUserStats(userId: string): Promise<UserStats> {
  // 1️⃣ Get missions completed from profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('missions_completed')
    .eq('id', userId)
    .single();

  if (profileError) throw new Error(profileError.message);

  // 2️⃣ Count enrolled (registered) missions
  const { count: enrolledCount, error: enrolledError } = await supabase
    .from('participations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'registered');

  if (enrolledError) throw new Error(enrolledError.message);

  // 3️⃣ Count upcoming missions
  const { count: upcomingCount, error: upcomingError } = await supabase
    .from('participations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'upcoming');

  if (upcomingError) throw new Error(upcomingError.message);

  return {
    total_missions_completed: profile?.missions_completed ?? 0,
    enrolled_missions_count: enrolledCount ?? 0,
    upcoming_missions_count: upcomingCount ?? 0,
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
    staleTime: 1000 * 60 * 10, // 10 min
    gcTime: 1000 * 60 * 30,    // 30 min
  });
}

export function useUserStats() {
  const { user } = useAuth();

  return useQuery<UserStats>({
    queryKey: profileKeys.stats(user?.id ?? ''),
    queryFn: () => fetchUserStats(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
  });
}
