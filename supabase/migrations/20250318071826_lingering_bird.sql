/*
  # Update Tournament Venues

  1. Changes
    - Replace 'Kandawatta Badminton Court' with 'Kandegoda Badminton Court'
    - Add 'Batapola Badminton Court' to the list of venues

  2. Implementation
    - Drop existing venue check constraint
    - Create new check constraint with updated venue list
*/

-- Drop existing venue check constraint
ALTER TABLE tournaments
DROP CONSTRAINT IF EXISTS tournaments_venue_check;

-- Add new venue check constraint with updated venue list
ALTER TABLE tournaments
ADD CONSTRAINT tournaments_venue_check
CHECK (venue IN (
  'Ambalangoda Urban Council Badminton Court',
  'Badminton Stadium Dharmasoka College',
  'Kandegoda Badminton Court',
  'Batapola Badminton Court'
));