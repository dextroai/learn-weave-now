
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from "@/integrations/supabase/types";
import { useUserTopics } from "@/hooks/useUserTopics";
import { useAuth } from "@/contexts/AuthContext";

type BlogPost = Tables<'blog_posts'> & {
  blogs: {
    id: string;
    name: string;
    url: string;
  } | null;
};

type KnowledgeBankPost = BlogPost & {
  addedToKnowledgeBank: number;
  topicName?: string;
};

export const useKnowledgeBankDatabase = () => {
  const { user } = useAuth();
  const { data: userTopics = [] } = useUserTopics();
  const queryClient = useQueryClient();

  // Fetch knowledge bank posts from database
  const { data: knowledgeBankPosts = [], isLoading } = useQuery({
    queryKey: ['knowledge-bank-posts', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('knowledge_bank_posts')
        .select(`
          *,
          blog_posts!inner (
            *,
            blogs:blog_id (
              id,
              name,
              url
            )
          )
        `)
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      if (error) {
        console.error('Error fetching knowledge bank posts:', error);
        throw error;
      }

      // Transform the data to match the expected format
      const transformedPosts: KnowledgeBankPost[] = (data || []).map((item) => {
        const post = item.blog_posts;
        const topic = userTopics.find(t => t.topic_id === post.label_id);
        
        return {
          ...post,
          addedToKnowledgeBank: new Date(item.added_at).getTime(),
          topicName: topic?.name || 'Unknown Topic'
        };
      });

      return transformedPosts;
    },
    enabled: !!user?.id,
  });

  // Add post to knowledge bank
  const addToKnowledgeBankMutation = useMutation({
    mutationFn: async (post: BlogPost) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('knowledge_bank_posts')
        .insert({
          user_id: user.id,
          post_id: post.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-bank-posts'] });
    },
  });

  // Remove post from knowledge bank
  const removeFromKnowledgeBankMutation = useMutation({
    mutationFn: async (postId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('knowledge_bank_posts')
        .delete()
        .eq('user_id', user.id)
        .eq('post_id', postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-bank-posts'] });
    },
  });

  const addToKnowledgeBank = (post: BlogPost) => {
    addToKnowledgeBankMutation.mutate(post);
  };

  const removeFromKnowledgeBank = (postId: string) => {
    removeFromKnowledgeBankMutation.mutate(postId);
  };

  return {
    knowledgeBankPosts,
    isLoading,
    addToKnowledgeBank,
    removeFromKnowledgeBank,
    isAddingToKnowledgeBank: addToKnowledgeBankMutation.isPending,
    isRemovingFromKnowledgeBank: removeFromKnowledgeBankMutation.isPending,
  };
};
