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

    onSuccess: async (_, { missionId }) => {
      const { data: userData } = await supabase.auth.getUser();

      // Update mission detail (participant count)
      await queryClient.invalidateQueries({
        queryKey: queryKeys.missions.detail(missionId),
      });

      if (userData.user) {
        // Refresh my missions list so cancelled mission appears
        await queryClient.invalidateQueries({
          queryKey: queryKeys.participations.mine(userData.user.id),
        });

        // Refresh stats so profile counts update immediately
        await queryClient.invalidateQueries({
          queryKey: queryKeys.users.stats(userData.user.id),
        });
      }

      // Update missions list (available spots)
      await queryClient.invalidateQueries({
        queryKey: queryKeys.missions.lists(),
      });
    },
  });
}