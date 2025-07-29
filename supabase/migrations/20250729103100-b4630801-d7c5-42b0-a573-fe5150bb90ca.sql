-- Fix the sync trigger to not reference non-existent name column
CREATE OR REPLACE FUNCTION public.sync_to_admin_blogs()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Insert new blog URL if it doesn't exist, or just update the timestamp if it does
  INSERT INTO admin_blogs (url, last_checked, is_active, updated_at)
  VALUES (NEW.url, NEW.last_checked, NEW.is_active, now())
  ON CONFLICT (url) DO UPDATE SET
    -- Only update timestamps, don't overwrite admin-managed fields
    last_checked = EXCLUDED.last_checked,
    updated_at = now();
  
  RETURN NEW;
END;
$function$