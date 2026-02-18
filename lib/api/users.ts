import { UserProfile, UserStats } from '@/types/user.types';
import { supabase } from '../supabase';

export async function fetchUserProfile(userId?: string): Promise<UserProfile> {
  let targetUserId = userId;

  if (!targetUserId) {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('User not authenticated');
    targetUserId = userData.user.id;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', targetUserId)
    .single();

  if (error) throw new Error(error.message);

  return data;
}

export async function updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userData.user.id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data;
}

/**
 * Fetch user stats:
 * - Excludes cancelled participations from ALL counts
 * - Impact = total hours volunteered (past missions only)
 */
export async function fetchUserStats(): Promise<UserStats> {
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) throw new Error('User not authenticated');

  const userId = userData.user.id;
  const now = new Date().toISOString();

  // Only non-cancelled participations
  const { data, error } = await supabase
    .from('participations')
    .select(`
      id,
      status,
      missions (
        id,
        date,
        duration_hours
      )
    `)
    .eq('user_id', userId)
    .neq('status', 'cancelled');

  if (error) throw new Error(error.message);

  const participations = data ?? [];

  let upcoming = 0;
  let completed = 0;
  let totalHours = 0;

  participations.forEach((p: any) => {
    const mission = p.missions;
    if (!mission) return;

    if (mission.date >= now) {
      upcoming++;
    } else {
      completed++;
      totalHours += mission.duration_hours ?? 0;
    }
  });

  return {
    total_missions_completed: completed,
    enrolled_missions_count: participations.length,
    upcoming_missions_count: upcoming,
    total_hours_volunteered: totalHours,
  };
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}