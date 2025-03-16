/*
  # Add Users Table and Update Team Members

  1. Changes
    - Add users table to store user profiles
    - Update teams table to use user IDs for members
    - Add automatic user profile creation
    - Handle foreign key dependencies properly

  2. Security
    - Enable RLS on users table
    - Add policies for viewing and updating user profiles
*/

-- Create users table
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users NOT NULL,
  full_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read all user profiles
CREATE POLICY "Users can view all profiles"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- First, drop foreign key constraints from matches table
ALTER TABLE matches
DROP CONSTRAINT IF EXISTS matches_team1_id_fkey,
DROP CONSTRAINT IF EXISTS matches_team2_id_fkey,
DROP CONSTRAINT IF EXISTS matches_winner_id_fkey;

-- Create temporary table for the transition
CREATE TABLE teams_new (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid REFERENCES tournaments ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  members uuid[] NOT NULL DEFAULT '{}',
  points integer DEFAULT 0,
  wins integer DEFAULT 0,
  matches_played integer DEFAULT 0,
  lead_points integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Copy data from old table (members will be empty arrays since we're transitioning)
INSERT INTO teams_new (id, tournament_id, name, points, wins, matches_played, lead_points, created_at)
SELECT id, tournament_id, name, points, wins, matches_played, lead_points, created_at
FROM teams;

-- Drop old table
DROP TABLE teams CASCADE;

-- Rename new table to teams
ALTER TABLE teams_new RENAME TO teams;

-- Re-add foreign key constraints to matches table
ALTER TABLE matches
ADD CONSTRAINT matches_team1_id_fkey FOREIGN KEY (team1_id) REFERENCES teams(id) ON DELETE CASCADE,
ADD CONSTRAINT matches_team2_id_fkey FOREIGN KEY (team2_id) REFERENCES teams(id) ON DELETE CASCADE,
ADD CONSTRAINT matches_winner_id_fkey FOREIGN KEY (winner_id) REFERENCES teams(id) ON DELETE CASCADE;

-- Create function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();