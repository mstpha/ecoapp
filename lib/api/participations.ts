import { Participation, ParticipationWithMission } from '@/types/participation.types';
import { supabase } from '../supabase';

/**
 * Enroll user in a mission
 */
export async function enrollInMission(missionId: string): Promise<Participation> {
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData.user) {
    throw new Error('User not authenticated');
  }

  // Check if user is already enrolled
  const { data: existing } = await supabase
    .from('participations')
    .select('*')
    .eq('user_id', userData.user.id)
    .eq('mission_id', missionId)
    .maybeSingle();

  if (existing) {
    throw new Error('Already enrolled in this mission');
  }

  // Check if mission is full
  const { data: mission } = await supabase
    .from('missions')
    .select('current_participants, max_participants')
    .eq('id', missionId)
    .single();

  if (mission && mission.current_participants >= mission.max_participants) {
    throw new Error('Mission is full');
  }

  const { data, error } = await supabase
    .from('participations')
    .insert({
      user_id: userData.user.id,
      mission_id: missionId,
      status: 'enrolled',
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Cancel enrollment in a mission
 */
export async function cancelEnrollment(participationId: string): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData.user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('participations')
    .update({ status: 'cancelled' })
    .eq('id', participationId)
    .eq('user_id', userData.user.id);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Get user's enrolled missions
 */
export async function fetchMyMissions(): Promise<ParticipationWithMission[]> {
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData.user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('participations')
    .select(`
      *,
      mission:missions (
        id,
        title,
        description,
        category,
        location,
        date,
        duration_hours,
        image_url
      )
    `)
    .eq('user_id', userData.user.id)
    .eq('status', 'enrolled')
    .order('enrolled_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as ParticipationWithMission[];
}

/**
 * Check if user is enrolled in a specific mission
 */
export async function checkEnrollment(missionId: string): Promise<Participation | null> {
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData.user) {
    return null;
  }

  const { data, error } = await supabase
    .from('participations')
    .select('*')
    .eq('user_id', userData.user.id)
    .eq('mission_id', missionId)
    .eq('status', 'enrolled')
    .maybeSingle();

  if (error) {
    return null;
  }

  return data;
}

/**
 * Mark participation as completed
 */
export async function completeParticipation(participationId: string): Promise<void> {
  const { error } = await supabase
    .from('participations')
    .update({ status: 'completed' })
    .eq('id', participationId);

  if (error) {
    throw new Error(error.message);
  }
}