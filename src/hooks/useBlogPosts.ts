
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type BlogPost = Tables<'blog_posts'>;
type Blog = Tables<'blogs'>;

export const useBlogPosts = (category?: string) => {
  return useQuery({
    queryKey: ['blogPosts', category],
    queryFn: async () => {
      let query = supabase
        .from('blog_posts')
        .select(`
          *,
          blogs:blog_id (
            id,
            name,
            url
          )
        `)
        .order('detected_at', { ascending: false })
        .limit(20);

      // Filter by label_id if category corresponds to a topic label
      if (category && category !== 'blogs' && category !== 'archive') {
        // Convert category to label_id (assuming categories map to numeric labels)
        const labelId = parseInt(category.replace('topic-', ''));
        if (!isNaN(labelId)) {
          query = query.eq('label_id', labelId);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });
};

export const useNewBlogPosts = () => {
  return useQuery({
    queryKey: ['newBlogPosts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          blogs:blog_id (
            id,
            name,
            url
          )
        `)
        .eq('is_new', true)
        .order('detected_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });
};

export const useMarkPostAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (postId: string) => {
      const { data, error } = await supabase
        .from('blog_posts')
        .update({ is_new: false })
        .eq('id', postId);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
      queryClient.invalidateQueries({ queryKey: ['newBlogPosts'] });
    },
  });
};
