import { fetchUserStats } from '@/lib/api/users';
import { queryKeys } from '@/lib/queryClient';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

export function useUserStats() {
  const { data: userData } = useQuery({
    queryKey: ['user-session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    },
  });

  return useQuery({
    queryKey: queryKeys.users.stats(userData?.id || ''),
    queryFn: fetchUserStats,
    enabled: !!userData?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}