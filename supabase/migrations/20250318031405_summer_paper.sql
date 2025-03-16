/*
  # Update Tournament Access and Navigation

  1. Changes
    - Update RLS policies to allow public access to tournaments
    - Add new policies for viewing and updating matches
    - Add new policies for viewing teams

  2. Security
    - Anyone can view tournaments and matches
    - Only tournament creators can create/delete tournaments
    - Anyone can update match scores
*/

-- Update tournament policies
DROP POLICY IF EXISTS "Users can view their own tournaments" ON tournaments;
CREATE POLICY "Anyone can view tournaments"
  ON tournaments
  FOR SELECT
  TO authenticated
  USING (true);

-- Update team policies
DROP POLICY IF EXISTS "Users can manage teams in their tournaments" ON teams;

-- View policy for teams
CREATE POLICY "Anyone can view teams"
  ON teams
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert policy for teams
CREATE POLICY "Tournament creators can create teams"
  ON teams
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tournaments
      WHERE tournaments.id = tournament_id
      AND tournaments.created_by = auth.uid()
    )
  );

-- Update policy for teams
CREATE POLICY "Tournament creators can update teams"
  ON teams
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tournaments
      WHERE tournaments.id = tournament_id
      AND tournaments.created_by = auth.uid()
    )
  );

-- Delete policy for teams
CREATE POLICY "Tournament creators can delete teams"
  ON teams
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tournaments
      WHERE tournaments.id = tournament_id
      AND tournaments.created_by = auth.uid()
    )
  );

-- Update match policies
DROP POLICY IF EXISTS "Users can manage matches in their tournaments" ON matches;

-- View policy for matches
CREATE POLICY "Anyone can view matches"
  ON matches
  FOR SELECT
  TO authenticated
  USING (true);

-- Update policy for match scores
CREATE POLICY "Anyone can update match scores"
  ON matches
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (
    is_completed = true AND
    team1_score IS NOT NULL AND
    team2_score IS NOT NULL
  );

-- Insert policy for matches
CREATE POLICY "Tournament creators can create matches"
  ON matches
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tournaments
      WHERE tournaments.id = tournament_id
      AND tournaments.created_by = auth.uid()
    )
  );