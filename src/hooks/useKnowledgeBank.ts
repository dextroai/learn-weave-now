
import { useState, useEffect } from 'react';
import { Tables } from "@/integrations/supabase/types";
import { useUserTopics } from "@/hooks/useUserTopics";

type BlogPost = Tables<'blog_posts'> & {
  blogs: {
    id: string;
    name: string;
    url: string;
  } | null;
};

type KnowledgeBankPost = BlogPost & {
  addedToKnowledgeBank: number; // timestamp when added
  topicName?: string; // Add topic name
};

export const useKnowledgeBank = () => {
  const [knowledgeBankPosts, setKnowledgeBankPosts] = useState<KnowledgeBankPost[]>([]);
  const { data: userTopics = [] } = useUserTopics();

  useEffect(() => {
    // Load knowledge bank posts from localStorage
    const loadKnowledgeBankPosts = () => {
      const savedPosts = localStorage.getItem('knowledge-bank-posts');
      if (savedPosts) {
        const posts: KnowledgeBankPost[] = JSON.parse(savedPosts);
        
        // Add topic names to posts
        const postsWithTopicNames = posts.map(post => {
          const topic = userTopics.find(t => t.topic_id === post.label_id);
          return {
            ...post,
            topicName: topic?.name || 'Unknown Topic'
          };
        });
        
        // Sort by addedToKnowledgeBank timestamp in descending order (most recent first)
        const sortedPosts = postsWithTopicNames.sort((a, b) => 
          (b.addedToKnowledgeBank || 0) - (a.addedToKnowledgeBank || 0)
        );
        setKnowledgeBankPosts(sortedPosts);
      }
    };

    loadKnowledgeBankPosts();

    // Listen for custom events when posts are added to knowledge bank
    const handlePostAddedToKnowledgeBank = (event: CustomEvent) => {
      const { post } = event.detail;
      if (post) {
        const savedPosts = localStorage.getItem('knowledge-bank-posts');
        const existingPosts: KnowledgeBankPost[] = savedPosts ? JSON.parse(savedPosts) : [];
        
        // Check if post already exists to avoid duplicates
        const postExists = existingPosts.some((p: BlogPost) => p.id === post.id);
        if (!postExists) {
          // Find topic name for the new post
          const topic = userTopics.find(t => t.topic_id === post.label_id);
          
          // Add timestamp when post is added to knowledge bank
          const postWithTimestamp: KnowledgeBankPost = {
            ...post,
            addedToKnowledgeBank: Date.now(),
            topicName: topic?.name || 'Unknown Topic'
          };
          
          // Add new post at the beginning of the array (most recent first)
          const updatedPosts = [postWithTimestamp, ...existingPosts];
          localStorage.setItem('knowledge-bank-posts', JSON.stringify(updatedPosts));
          setKnowledgeBankPosts(updatedPosts);
        }
      }
    };

    window.addEventListener('postAddedToKnowledgeBank', handlePostAddedToKnowledgeBank as EventListener);
    
    return () => {
      window.removeEventListener('postAddedToKnowledgeBank', handlePostAddedToKnowledgeBank as EventListener);
    };
  }, [userTopics]);

  const removeFromKnowledgeBank = (postId: string) => {
    const updatedPosts = knowledgeBankPosts.filter(post => post.id !== postId);
    localStorage.setItem('knowledge-bank-posts', JSON.stringify(updatedPosts));
    setKnowledgeBankPosts(updatedPosts);
  };

  return {
    knowledgeBankPosts,
    removeFromKnowledgeBank
  };
};
