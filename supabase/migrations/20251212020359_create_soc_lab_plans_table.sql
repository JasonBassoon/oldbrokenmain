/*
  # Create SOC Lab Plans Table

  1. New Tables
    - `soc_lab_plans`
      - `id` (uuid, primary key)
      - `plan_name` (text) - Name of the plan (e.g., "ChatGPT Plan", "Claude Plan")
      - `version` (text) - Version identifier
      - `content` (text) - Full markdown content of the plan
      - `source` (text) - Source of the plan (chatgpt, claude, etc.)
      - `system_specs` (jsonb) - System specifications used for the plan
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on `soc_lab_plans` table
    - Add policy for public read access (documentation purposes)
*/

CREATE TABLE IF NOT EXISTS soc_lab_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name text NOT NULL,
  version text DEFAULT '1.0',
  content text NOT NULL,
  source text NOT NULL CHECK (source IN ('chatgpt', 'claude', 'custom')),
  system_specs jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE soc_lab_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view SOC lab plans"
  ON soc_lab_plans FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert plans"
  ON soc_lab_plans FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update plans"
  ON soc_lab_plans FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);