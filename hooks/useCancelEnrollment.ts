import { cancelEnrollment } from '@/lib/api/participations';
import { queryKeys } from '@/lib/queryClient';
import { supabase } from '@/lib/supabase';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface CancelEnrollmentParams {
  participationId: string;
  missionId: string;
}

export function useCancelEnrollment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ participationId }: CancelEnrollmentParams) => 
      cancelEnrollment(participationId),
    
    onSuccess: async (data, { missionId }) => {
      // Invalidate mission detail to update participant count
      await queryClient.invalidateQueries({ 
        queryKey: queryKeys.missions.detail(missionId) 
      });

      // Invalidate my missions list to remove cancelled mission
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        await queryClient.invalidateQueries({ 
          queryKey: queryKeys.participations.mine(userData.user.id) 
        });
      }

      // Invalidate missions list
      await queryClient.invalidateQueries({ 
        queryKey: queryKeys.missions.lists() 
      });
    },
  });
}