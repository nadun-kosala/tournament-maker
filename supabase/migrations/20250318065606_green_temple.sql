/*
  # Update Tournament Access Policies

  1. Changes
    - Allow any authenticated user to view all tournaments
    - Keep creator-only restrictions for create/update operations
    - Add policies for tournament deletion

  2. Security
    - Anyone can view tournaments
    - Only creators can modify their own tournaments
*/

-- Drop existing tournament policies
DROP POLICY IF EXISTS "Users can create tournaments" ON tournaments;
DROP POLICY IF EXISTS "Users can view their own tournaments" ON tournaments;
DROP POLICY IF EXISTS "Users can update their own tournaments" ON tournaments;

-- Create new policies for tournaments
CREATE POLICY "Anyone can view tournaments"
  ON tournaments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create tournaments"
  ON tournaments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Tournament creators can update their tournaments"
  ON tournaments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Tournament creators can delete their tournaments"
  ON tournaments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);