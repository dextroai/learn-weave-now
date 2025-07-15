
-- Remove name column from blogs table
ALTER TABLE public.blogs DROP COLUMN IF EXISTS name;

-- Remove name column from admin_blogs table  
ALTER TABLE public.admin_blogs DROP COLUMN IF EXISTS name;
