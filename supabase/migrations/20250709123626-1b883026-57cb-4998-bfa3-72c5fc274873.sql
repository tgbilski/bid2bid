
-- Create subscribers table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT,
  subscription_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create project_shares table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.project_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  shared_with_email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, shared_with_email)
);

-- Enable RLS on both tables
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_shares ENABLE ROW LEVEL SECURITY;

-- RLS policies for subscribers
CREATE POLICY IF NOT EXISTS "Users can view their own subscription" 
  ON public.subscribers 
  FOR SELECT 
  USING (user_id = auth.uid() OR email = auth.email());

CREATE POLICY IF NOT EXISTS "Users can update their own subscription" 
  ON public.subscribers 
  FOR UPDATE 
  USING (user_id = auth.uid() OR email = auth.email());

CREATE POLICY IF NOT EXISTS "Service can insert/update subscriptions" 
  ON public.subscribers 
  FOR INSERT 
  WITH CHECK (true);

-- RLS policies for project_shares
CREATE POLICY IF NOT EXISTS "Users can view shares for their projects" 
  ON public.project_shares 
  FOR SELECT 
  USING (owner_id = auth.uid() OR shared_with_email = auth.email());

CREATE POLICY IF NOT EXISTS "Users can create shares for their projects" 
  ON public.project_shares 
  FOR INSERT 
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can update shares for their projects" 
  ON public.project_shares 
  FOR UPDATE 
  USING (owner_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can delete shares for their projects" 
  ON public.project_shares 
  FOR DELETE 
  USING (owner_id = auth.uid());

-- Update vendors table policies to allow shared access
DROP POLICY IF EXISTS "Users can view vendors of their own projects" ON public.vendors;
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

-- Update projects table policies to allow shared access
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
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
