export type MissionCategory = 'cleanup' | 'planting' | 'workshop' | 'awareness' | 'recycling';

export interface Mission {
  id: string;
  title: string;
  description: string;
  category: MissionCategory;
  location: string;
  date: string;
  duration_hours: number;
  max_participants: number;
  current_participants: number;
  image_url: string | null;
  organizer_id: string;
  created_at: string;
  updated_at: string;
}

export interface MissionFilters {
  category?: MissionCategory;
  search?: string;
}

export interface CreateMissionInput {
  title: string;
  description: string;
  category: MissionCategory;
  location: string;
  date: string;
  duration_hours: number;
  max_participants: number;
  image_url?: string;
}