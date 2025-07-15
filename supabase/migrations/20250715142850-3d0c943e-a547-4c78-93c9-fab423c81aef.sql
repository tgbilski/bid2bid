
-- Update project_shares table to support multiple emails per project
-- We'll keep the existing structure but ensure we can have multiple rows per project
-- The existing UNIQUE constraint on (project_id, shared_with_email) already handles this

-- Add an index for better performance when querying shared projects
CREATE INDEX IF NOT EXISTS idx_project_shares_shared_email ON public.project_shares(shared_with_email);
CREATE INDEX IF NOT EXISTS idx_project_shares_project_id ON public.project_shares(project_id);

-- Add a policy for recipients to remove themselves from shared projects
CREATE POLICY IF NOT EXISTS "Recipients can remove themselves from shared projects" 
  ON public.project_shares 
  FOR DELETE 
  USING (shared_with_email = auth.email());
