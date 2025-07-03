
-- Add label_id column to blog_posts table
ALTER TABLE public.blog_posts 
ADD COLUMN label_id INTEGER;

-- Create an index on label_id for better performance
CREATE INDEX idx_blog_posts_label_id ON public.blog_posts(label_id);

-- Add a constraint to ensure label_id is positive when not null
ALTER TABLE public.blog_posts 
ADD CONSTRAINT blog_posts_label_id_positive 
CHECK (label_id IS NULL OR label_id > 0);
