/*
  # Add Users Table and Update Team Members

  1. Changes
    - Add users table to store user profiles
    - Update teams table to use user IDs for members
    - Add automatic user profile creation

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

-- First, create a new column for user IDs
ALTER TABLE teams 
ADD COLUMN member_ids uuid[] DEFAULT '{}';

-- Now we can safely drop the old members column and rename the new one
ALTER TABLE teams 
DROP COLUMN members;

ALTER TABLE teams 
ALTER COLUMN member_ids SET NOT NULL,
RENAME COLUMN member_ids TO members;

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