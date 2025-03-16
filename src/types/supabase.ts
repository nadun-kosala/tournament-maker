export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tournaments: {
        Row: {
          id: string
          name: string
          status: 'pending' | 'in_progress' | 'completed'
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: {
          id?: string
          name?: string
          status?: 'pending' | 'in_progress' | 'completed'
          created_at?: string
          updated_at?: string
          created_by: string
        }
        Update: {
          id?: string
          name?: string
          status?: 'pending' | 'in_progress' | 'completed'
          created_at?: string
          updated_at?: string
          created_by?: string
        }
      }
      teams: {
        Row: {
          id: string
          tournament_id: string
          name: string
          members: string[]
          points: number
          wins: number
          matches_played: number
          lead_points: number
          created_at: string
        }
        Insert: {
          id?: string
          tournament_id: string
          name: string
          members: string[]
          points?: number
          wins?: number
          matches_played?: number
          lead_points?: number
          created_at?: string
        }
        Update: {
          id?: string
          tournament_id?: string
          name?: string
          members?: string[]
          points?: number
          wins?: number
          matches_played?: number
          lead_points?: number
          created_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          tournament_id: string
          team1_id: string
          team2_id: string
          team1_score: number | null
          team2_score: number | null
          winner_id: string | null
          match_number: number
          round: 'regular' | 'final'
          is_completed: boolean
          point_difference: number
          created_at: string
        }
        Insert: {
          id?: string
          tournament_id: string
          team1_id: string
          team2_id: string
          team1_score?: number | null
          team2_score?: number | null
          winner_id?: string | null
          match_number: number
          round: 'regular' | 'final'
          is_completed?: boolean
          point_difference?: number
          created_at?: string
        }
        Update: {
          id?: string
          tournament_id?: string
          team1_id?: string
          team2_id?: string
          team1_score?: number | null
          team2_score?: number | null
          winner_id?: string | null
          match_number?: number
          round?: 'regular' | 'final'
          is_completed?: boolean
          point_difference?: number
          created_at?: string
        }
      }
    }
  }
}