export interface Team {
  id: string;
  name: string;
  members: string[];
  points: number;
  wins: number;
  matchesPlayed: number;
}

export interface Match {
  id: string;
  teams: [Team | null, Team | null];
  scores: [number | null, number | null];
  isCompleted: boolean;
  round: 'regular' | 'final';
  matchNumber: number;
}