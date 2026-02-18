import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Mission, MissionWithUserStatus } from '../types/mission.types';
import { Participation } from '../types/participation.types';

export const missionKeys = {
  all: ['missions'] as const,
  lists: () => [...missionKeys.all, 'list'] as const,
  details: () => [...missionKeys.all, 'detail'] as const,
  detail: (id: string) => [...missionKeys.details(), id] as const,
  userMissions: (userId: string) => ['missions', 'user', userId] as const,
};

async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function fetchMissions(): Promise<Mission[]> {
  const { data, error } = await supabase
    .from('missions')
    .select('*')
    .gte('date', new Date().toISOString())
    .order('date', { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}

/**
 * Fetch single mission with participation status.
 * Returns isUserRegistered=true only if enrolled.
 * Returns userParticipationId for ANY status (enrolled or cancelled)
 * so the detail screen can show re-enroll button.
 */
export async function fetchMission(
  id: string,
  userId?: string
): Promise<MissionWithUserStatus> {
  const { data: mission, error } = await supabase
    .from('missions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);

  if (userId) {
    // Fetch ANY participation (enrolled OR cancelled) for this user+mission
    const { data: participation } = await supabase
      .from('participations')
      .select('id, status')
      .eq('mission_id', id)
      .eq('user_id', userId)
      .maybeSingle();

    return {
      ...mission,
      isUserRegistered: participation?.status === 'enrolled',
      userParticipationId: participation?.id, // present for cancelled too
    };
  }

  return { ...mission, isUserRegistered: false };
}

export async function fetchUserMissions(userId: string): Promise<MissionWithUserStatus[]> {
  const { data, error } = await supabase
    .from('participations')
    .select(`id, status, missions (*)`)
    .eq('user_id', userId)
    .eq('status', 'enrolled')
    .order('enrolled_at', { ascending: false });

  if (error) throw new Error(error.message);

  return (
    data?.map((p) => ({
      ...(p.missions as unknown as Mission),
      isUserRegistered: true,
      userParticipationId: p.id,
    })) || []
  );
}

export async function registerForMission(
  missionId: string,
  userId: string
): Promise<Participation> {
  const { data: mission, error: fetchError } = await supabase
    .from('missions')
    .select('current_participants, max_participants')
    .eq('id', missionId)
    .single();

  if (fetchError) throw new Error(fetchError.message);

  if (mission.current_participants >= mission.max_participants) {
    throw new Error('Cette mission est complète');
  }

  // Check for existing participation (any status)
  const { data: existing } = await supabase
    .from('participations')
    .select('id, status')
    .eq('mission_id', missionId)
    .eq('user_id', userId)
    .maybeSingle();

  let data;
  let error;

  if (existing) {
    if (existing.status === 'enrolled') {
      throw new Error('Vous êtes déjà inscrit à cette mission');
    }
    // Re-enroll: update cancelled row
    ({ data, error } = await supabase
      .from('participations')
      .update({ status: 'enrolled' })
      .eq('id', existing.id)
      .select()
      .single());
  } else {
    // Fresh enrollment
    ({ data, error } = await supabase
      .from('participations')
      .insert({ mission_id: missionId, user_id: userId, status: 'enrolled' })
      .select()
      .single());
  }

  if (error) throw new Error(error.message);

  await supabase.rpc('increment_participants', { mission_id: missionId });

  return data;
}

export async function cancelParticipation(
  participationId: string,
  missionId: string
): Promise<void> {
  const { error } = await supabase
    .from('participations')
    .update({ status: 'cancelled' })
    .eq('id', participationId);

  if (error) throw new Error(error.message);

  await supabase.rpc('decrement_participants', { mission_id: missionId });
}

// ============================================
// REACT QUERY HOOKS
// ============================================

export function useMissions() {
  return useQuery({
    queryKey: missionKeys.lists(),
    queryFn: fetchMissions,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}

export function useMission(id: string) {
  return useQuery({
    queryKey: missionKeys.detail(id),
    queryFn: async () => {
      const user = await getCurrentUser();
      return fetchMission(id, user?.id);
    },
    staleTime: 0, // Always fresh so cancelled/enrolled state is accurate
    gcTime: 1000 * 60 * 30,
  });
}

export function useUserMissions() {
  return useQuery({
    queryKey: ['user-missions'],
    queryFn: async () => {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');
      return fetchUserMissions(user.id);
    },
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });
}

export function useRegisterMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (missionId: string) => {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');
      return registerForMission(missionId, user.id);
    },
    onSuccess: async (_, missionId) => {
      const user = await getCurrentUser();
      // Refetch mission detail so button state updates
      queryClient.invalidateQueries({ queryKey: missionKeys.detail(missionId) });
      queryClient.invalidateQueries({ queryKey: missionKeys.lists() });
      if (user) {
        queryClient.invalidateQueries({ queryKey: missionKeys.userMissions(user.id) });
        // Also invalidate participations for my-missions screen
        queryClient.invalidateQueries({ queryKey: ['participations', 'mine', user.id] });
        // Invalidate stats
        queryClient.invalidateQueries({ queryKey: ['users', 'stats', user.id] });
      }
    },
  });
}

export function useCancelParticipation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ participationId, missionId }: { participationId: string; missionId: string }) =>
      cancelParticipation(participationId, missionId),
    onSuccess: async (_, { missionId }) => {
      const user = await getCurrentUser();
      queryClient.invalidateQueries({ queryKey: missionKeys.detail(missionId) });
      queryClient.invalidateQueries({ queryKey: missionKeys.lists() });
      if (user) {
        queryClient.invalidateQueries({ queryKey: missionKeys.userMissions(user.id) });
        queryClient.invalidateQueries({ queryKey: ['participations', 'mine', user.id] });
        queryClient.invalidateQueries({ queryKey: ['users', 'stats', user.id] });
      }
    },
  });
}