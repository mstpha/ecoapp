export type ParticipationStatus = 'enrolled' | 'completed' | 'cancelled';

export interface Participation {
  id: string;
  user_id: string;
  mission_id: string;
  status: ParticipationStatus;
  enrolled_at: string;
}

export interface ParticipationWithMission extends Participation {
  mission: {
    id: string;
    title: string;
    description: string;
    category: string;
    location: string;
    date: string;
    duration_hours: number;
    image_url: string | null;
  };
}

export interface EnrollmentInput {
  mission_id: string;
  user_id: string;
}

export interface CancelEnrollmentInput {
  participation_id: string;
}