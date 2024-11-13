export interface Team {
  id: string;
  name: string;
  members: string[];
  points: number;
  wins: number;
  matchesPlayed: number;
  leadPoints: number; // Added for storing point differences
}

export interface Match {
  id: string;
  teams: [Team | null, Team | null];
  scores: [number | null, number | null];
  isCompleted: boolean;
  round: 'regular' | 'final';
  matchNumber: number;
  pointDifference?: number; // Added to store the point difference
  winner?: string; // Added to store winner's ID
}