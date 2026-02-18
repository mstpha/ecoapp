import { fetchMissions } from '@/lib/api/missions';
import { queryKeys } from '@/lib/queryClient';
import { MissionFilters } from '@/types/mission.types';
import { useQuery } from '@tanstack/react-query';

export function useMissions(filters?: MissionFilters) {
  return useQuery({
    queryKey: queryKeys.missions.list(filters),
    queryFn: () => fetchMissions(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}