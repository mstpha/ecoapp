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
  enrolled_missions_count: number;
  upcoming_missions_count: number;
}

export interface UpdateProfileInput {
  full_name?: string;
  avatar_url?: string;
}