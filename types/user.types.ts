export interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  total_missions_completed: number;
  created_at: string;
  updated_at: string;
}

export interface UserStats {
  total_missions_completed: number;
  enrolled_missions_count: number;   // active (non-cancelled) only
  upcoming_missions_count: number;   // future non-cancelled only
  total_hours_volunteered: number;   // hours from past missions
}

export interface UpdateProfileInput {
  full_name?: string;
  avatar_url?: string;
}