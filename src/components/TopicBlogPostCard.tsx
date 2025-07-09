
import { Tables } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Eye, Plus, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useKnowledgeBank } from "@/hooks/useKnowledgeBank";
import { useAuth } from "@/contexts/AuthContext";

type BlogPost = Tables<'blog_posts'> & {
  blogs: {
    id: string;
    name: string;
    url: string;
  } | null;
};

interface TopicBlogPostCardProps {
  post: BlogPost;
  onMarkAsRead?: (postId: string) => void;
  onInsightClick?: (post: BlogPost) => void;
  topicName?: string;
  className?: string;
}

export const TopicBlogPostCard = ({ 
  post, 
  onMarkAsRead, 
  onInsightClick,
  topicName = "General",
  className
}: TopicBlogPostCardProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { knowledgeBankPosts, addToKnowledgeBank } = useKnowledgeBank();
  const [isAdded, setIsAdded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Check if this post is in knowledge bank or was already added to notes
  useEffect(() => {
    // Check knowledge bank
    const isInKnowledgeBank = knowledgeBankPosts.some(kbPost => kbPost.id === post.id);
    if (isInKnowledgeBank) {
      setIsAdded(true);
      return;
    }

    // Check if this post was already added to notes (localStorage check for unauthenticated users)
    if (!user) {
      const categoryKey = topicName.toLowerCase().replace(' ', '-');
      const savedPages = localStorage.getItem(`notes-pages-${categoryKey}`);
      
      if (savedPages) {
        const pages = JSON.parse(savedPages);
        for (const page of pages) {
          const notesKey = `interactive-notes-${categoryKey}-${page.id}`;
          const savedNotes = localStorage.getItem(notesKey);
          if (savedNotes) {
            const noteBoxes = JSON.parse(savedNotes);
            const postExists = noteBoxes.some((note: any) => 
              note.content.includes(post.title) && note.content.includes(post.link)
            );
            if (postExists) {
              setIsAdded(true);
              break;
            }
          }
        }
      }
    }
  }, [post.id, post.title, post.link, topicName, knowledgeBankPosts, user]);

  const handleClick = () => {
    if (post.is_new && onMarkAsRead) {
      onMarkAsRead(post.id);
    }
    if (post.link) {
      window.open(post.link, '_blank');
    }
  };

  const handleInsightClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onInsightClick) {
      onInsightClick(post);
    }
  };

  const handleAddToNotes = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isAdded) return;
    
    setIsAdding(true);
    
    try {
      // First, try to add to knowledge bank if user is authenticated
      if (user && addToKnowledgeBank) {
        addToKnowledgeBank(post);
      } else {
        // For unauthenticated users, add to localStorage notes
        const categoryKey = topicName.toLowerCase().replace(' ', '-');
        
        let savedPages = localStorage.getItem(`notes-pages-${categoryKey}`);
        let pages = savedPages ? JSON.parse(savedPages) : [];
        
        if (pages.length === 0) {
          const defaultPage = {
            id: Date.now().toString(),
            title: `${topicName} Links`,
            createdAt: new Date().toISOString(),
          };
          pages = [defaultPage];
          localStorage.setItem(`notes-pages-${categoryKey}`, JSON.stringify(pages));
        }
        
        const targetPage = pages[0];
        const notesKey = `interactive-notes-${categoryKey}-${targetPage.id}`;
        
        const savedNotes = localStorage.getItem(notesKey);
        let noteBoxes = savedNotes ? JSON.parse(savedNotes) : [];
        
        const linkText = `${post.title}\n${post.link}\nSource: ${post.blogs?.name || 'Unknown'}`;
        
        const newNoteBox = {
          id: Date.now().toString(),
          content: linkText,
          x: Math.random() * 300,
          y: Math.random() * 200,
          width: 300,
          height: 120,
        };
        
        const updatedNoteBoxes = [...noteBoxes, newNoteBox];
        localStorage.setItem(notesKey, JSON.stringify(updatedNoteBoxes));
        
        window.dispatchEvent(new CustomEvent('notesUpdated', { 
          detail: { topicName, action: 'add' } 
        }));
      }

      if (post.is_new && onMarkAsRead) {
        onMarkAsRead(post.id);
      }
      
      setIsAdded(true);
      
      toast({
        title: user ? "Added to Knowledge Bank" : "Added to Notes",
        description: user 
          ? `"${post.title}" has been added to your knowledge bank.`
          : `"${post.title}" has been added to your ${topicName} notes.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add post.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div 
      className={cn(
        "flex items-start gap-3 py-3 px-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 group",
        className
      )}
      onClick={handleClick}
    >
      {post.is_new && (
        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
      )}
      
      <div className="flex-1 min-w-0">
        <div className="text-sm text-gray-500 mb-1">
          {post.blogs?.name || 'Unknown Source'}
        </div>
        
        <h3 className="text-base font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {post.title}
        </h3>
        
        <div className="text-xs text-gray-400 mt-1">
          {new Date(post.detected_at).toLocaleDateString()}
        </div>
      </div>

      <div className="flex-shrink-0 ml-2 flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddToNotes}
          disabled={isAdded || isAdding}
          className={cn(
            "transition-colors",
            isAdded && "text-green-600"
          )}
        >
          {isAdded ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          <span className="ml-1">
            {isAdded ? "Added" : isAdding ? "Adding..." : "Add"}
          </span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleInsightClick}
        >
          <Eye className="h-4 w-4" />
          <span className="ml-1">Insight</span>
        </Button>
      </div>
    </div>
  );
};
