
import { Tables } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Eye, Plus, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useKnowledgeBank } from "@/hooks/useKnowledgeBank";
import { useAuth } from "@/contexts/AuthContext";

type BlogPost = Tables<'blog_posts'> & {
  blogs: {
    id: string;
    name: string;
    url: string;
  } | null;
};

interface BlogPostCardProps {
  post: BlogPost;
  onMarkAsRead?: (postId: string) => void;
  onInsightClick?: (post: BlogPost) => void;
  className?: string;
}

export const BlogPostCard = ({ 
  post, 
  onMarkAsRead, 
  onInsightClick,
  className
}: BlogPostCardProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { knowledgeBankPosts, addToKnowledgeBank } = useKnowledgeBank();
  const [isAdding, setIsAdding] = useState(false);

  // Check if post is already in knowledge bank
  const isInKnowledgeBank = knowledgeBankPosts.some(kbPost => kbPost.id === post.id);

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

  const handleAddToKnowledgeBank = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isInKnowledgeBank) return;
    
    setIsAdding(true);
    
    try {
      if (user && addToKnowledgeBank) {
        // For authenticated users, use database
        addToKnowledgeBank(post);
      } else {
        // For unauthenticated users, use custom event
        window.dispatchEvent(new CustomEvent('postAddedToKnowledgeBank', {
          detail: { post }
        }));
      }

      if (post.is_new && onMarkAsRead) {
        onMarkAsRead(post.id);
      }
      
      toast({
        title: "Added to Knowledge Bank",
        description: `"${post.title}" has been added to your knowledge bank.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add post to knowledge bank.",
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
          onClick={handleAddToKnowledgeBank}
          disabled={isInKnowledgeBank || isAdding}
          className={cn(
            "transition-colors",
            isInKnowledgeBank && "text-green-600"
          )}
        >
          {isInKnowledgeBank ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          <span className="ml-1">
            {isInKnowledgeBank ? "Added" : isAdding ? "Adding..." : "Add"}
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
