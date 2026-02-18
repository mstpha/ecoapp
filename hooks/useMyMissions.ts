import { fetchMyMissions } from '@/lib/api/participations';
import { queryKeys } from '@/lib/queryClient';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

export function useMyMissions() {
  const { data: userData } = useQuery({
    queryKey: ['user-session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    },
  });

  return useQuery({
    queryKey: queryKeys.participations.mine(userData?.id || ''),
    queryFn: fetchMyMissions,
    enabled: !!userData?.id, // Only run if user is authenticated
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}