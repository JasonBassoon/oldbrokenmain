/*
  # Add Project Documentation Support

  1. New Tables
    - `project_documentation_steps`
      - `id` (uuid, primary key)
      - `project_id` (uuid, foreign key to projects)
      - `step_number` (integer)
      - `title` (text)
      - `commands` (text array)
      - `rationale` (text)
      - `evidence_notes` (text, optional)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `project_documentation_steps` table
    - Add policy for public read access to documentation
*/

CREATE TABLE IF NOT EXISTS project_documentation_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  step_number integer NOT NULL,
  title text NOT NULL,
  commands text[] DEFAULT '{}',
  rationale text NOT NULL,
  evidence_notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE project_documentation_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view documentation steps"
  ON project_documentation_steps
  FOR SELECT
  TO anon, authenticated
  USING (true);