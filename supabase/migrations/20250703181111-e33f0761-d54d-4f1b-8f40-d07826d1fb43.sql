
-- Add a category column to the blogs table
ALTER TABLE public.blogs 
ADD COLUMN category TEXT CHECK (category IN ('nlp', 'mlops', 'traditional-ml', 'computer-vision'));

-- Add a default value for existing blogs (you can update these manually later)
UPDATE public.blogs 
SET category = 'nlp' 
WHERE category IS NULL;

-- Make the category field required for new blogs
ALTER TABLE public.blogs 
ALTER COLUMN category SET NOT NULL;
