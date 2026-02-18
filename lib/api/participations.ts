import { Participation, ParticipationWithMission } from '@/types/participation.types';
import { supabase } from '../supabase';

/**
 * Enroll user in a mission — handles re-enrollment after cancellation
 */
export async function enrollInMission(missionId: string): Promise<Participation> {
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) throw new Error('User not authenticated');

  // Check if user has ANY existing participation (including cancelled)
  const { data: existing } = await supabase
    .from('participations')
    .select('*')
    .eq('user_id', userData.user.id)
    .eq('mission_id', missionId)
    .maybeSingle();

  if (existing) {
    if (existing.status === 'enrolled') {
      throw new Error('Already enrolled in this mission');
    }

    // Re-enroll: update cancelled/completed row back to enrolled
    const { data, error } = await supabase
      .from('participations')
      .update({ status: 'enrolled' })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    await supabase.rpc('increment_participants', { mission_id: missionId });

    return data;
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

  // Fresh enrollment
  const { data, error } = await supabase
    .from('participations')
    .insert({
      user_id: userData.user.id,
      mission_id: missionId,
      status: 'enrolled',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await supabase.rpc('increment_participants', { mission_id: missionId });

  return data;
}

/**
 * Cancel enrollment — also decrements participant count
 */
export async function cancelEnrollment(participationId: string): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) throw new Error('User not authenticated');

  // Fetch to get mission_id for decrement
  const { data: participation, error: fetchError } = await supabase
    .from('participations')
    .select('mission_id')
    .eq('id', participationId)
    .eq('user_id', userData.user.id)
    .single();

  if (fetchError) throw new Error(fetchError.message);

  const { error } = await supabase
    .from('participations')
    .update({ status: 'cancelled' })
    .eq('id', participationId)
    .eq('user_id', userData.user.id);

  if (error) throw new Error(error.message);

  await supabase.rpc('decrement_participants', { mission_id: participation.mission_id });
}

/**
 * Get user's missions — enrolled, cancelled, and completed
 */
export async function fetchMyMissions(): Promise<ParticipationWithMission[]> {
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) throw new Error('User not authenticated');

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
        image_url,
        current_participants,
        max_participants
      )
    `)
    .eq('user_id', userData.user.id)
    .in('status', ['enrolled', 'cancelled', 'completed'])
    .order('enrolled_at', { ascending: false });

  if (error) throw new Error(error.message);

  return data as ParticipationWithMission[];
}

/**
 * Check if user is enrolled (only active enrollment)
 */
export async function checkEnrollment(missionId: string): Promise<Participation | null> {
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) return null;

  const { data, error } = await supabase
    .from('participations')
    .select('*')
    .eq('user_id', userData.user.id)
    .eq('mission_id', missionId)
    .eq('status', 'enrolled')
    .maybeSingle();

  if (error) return null;

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

  if (error) throw new Error(error.message);
}