import { enrollInMission } from '@/lib/api/participations';
import { queryKeys } from '@/lib/queryClient';
import { supabase } from '@/lib/supabase';
import { Mission } from '@/types/mission.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useEnrollMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: enrollInMission,
    
    // Optimistic update - update UI immediately before server responds
    onMutate: async (missionId: string) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.missions.detail(missionId) });

      // Snapshot the previous value
      const previousMission = queryClient.getQueryData<Mission>(
        queryKeys.missions.detail(missionId)
      );

      // Optimistically update the mission
      if (previousMission) {
        queryClient.setQueryData<Mission>(
          queryKeys.missions.detail(missionId),
          {
            ...previousMission,
            current_participants: previousMission.current_participants + 1,
          }
        );
      }

      // Return context with previous value for rollback
      return { previousMission, missionId };
    },

    // On error, rollback to previous value
    onError: (error, missionId, context) => {
      if (context?.previousMission) {
        queryClient.setQueryData(
          queryKeys.missions.detail(context.missionId),
          context.previousMission
        );
      }
    },

    // Always refetch after success or error to ensure consistency
    onSettled: async (data, error, missionId) => {
      // Invalidate and refetch mission detail
      await queryClient.invalidateQueries({ 
        queryKey: queryKeys.missions.detail(missionId) 
      });

      // Invalidate my missions list to show newly enrolled mission
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        await queryClient.invalidateQueries({ 
          queryKey: queryKeys.participations.mine(userData.user.id) 
        });
      }

      // Invalidate missions list to update available spots
      await queryClient.invalidateQueries({ 
        queryKey: queryKeys.missions.lists() 
      });
    },
  });
}