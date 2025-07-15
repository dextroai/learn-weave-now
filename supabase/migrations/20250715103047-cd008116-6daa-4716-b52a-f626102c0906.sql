
-- Remove category column from blogs table
ALTER TABLE public.blogs DROP COLUMN category;

-- Remove category column from admin_blogs table
ALTER TABLE public.admin_blogs DROP COLUMN category;

-- Update the trigger function to not include category
CREATE OR REPLACE FUNCTION sync_to_admin_blogs()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert new blog URL if it doesn't exist, or just update the timestamp if it does
  INSERT INTO admin_blogs (url, name, last_checked, is_active, updated_at)
  VALUES (NEW.url, NEW.name, NEW.last_checked, NEW.is_active, now())
  ON CONFLICT (url) DO UPDATE SET
    -- Only update timestamps, don't overwrite admin-managed fields like name
    last_checked = EXCLUDED.last_checked,
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
