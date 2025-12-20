/*
  # Add overview section support to project documentation

  1. Changes
    - Add `is_overview` boolean column to `project_documentation_steps` table
    - Default value is false for implementation steps
    - Mark existing overview sections (step_number = 0) as overview sections
  
  2. Purpose
    - Enables distinction between overview sections (Build Progress, Lab Specs) and numbered implementation steps
    - Overview sections appear at the top without step numbers
    - Implementation steps are numbered sequentially starting from 1
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'project_documentation_steps' AND column_name = 'is_overview'
  ) THEN
    ALTER TABLE project_documentation_steps 
    ADD COLUMN is_overview boolean DEFAULT false;
  END IF;
END $$;

UPDATE project_documentation_steps 
SET is_overview = true 
WHERE step_number = 0;