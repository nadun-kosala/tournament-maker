/*
  # Update Tournament Access Policies

  1. Changes
    - Drop and recreate tournament policies to ensure proper access control
    - Allow any authenticated user to view all tournaments
    - Keep creator-only restrictions for create/update/delete operations

  2. Security
    - Anyone can view tournaments
    - Only creators can modify their own tournaments
*/

-- Drop all existing tournament policies to avoid conflicts
DROP POLICY IF EXISTS "Users can create tournaments" ON tournaments;
DROP POLICY IF EXISTS "Users can view their own tournaments" ON tournaments;
DROP POLICY IF EXISTS "Users can update their own tournaments" ON tournaments;
DROP POLICY IF EXISTS "Anyone can view tournaments" ON tournaments;
DROP POLICY IF EXISTS "Tournament creators can update their tournaments" ON tournaments;
DROP POLICY IF EXISTS "Tournament creators can delete their tournaments" ON tournaments;

-- Create new policies for tournaments with unique names
CREATE POLICY "view_all_tournaments"
  ON tournaments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "create_own_tournaments"
  ON tournaments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "update_own_tournaments"
  ON tournaments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "delete_own_tournaments"
  ON tournaments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);