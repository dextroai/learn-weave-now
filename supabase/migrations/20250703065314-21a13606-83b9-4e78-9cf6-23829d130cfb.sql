
-- Create table for storing monitored blogs
CREATE TABLE public.blogs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users NOT NULL,
  added_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_checked TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for storing blog posts
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_id UUID REFERENCES public.blogs(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  link TEXT,
  published_date TIMESTAMP WITH TIME ZONE,
  summary TEXT,
  content TEXT,
  is_new BOOLEAN NOT NULL DEFAULT true,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for user interests/topics
CREATE TABLE public.user_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT 'bg-gray-100',
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Create table to link blog posts with topics
CREATE TABLE public.post_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE NOT NULL,
  topic_id UUID REFERENCES public.user_topics(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, topic_id)
);

-- Enable Row Level Security
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_topics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blogs
CREATE POLICY "Users can view their own blogs" 
  ON public.blogs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own blogs" 
  ON public.blogs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own blogs" 
  ON public.blogs 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own blogs" 
  ON public.blogs 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for blog_posts (users can see posts from their blogs)
CREATE POLICY "Users can view posts from their blogs" 
  ON public.blog_posts 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.blogs 
    WHERE blogs.id = blog_posts.blog_id 
    AND blogs.user_id = auth.uid()
  ));

CREATE POLICY "Users can create posts for their blogs" 
  ON public.blog_posts 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.blogs 
    WHERE blogs.id = blog_posts.blog_id 
    AND blogs.user_id = auth.uid()
  ));

CREATE POLICY "Users can update posts from their blogs" 
  ON public.blog_posts 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.blogs 
    WHERE blogs.id = blog_posts.blog_id 
    AND blogs.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete posts from their blogs" 
  ON public.blog_posts 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.blogs 
    WHERE blogs.id = blog_posts.blog_id 
    AND blogs.user_id = auth.uid()
  ));

-- RLS Policies for user_topics
CREATE POLICY "Users can manage their own topics" 
  ON public.user_topics 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for post_topics
CREATE POLICY "Users can manage post topics for their posts" 
  ON public.post_topics 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.blog_posts bp
    JOIN public.blogs b ON bp.blog_id = b.id
    WHERE bp.id = post_topics.post_id 
    AND b.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.blog_posts bp
    JOIN public.blogs b ON bp.blog_id = b.id
    WHERE bp.id = post_topics.post_id 
    AND b.user_id = auth.uid()
  ));

-- Create indexes for better performance
CREATE INDEX idx_blogs_user_id ON public.blogs(user_id);
CREATE INDEX idx_blog_posts_blog_id ON public.blog_posts(blog_id);
CREATE INDEX idx_blog_posts_detected_at ON public.blog_posts(detected_at DESC);
CREATE INDEX idx_user_topics_user_id ON public.user_topics(user_id);
CREATE INDEX idx_post_topics_post_id ON public.post_topics(post_id);
CREATE INDEX idx_post_topics_topic_id ON public.post_topics(topic_id);
