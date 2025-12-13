/*
  # Create SOC Lab Progress Tracking

  1. New Tables
    - `soc_lab_progress`
      - `id` (uuid, primary key)
      - `phase_number` (integer) - Phase number (1-6)
      - `phase_name` (text) - Name of the phase
      - `task_name` (text) - Specific task within the phase
      - `status` (text) - pending, in_progress, completed, blocked
      - `notes` (text) - User notes about the task
      - `started_at` (timestamp) - When task was started
      - `completed_at` (timestamp) - When task was completed
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on `soc_lab_progress` table
    - Public read access for portfolio viewing
    - Authenticated users can manage their progress
*/

CREATE TABLE IF NOT EXISTS soc_lab_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_number integer NOT NULL CHECK (phase_number BETWEEN 1 AND 6),
  phase_name text NOT NULL,
  task_name text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')),
  notes text DEFAULT '',
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE soc_lab_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view SOC lab progress"
  ON soc_lab_progress FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert progress"
  ON soc_lab_progress FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update progress"
  ON soc_lab_progress FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete progress"
  ON soc_lab_progress FOR DELETE
  TO authenticated
  USING (true);