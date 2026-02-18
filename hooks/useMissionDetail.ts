import { fetchMissionById } from '@/lib/api/missions';
import { queryKeys } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';

export function useMissionDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.missions.detail(id),
    queryFn: () => fetchMissionById(id),
    enabled: !!id, // Only run query if id exists
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}