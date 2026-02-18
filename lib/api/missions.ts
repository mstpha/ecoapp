import { Mission, MissionFilters } from '@/types/mission.types';
import { supabase } from '../supabase';

/**
 * Fetch all missions with optional filters
 */
export async function fetchMissions(filters?: MissionFilters): Promise<Mission[]> {
  let query = supabase
    .from('missions')
    .select('*')
    .order('date', { ascending: true });

  // Apply category filter
  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  // Apply search filter (searches in title and description)
  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Fetch a single mission by ID
 */
export async function fetchMissionById(id: string): Promise<Mission> {
  const { data, error } = await supabase
    .from('missions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Mission not found');
  }

  return data;
}

/**
 * Create a new mission (for organizers)
 */
export async function createMission(mission: Omit<Mission, 'id' | 'created_at' | 'updated_at' | 'current_participants'>): Promise<Mission> {
  const { data: userData } = await supabase.auth.getUser();
  
  if (!userData.user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('missions')
    .insert({
      ...mission,
      organizer_id: userData.user.id,
      current_participants: 0,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Update mission details
 */
export async function updateMission(id: string, updates: Partial<Mission>): Promise<Mission> {
  const { data, error } = await supabase
    .from('missions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Delete a mission
 */
export async function deleteMission(id: string): Promise<void> {
  const { error } = await supabase
    .from('missions')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}