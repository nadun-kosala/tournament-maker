export interface Team {
  id: string;
  name: string;
  members: string[];
  points: number;
  wins: number;
  matchesPlayed: number;
  leadPoints: number;
}

export interface Match {
  id: string;
  teams: [Team | null, Team | null];
  scores: [number | null, number | null];
  isCompleted: boolean;
  round: 'regular' | 'final';
  matchNumber: number;
  pointDifference?: number;
  winner?: string;
  tournamentStatus?: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  created_at: string;
}