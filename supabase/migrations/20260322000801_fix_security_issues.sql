/*
  # Fix Security Issues

  ## Changes Made

  1. **Performance Improvement**
     - Add index on `project_documentation_steps.project_id` for foreign key optimization

  2. **RLS Policy Security Hardening**
     
     ### contact_submissions
     - Replace overly permissive INSERT policy with one that validates data structure
     - Require name, email, and message fields to be non-empty
     
     ### learning_milestones
     - Remove policies that allow unrestricted authenticated access
     - Add admin-only policies (requires user to have admin role in JWT metadata)
     
     ### life_experiences
     - Remove policies that allow unrestricted authenticated access
     - Add admin-only policies (requires user to have admin role in JWT metadata)
     
     ### projects
     - Remove policies that allow unrestricted authenticated access
     - Add admin-only policies (requires user to have admin role in JWT metadata)
     
     ### soc_lab_plans
     - Remove policies that allow unrestricted authenticated access
     - Add admin-only policies (requires user to have admin role in JWT metadata)
     
     ### soc_lab_progress
     - Remove policies that allow unrestricted authenticated access
     - Add admin-only policies (requires user to have admin role in JWT metadata)

  ## Security Notes
  
  - All authenticated write operations now require admin role
  - Contact form submissions require valid data (non-empty fields)
  - Performance improved with proper indexing on foreign keys
  - Auth DB connection strategy must be changed manually in Supabase dashboard settings
*/

-- Add index for foreign key on project_documentation_steps
CREATE INDEX IF NOT EXISTS idx_project_documentation_steps_project_id 
  ON project_documentation_steps(project_id);

-- Fix contact_submissions RLS policy
DROP POLICY IF EXISTS "Allow public to submit contact forms" ON contact_submissions;
CREATE POLICY "Allow valid public contact submissions"
  ON contact_submissions
  FOR INSERT
  TO anon
  WITH CHECK (
    name IS NOT NULL AND 
    name != '' AND
    email IS NOT NULL AND 
    email != '' AND
    message IS NOT NULL AND 
    message != ''
  );

-- Fix learning_milestones RLS policies
DROP POLICY IF EXISTS "Only authenticated users can insert milestones" ON learning_milestones;
DROP POLICY IF EXISTS "Only authenticated users can update milestones" ON learning_milestones;

CREATE POLICY "Only admins can insert milestones"
  ON learning_milestones
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Only admins can update milestones"
  ON learning_milestones
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Fix life_experiences RLS policies
DROP POLICY IF EXISTS "Only authenticated users can delete experiences" ON life_experiences;
DROP POLICY IF EXISTS "Only authenticated users can insert experiences" ON life_experiences;
DROP POLICY IF EXISTS "Only authenticated users can update experiences" ON life_experiences;

CREATE POLICY "Only admins can delete experiences"
  ON life_experiences
  FOR DELETE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Only admins can insert experiences"
  ON life_experiences
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Only admins can update experiences"
  ON life_experiences
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Fix projects RLS policies
DROP POLICY IF EXISTS "Only authenticated users can delete projects" ON projects;
DROP POLICY IF EXISTS "Only authenticated users can insert projects" ON projects;
DROP POLICY IF EXISTS "Only authenticated users can update projects" ON projects;

CREATE POLICY "Only admins can delete projects"
  ON projects
  FOR DELETE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Only admins can insert projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Only admins can update projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Fix soc_lab_plans RLS policies
DROP POLICY IF EXISTS "Authenticated users can insert plans" ON soc_lab_plans;
DROP POLICY IF EXISTS "Authenticated users can update plans" ON soc_lab_plans;

CREATE POLICY "Only admins can insert plans"
  ON soc_lab_plans
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Only admins can update plans"
  ON soc_lab_plans
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Fix soc_lab_progress RLS policies
DROP POLICY IF EXISTS "Authenticated users can delete progress" ON soc_lab_progress;
DROP POLICY IF EXISTS "Authenticated users can insert progress" ON soc_lab_progress;
DROP POLICY IF EXISTS "Authenticated users can update progress" ON soc_lab_progress;

CREATE POLICY "Only admins can delete progress"
  ON soc_lab_progress
  FOR DELETE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Only admins can insert progress"
  ON soc_lab_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Only admins can update progress"
  ON soc_lab_progress
  FOR UPDATE
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );