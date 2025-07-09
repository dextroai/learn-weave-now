
import { Tables } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  variant?: "default" | "horizontal";
  className?: string;
  showAddButton?: boolean;
}

export const BlogPostCard = ({ 
  post, 
  onMarkAsRead, 
  onInsightClick,
  variant = "default",
  className,
  showAddButton = false
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
        addToKnowledgeBank(post);
      } else {
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

  // Get topic label - you can customize this logic based on your data structure
  const getTopicLabel = () => {
    // This is a placeholder - you might want to derive this from post.label_id or other data
    if (post.blogs?.name?.toLowerCase().includes('nvidia')) return 'MLOps';
    if (post.blogs?.name?.toLowerCase().includes('ai')) return 'AI';
    if (post.blogs?.name?.toLowerCase().includes('machine learning')) return 'ML';
    return 'Tech'; // Default fallback
  };

  if (variant === "horizontal") {
    return (
      <div 
        className={cn(
          "flex flex-col w-80 flex-shrink-0 bg-white rounded-lg border border-gray-200 hover:shadow-md cursor-pointer group transition-all duration-200",
          className
        )}
        onClick={handleClick}
      >
        <div className="p-4 flex-1 flex flex-col">
          {/* New indicator and source */}
          <div className="flex items-start justify-between mb-3">
            <div className="text-sm text-gray-500 truncate flex-1 mr-2">
              {post.blogs?.name || 'Unknown Source'}
            </div>
            {post.is_new && (
              <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
            )}
          </div>
          
          {/* Title */}
          <h3 className="text-base font-medium text-gray-900 line-clamp-3 group-hover:text-blue-600 transition-colors mb-3 flex-1">
            {post.title}
          </h3>
          
          {/* Date */}
          <div className="text-xs text-gray-400 mb-4">
            {new Date(post.detected_at).toLocaleDateString()}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mt-auto">
            {showAddButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAddToKnowledgeBank}
                disabled={isInKnowledgeBank || isAdding}
                className={cn(
                  "transition-colors flex-1 text-xs",
                  isInKnowledgeBank && "text-green-600"
                )}
              >
                {isInKnowledgeBank ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                <span className="ml-1">
                  {isInKnowledgeBank ? "Added" : isAdding ? "Adding..." : "Add"}
                </span>
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleInsightClick}
              className={cn("text-xs", showAddButton ? "flex-1" : "w-full")}
            >
              <Eye className="h-3 w-3" />
              <span className="ml-1">Insight</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div 
      className={cn(
        "flex items-start gap-4 py-4 px-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 group transition-colors",
        className
      )}
      onClick={handleClick}
    >
      {/* New indicator */}
      <div className="flex-shrink-0 pt-1">
        {post.is_new && (
          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Topic label and source */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {getTopicLabel()}
          </Badge>
          <div className="text-sm text-gray-500">
            {post.blogs?.name || 'Unknown Source'}
          </div>
        </div>
        
        {/* Title */}
        <h3 className="text-base font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {post.title}
        </h3>
        
        {/* Date */}
        <div className="text-xs text-gray-400">
          {new Date(post.detected_at).toLocaleDateString()}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex-shrink-0 flex gap-2">
        {showAddButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddToKnowledgeBank}
            disabled={isInKnowledgeBank || isAdding}
            className={cn(
              "transition-colors text-xs px-3",
              isInKnowledgeBank && "text-green-600"
            )}
          >
            {isInKnowledgeBank ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            <span className="ml-1">
              {isInKnowledgeBank ? "Added" : isAdding ? "Adding..." : "Add"}
            </span>
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleInsightClick}
          className="text-xs px-3"
        >
          <Eye className="h-4 w-4" />
          <span className="ml-1">Insight</span>
        </Button>
      </div>
    </div>
  );
};
