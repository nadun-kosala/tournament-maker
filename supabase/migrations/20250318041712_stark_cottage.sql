/*
  # Add venue field to tournaments table

  1. Changes
    - Add venue field to tournaments table
    - Add check constraint for valid venues
*/

ALTER TABLE tournaments
ADD COLUMN venue text;

ALTER TABLE tournaments
ADD CONSTRAINT tournaments_venue_check
CHECK (venue IN (
  'Ambalangoda Urban Council Badminton Court',
  'Badminton Stadium Dharmasoka College',
  'Kandawatta Badminton Court'
));