
-- Create knowledge_bank_posts table to store user-specific knowledge bank entries
CREATE TABLE public.knowledge_bank_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Enable RLS on the knowledge_bank_posts table
ALTER TABLE public.knowledge_bank_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for the knowledge_bank_posts table
CREATE POLICY "Users can view their own knowledge bank posts" 
  ON public.knowledge_bank_posts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add posts to their knowledge bank" 
  ON public.knowledge_bank_posts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove posts from their knowledge bank" 
  ON public.knowledge_bank_posts 
  FOR DELETE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their knowledge bank posts" 
  ON public.knowledge_bank_posts 
  FOR UPDATE 
  USING (auth.uid() = user_id);
