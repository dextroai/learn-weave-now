
-- Add topic_id column to user_topics table
ALTER TABLE public.user_topics 
ADD COLUMN topic_id INTEGER;

-- Create a function to assign sequential topic_id values for each user
CREATE OR REPLACE FUNCTION assign_topic_ids()
RETURNS void AS $$
DECLARE
    user_record RECORD;
    topic_record RECORD;
    counter INTEGER;
BEGIN
    -- Loop through each user
    FOR user_record IN SELECT DISTINCT user_id FROM public.user_topics LOOP
        counter := 1;
        -- Loop through topics for this user, ordered by creation date
        FOR topic_record IN 
            SELECT id FROM public.user_topics 
            WHERE user_id = user_record.user_id 
            ORDER BY created_at ASC 
        LOOP
            -- Assign sequential topic_id
            UPDATE public.user_topics 
            SET topic_id = counter 
            WHERE id = topic_record.id;
            counter := counter + 1;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to assign topic_ids to existing records
SELECT assign_topic_ids();

-- Drop the function as it's no longer needed
DROP FUNCTION assign_topic_ids();

-- Make topic_id NOT NULL after assigning values
ALTER TABLE public.user_topics 
ALTER COLUMN topic_id SET NOT NULL;

-- Add unique constraint for topic_id per user
ALTER TABLE public.user_topics 
ADD CONSTRAINT user_topics_topic_id_unique UNIQUE (user_id, topic_id);

-- Add constraint to ensure topic_id is positive
ALTER TABLE public.user_topics 
ADD CONSTRAINT user_topics_topic_id_positive 
CHECK (topic_id > 0);

-- Create index for better performance
CREATE INDEX idx_user_topics_topic_id ON public.user_topics(topic_id);
