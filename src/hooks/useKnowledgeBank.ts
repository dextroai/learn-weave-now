
import { useState, useEffect } from 'react';
import { Tables } from "@/integrations/supabase/types";
import { useUserTopics } from "@/hooks/useUserTopics";
import { useKnowledgeBankDatabase } from "@/hooks/useKnowledgeBankDatabase";
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

export const useKnowledgeBank = () => {
  const { user } = useAuth();
  const [localKnowledgeBankPosts, setLocalKnowledgeBankPosts] = useState<KnowledgeBankPost[]>([]);
  const { data: userTopics = [] } = useUserTopics();
  
  // Use database implementation if user is authenticated
  const databaseHook = useKnowledgeBankDatabase();

  useEffect(() => {
    // If user is not authenticated, load from localStorage
    if (!user) {
      const loadKnowledgeBankPosts = () => {
        const savedPosts = localStorage.getItem('knowledge-bank-posts');
        if (savedPosts) {
          const posts: KnowledgeBankPost[] = JSON.parse(savedPosts);
          
          const postsWithTopicNames = posts.map(post => {
            const topic = userTopics.find(t => t.topic_id === post.label_id);
            return {
              ...post,
              topicName: topic?.name || 'Unknown Topic'
            };
          });
          
          const sortedPosts = postsWithTopicNames.sort((a, b) => 
            (b.addedToKnowledgeBank || 0) - (a.addedToKnowledgeBank || 0)
          );
          setLocalKnowledgeBankPosts(sortedPosts);
        }
      };

      loadKnowledgeBankPosts();

      const handlePostAddedToKnowledgeBank = (event: CustomEvent) => {
        const { post } = event.detail;
        if (post) {
          const savedPosts = localStorage.getItem('knowledge-bank-posts');
          const existingPosts: KnowledgeBankPost[] = savedPosts ? JSON.parse(savedPosts) : [];
          
          const postExists = existingPosts.some((p: BlogPost) => p.id === post.id);
          if (!postExists) {
            const topic = userTopics.find(t => t.topic_id === post.label_id);
            
            const postWithTimestamp: KnowledgeBankPost = {
              ...post,
              addedToKnowledgeBank: Date.now(),
              topicName: topic?.name || 'Unknown Topic'
            };
            
            const updatedPosts = [postWithTimestamp, ...existingPosts];
            localStorage.setItem('knowledge-bank-posts', JSON.stringify(updatedPosts));
            setLocalKnowledgeBankPosts(updatedPosts);
          }
        }
      };

      window.addEventListener('postAddedToKnowledgeBank', handlePostAddedToKnowledgeBank as EventListener);
      
      return () => {
        window.removeEventListener('postAddedToKnowledgeBank', handlePostAddedToKnowledgeBank as EventListener);
      };
    }
  }, [userTopics, user]);

  const removeFromLocalKnowledgeBank = (postId: string) => {
    const updatedPosts = localKnowledgeBankPosts.filter(post => post.id !== postId);
    localStorage.setItem('knowledge-bank-posts', JSON.stringify(updatedPosts));
    setLocalKnowledgeBankPosts(updatedPosts);
  };

  // Return database implementation for authenticated users
  if (user) {
    return {
      knowledgeBankPosts: databaseHook.knowledgeBankPosts,
      removeFromKnowledgeBank: databaseHook.removeFromKnowledgeBank,
      addToKnowledgeBank: databaseHook.addToKnowledgeBank,
      isLoading: databaseHook.isLoading,
    };
  }

  // Return localStorage implementation for unauthenticated users
  return {
    knowledgeBankPosts: localKnowledgeBankPosts,
    removeFromKnowledgeBank: removeFromLocalKnowledgeBank,
    isLoading: false,
  };
};
