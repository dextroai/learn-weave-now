
import { useState, useEffect } from 'react';
import { Tables } from "@/integrations/supabase/types";

type BlogPost = Tables<'blog_posts'> & {
  blogs: {
    id: string;
    name: string;
    url: string;
  } | null;
};

export const useKnowledgeBank = () => {
  const [knowledgeBankPosts, setKnowledgeBankPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    // Load knowledge bank posts from localStorage
    const loadKnowledgeBankPosts = () => {
      const savedPosts = localStorage.getItem('knowledge-bank-posts');
      if (savedPosts) {
        setKnowledgeBankPosts(JSON.parse(savedPosts));
      }
    };

    loadKnowledgeBankPosts();

    // Listen for custom events when posts are added to knowledge bank
    const handlePostAddedToKnowledgeBank = (event: CustomEvent) => {
      const { post } = event.detail;
      if (post) {
        const savedPosts = localStorage.getItem('knowledge-bank-posts');
        const existingPosts = savedPosts ? JSON.parse(savedPosts) : [];
        
        // Check if post already exists to avoid duplicates
        const postExists = existingPosts.some((p: BlogPost) => p.id === post.id);
        if (!postExists) {
          const updatedPosts = [...existingPosts, post];
          localStorage.setItem('knowledge-bank-posts', JSON.stringify(updatedPosts));
          setKnowledgeBankPosts(updatedPosts);
        }
      }
    };

    window.addEventListener('postAddedToKnowledgeBank', handlePostAddedToKnowledgeBank as EventListener);
    
    return () => {
      window.removeEventListener('postAddedToKnowledgeBank', handlePostAddedToKnowledgeBank as EventListener);
    };
  }, []);

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
