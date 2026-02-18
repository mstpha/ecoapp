import { MissionCategory } from '@/types/mission.types';

export interface CategoryInfo {
  value: MissionCategory;
  label: string;
  emoji: string;
  color: string;
}

export const MISSION_CATEGORIES: CategoryInfo[] = [
  {
    value: 'cleanup',
    label: 'Beach Cleanup',
    emoji: '🏖️',
    color: '#3B82F6',
  },
  {
    value: 'planting',
    label: 'Tree Planting',
    emoji: '🌳',
    color: '#10B981',
  },
  {
    value: 'workshop',
    label: 'Zero Waste Workshop',
    emoji: '♻️',
    color: '#8B5CF6',
  },
  {
    value: 'awareness',
    label: 'Awareness Campaign',
    emoji: '📢',
    color: '#F59E0B',
  },
  {
    value: 'recycling',
    label: 'Recycling Drive',
    emoji: '🗑️',
    color: '#EF4444',
  },
];

export function getCategoryInfo(category: MissionCategory): CategoryInfo {
  return MISSION_CATEGORIES.find(c => c.value === category) || MISSION_CATEGORIES[0];
}