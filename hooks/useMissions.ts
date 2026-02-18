import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Mission, MissionWithUserStatus } from '../types/mission.types';
import { Participation } from '../types/participation.types';

// Query Keys
export const missionKeys = {
  all: ['missions'] as const,
  lists: () => [...missionKeys.all, 'list'] as const,
  details: () => [...missionKeys.all, 'detail'] as const,
  detail: (id: string) => [...missionKeys.details(), id] as const,
  userMissions: (userId: string) => ['missions', 'user', userId] as const,
};

// Get current user helper
async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Fetch all missions
export async function fetchMissions(): Promise<Mission[]> {
  const { data, error } = await supabase
    .from('missions')
    .select('*')
    .gte('date', new Date().toISOString())
    .order('date', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

// Fetch single mission with participation status
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
    const { data: participation } = await supabase
      .from('participations')
      .select('id, status')
      .eq('mission_id', id)
      .eq('user_id', userId)
      .eq('status', 'enrolled')
      .maybeSingle();

    return {
      ...mission,
      isUserRegistered: !!participation,
      userParticipationId: participation?.id,
    };
  }

  return mission;
}

// Fetch user's missions
export async function fetchUserMissions(userId: string): Promise<MissionWithUserStatus[]> {
  const { data, error } = await supabase
    .from('participations')
    .select(`
      id,
      status,
      missions (*)
    `)
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

// Register for a mission
export async function registerForMission(
  missionId: string,
  userId: string
): Promise<Participation> {
  // Check current participants
  const { data: mission, error: fetchError } = await supabase
    .from('missions')
    .select('current_participants, max_participants')
    .eq('id', missionId)
    .single();

  if (fetchError) throw new Error(fetchError.message);

  if (mission.current_participants >= mission.max_participants) {
    throw new Error('Cette mission est complète');
  }

  // Create participation
  const { data, error } = await supabase
    .from('participations')
    .insert({
      mission_id: missionId,
      user_id: userId,
      status: 'enrolled',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Update current participants count
  await supabase.rpc('increment_participants', { mission_id: missionId });

  return data;
}

// Cancel participation
export async function cancelParticipation(
  participationId: string,
  missionId: string
): Promise<void> {
  const { error } = await supabase
    .from('participations')
    .update({ status: 'cancelled' })
    .eq('id', participationId);

  if (error) throw new Error(error.message);

  // Decrement participants count
  await supabase.rpc('decrement_participants', { mission_id: missionId });
}

// ============================================
// REACT QUERY HOOKS
// ============================================

// Get all missions
export function useMissions() {
  return useQuery({
    queryKey: missionKeys.lists(),
    queryFn: () => fetchMissions(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}

// Get single mission by ID
export function useMission(id: string) {
  return useQuery({
    queryKey: missionKeys.detail(id),
    queryFn: async () => {
      const user = await getCurrentUser();
      return fetchMission(id, user?.id);
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}

// Get user's registered missions
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

// Register for a mission (with Optimistic UI)
export function useRegisterMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (missionId: string) => {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');
      return registerForMission(missionId, user.id);
    },
    onMutate: async (missionId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: missionKeys.detail(missionId) });

      // Snapshot previous value
      const previousMission = queryClient.getQueryData<MissionWithUserStatus>(
        missionKeys.detail(missionId)
      );

      // Optimistically update
      if (previousMission) {
        queryClient.setQueryData<MissionWithUserStatus>(
          missionKeys.detail(missionId),
          {
            ...previousMission,
            isUserRegistered: true,
            current_participants: previousMission.current_participants + 1,
          }
        );
      }

      return { previousMission };
    },
    onError: (_err, missionId, context) => {
      // Rollback on error
      if (context?.previousMission) {
        queryClient.setQueryData(missionKeys.detail(missionId), context.previousMission);
      }
    },
    onSuccess: async () => {
      const user = await getCurrentUser();
      // Invalidate queries to refetch
      queryClient.invalidateQueries({ queryKey: missionKeys.lists() });
      if (user) {
        queryClient.invalidateQueries({ queryKey: missionKeys.userMissions(user.id) });
      }
    },
  });
}

// Cancel participation (with Optimistic UI)
export function useCancelParticipation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ participationId, missionId }: { participationId: string; missionId: string }) =>
      cancelParticipation(participationId, missionId),
    onMutate: async ({ missionId }) => {
      await queryClient.cancelQueries({ queryKey: missionKeys.detail(missionId) });

      const previousMission = queryClient.getQueryData<MissionWithUserStatus>(
        missionKeys.detail(missionId)
      );

      if (previousMission) {
        queryClient.setQueryData<MissionWithUserStatus>(
          missionKeys.detail(missionId),
          {
            ...previousMission,
            isUserRegistered: false,
            userParticipationId: undefined,
            current_participants: previousMission.current_participants - 1,
          }
        );
      }

      return { previousMission };
    },
    onError: (_err, { missionId }, context) => {
      if (context?.previousMission) {
        queryClient.setQueryData(missionKeys.detail(missionId), context.previousMission);
      }
    },
    onSuccess: async () => {
      const user = await getCurrentUser();
      queryClient.invalidateQueries({ queryKey: missionKeys.lists() });
      if (user) {
        queryClient.invalidateQueries({ queryKey: missionKeys.userMissions(user.id) });
      }
    },
  });
}