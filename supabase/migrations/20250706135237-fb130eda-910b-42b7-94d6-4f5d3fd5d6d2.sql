
-- Add a favorite column to the vendors table to track which vendor is favorited per project
ALTER TABLE public.vendors ADD COLUMN is_favorite BOOLEAN DEFAULT FALSE;

-- Create an index for better performance when querying favorites
CREATE INDEX idx_vendors_project_favorite ON public.vendors(project_id, is_favorite);
