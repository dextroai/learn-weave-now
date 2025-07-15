
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useUserTopics } from '@/hooks/useUserTopics';

type BlogPost = Tables<'blog_posts'> & {
  blogs: {
    id: string;
    url: string;
  } | null;
  topicName?: string;
};

export const useBlogPosts = () => {
  const { data: userTopics = [] } = useUserTopics();

  return useQuery({
    queryKey: ['blogPosts'],
    queryFn: async () => {
      console.log('Fetching blog posts...');
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          blogs:blog_id (
            id,
            url
          )
        `)
        .order('detected_at', { ascending: false });

      if (error) {
        console.error('Error fetching blog posts:', error);
        throw error;
      }

      console.log('Fetched blog posts:', data);
      
      // Add topic names and blog names derived from URL
      const postsWithTopicNames = (data || []).map((post: any) => {
        const topic = userTopics.find(t => t.topic_id === post.label_id);
        
        // Extract blog name from URL
        let blogName = 'Unknown Source';
        if (post.blogs?.url) {
          try {
            const url = new URL(post.blogs.url);
            blogName = url.hostname.replace('www.', '');
          } catch {
            blogName = post.blogs.url;
          }
        }
        
        return {
          ...post,
          blogs: post.blogs ? {
            ...post.blogs,
            name: blogName
          } : null,
          topicName: topic?.name
        };
      });

      return postsWithTopicNames;
    },
  });
};

export const useMarkPostAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from('blog_posts')
        .update({ is_new: false })
        .eq('id', postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
    },
  });
};
