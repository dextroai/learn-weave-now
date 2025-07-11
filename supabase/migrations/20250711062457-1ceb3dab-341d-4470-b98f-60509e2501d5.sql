
-- Update the trigger function to only sync URL and timestamps, not overwrite admin-managed fields
CREATE OR REPLACE FUNCTION sync_to_admin_blogs()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert new blog URL if it doesn't exist, or just update the timestamp if it does
  INSERT INTO admin_blogs (url, name, category, last_checked, is_active, updated_at)
  VALUES (NEW.url, NEW.name, NEW.category, NEW.last_checked, NEW.is_active, now())
  ON CONFLICT (url) DO UPDATE SET
    -- Only update timestamps, don't overwrite admin-managed fields like name and category
    last_checked = EXCLUDED.last_checked,
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
