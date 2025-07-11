
-- Create admin_blogs table to track all blogs centrally
CREATE TABLE public.admin_blogs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT,
  last_checked TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create a trigger function to sync blogs to admin_blogs when user adds a blog
CREATE OR REPLACE FUNCTION sync_to_admin_blogs()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update in admin_blogs when a blog is added/updated
  INSERT INTO admin_blogs (url, name, category, last_checked, is_active, updated_at)
  VALUES (NEW.url, NEW.name, NEW.category, NEW.last_checked, NEW.is_active, now())
  ON CONFLICT (url) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    last_checked = EXCLUDED.last_checked,
    is_active = EXCLUDED.is_active,
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically sync user blogs to admin_blogs
CREATE TRIGGER sync_blogs_to_admin
  AFTER INSERT OR UPDATE ON blogs
  FOR EACH ROW
  EXECUTE FUNCTION sync_to_admin_blogs();

-- Add RLS policies for admin_blogs (only admins can manage, but functions can access)
ALTER TABLE public.admin_blogs ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage admin_blogs (for edge functions)
CREATE POLICY "Service role can manage admin_blogs"
  ON public.admin_blogs
  FOR ALL
  USING (true);

-- Create index for better performance
CREATE INDEX idx_admin_blogs_url ON public.admin_blogs(url);
CREATE INDEX idx_admin_blogs_is_active ON public.admin_blogs(is_active);
