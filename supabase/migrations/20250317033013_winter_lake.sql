/*
  # Tournament Database Schema

  1. New Tables
    - `tournaments`
      - `id` (uuid, primary key)
      - `name` (text)
      - `status` (text) - 'pending', 'in_progress', 'completed'
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `created_by` (uuid, references auth.users)

    - `teams`
      - `id` (uuid, primary key)
      - `tournament_id` (uuid, references tournaments)
      - `name` (text)
      - `members` (text[])
      - `points` (integer)
      - `wins` (integer)
      - `matches_played` (integer)
      - `lead_points` (integer)
      - `created_at` (timestamp)

    - `matches`
      - `id` (uuid, primary key)
      - `tournament_id` (uuid, references tournaments)
      - `team1_id` (uuid, references teams)
      - `team2_id` (uuid, references teams)
      - `team1_score` (integer)
      - `team2_score` (integer)
      - `winner_id` (uuid, references teams)
      - `match_number` (integer)
      - `round` (text) - 'regular' or 'final'
      - `is_completed` (boolean)
      - `point_difference` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their tournaments
*/

-- Create tournaments table
CREATE TABLE tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'New Tournament',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users NOT NULL
);

-- Create teams table
CREATE TABLE teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid REFERENCES tournaments ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  members text[] NOT NULL DEFAULT '{}',
  points integer DEFAULT 0,
  wins integer DEFAULT 0,
  matches_played integer DEFAULT 0,
  lead_points integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create matches table
CREATE TABLE matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid REFERENCES tournaments ON DELETE CASCADE NOT NULL,
  team1_id uuid REFERENCES teams ON DELETE CASCADE NOT NULL,
  team2_id uuid REFERENCES teams ON DELETE CASCADE NOT NULL,
  team1_score integer,
  team2_score integer,
  winner_id uuid REFERENCES teams ON DELETE CASCADE,
  match_number integer NOT NULL,
  round text NOT NULL CHECK (round IN ('regular', 'final')),
  is_completed boolean DEFAULT false,
  point_difference integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Create policies for tournaments
CREATE POLICY "Users can create tournaments"
  ON tournaments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can view their own tournaments"
  ON tournaments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can update their own tournaments"
  ON tournaments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

-- Create policies for teams
CREATE POLICY "Users can manage teams in their tournaments"
  ON teams
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tournaments
      WHERE tournaments.id = teams.tournament_id
      AND tournaments.created_by = auth.uid()
    )
  );

-- Create policies for matches
CREATE POLICY "Users can manage matches in their tournaments"
  ON matches
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tournaments
      WHERE tournaments.id = matches.tournament_id
      AND tournaments.created_by = auth.uid()
    )
  );

-- Create function to update tournament status
CREATE OR REPLACE FUNCTION update_tournament_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_completed AND NEW.round = 'final' THEN
    UPDATE tournaments 
    SET status = 'completed'
    WHERE id = NEW.tournament_id;
  ELSIF NEW.is_completed AND OLD.is_completed = false THEN
    UPDATE tournaments 
    SET status = 'in_progress'
    WHERE id = NEW.tournament_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for tournament status updates
CREATE TRIGGER update_tournament_status_trigger
AFTER UPDATE ON matches
FOR EACH ROW
EXECUTE FUNCTION update_tournament_status();