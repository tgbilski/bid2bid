
-- Drop the existing project_shares table and its policies
DROP POLICY IF EXISTS "Users can view shares for their projects" ON public.project_shares;
DROP POLICY IF EXISTS "Users can create shares for their projects" ON public.project_shares;
DROP POLICY IF EXISTS "Users can update shares for their projects" ON public.project_shares;
DROP POLICY IF EXISTS "Users can delete shares for their projects" ON public.project_shares;
DROP POLICY IF EXISTS "Recipients can remove themselves from shared projects" ON public.project_shares;

DROP TABLE IF EXISTS public.project_shares;

-- Create new project_shares table with proper structure
CREATE TABLE public.project_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shared_with_email TEXT NOT NULL,
  permission_level TEXT DEFAULT 'view' CHECK (permission_level IN ('view', 'edit')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, shared_with_email)
);

-- Enable RLS on the new table
ALTER TABLE public.project_shares ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for the new table
CREATE POLICY "Users can view shares for their projects" 
  ON public.project_shares 
  FOR SELECT 
  USING (owner_id = auth.uid() OR shared_with_email = auth.email());

CREATE POLICY "Users can create shares for their projects" 
  ON public.project_shares 
  FOR INSERT 
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update shares for their projects" 
  ON public.project_shares 
  FOR UPDATE 
  USING (owner_id = auth.uid());

CREATE POLICY "Users can delete shares for their projects" 
  ON public.project_shares 
  FOR DELETE 
  USING (owner_id = auth.uid());

CREATE POLICY "Recipients can remove themselves from shared projects" 
  ON public.project_shares 
  FOR DELETE 
  USING (shared_with_email = auth.email());

-- Update the projects table policy to allow shared access
DROP POLICY IF EXISTS "Users can view their own or shared projects" ON public.projects;
CREATE POLICY "Users can view their own or shared projects" 
  ON public.projects 
  FOR SELECT 
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.project_shares 
      WHERE public.project_shares.project_id = public.projects.id 
      AND public.project_shares.shared_with_email = auth.email()
    )
  );

-- Update the vendors table policy to allow shared access
DROP POLICY IF EXISTS "Users can view vendors of their own or shared projects" ON public.vendors;
CREATE POLICY "Users can view vendors of their own or shared projects" 
  ON public.vendors 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE public.projects.id = public.vendors.project_id 
      AND public.projects.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.project_shares 
      WHERE public.project_shares.project_id = public.vendors.project_id 
      AND public.project_shares.shared_with_email = auth.email()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_shares_shared_email ON public.project_shares(shared_with_email);
CREATE INDEX IF NOT EXISTS idx_project_shares_project_id ON public.project_shares(project_id);
CREATE INDEX IF NOT EXISTS idx_project_shares_owner_id ON public.project_shares(owner_id);
