import { UserProfile, UserStats } from '@/types/user.types';
import { supabase } from '../supabase';

/**
 * Fetch user profile
 */
export async function fetchUserProfile(userId?: string): Promise<UserProfile> {
  let targetUserId = userId;

  if (!targetUserId) {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }
    targetUserId = userData.user.id;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', targetUserId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Update user profile
 */
export async function updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData.user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userData.user.id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Fetch user statistics
 */
export async function fetchUserStats(): Promise<UserStats> {
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData.user) {
    throw new Error('User not authenticated');
  }

  // Get profile for completed missions
  const { data: profile } = await supabase
    .from('profiles')
    .select('total_missions_completed')
    .eq('id', userData.user.id)
    .single();

  // Get enrolled missions count
  const { count: enrolledCount } = await supabase
    .from('participations')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userData.user.id)
    .eq('status', 'enrolled');

  // Get upcoming missions count (enrolled missions with future dates)
  const now = new Date().toISOString();
  const { count: upcomingCount } = await supabase
    .from('participations')
    .select('mission_id', { count: 'exact', head: true })
    .eq('user_id', userData.user.id)
    .eq('status', 'enrolled')
    .gte('missions.date', now);

  return {
    total_missions_completed: profile?.total_missions_completed || 0,
    enrolled_missions_count: enrolledCount || 0,
    upcoming_missions_count: upcomingCount || 0,
  };
}

/**
 * Sign out user
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw new Error(error.message);
  }
}