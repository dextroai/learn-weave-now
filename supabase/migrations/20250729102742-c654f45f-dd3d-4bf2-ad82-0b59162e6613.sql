-- Drop the existing unique constraint on url only
ALTER TABLE public.blogs DROP CONSTRAINT blogs_url_key;

-- Add a new unique constraint on the combination of url and user_id
-- This allows multiple users to track the same blog URL
ALTER TABLE public.blogs ADD CONSTRAINT blogs_url_user_unique UNIQUE (url, user_id);