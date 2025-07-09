
import { Tables } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Eye, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type BlogPost = Tables<'blog_posts'> & {
  blogs: {
    id: string;
    name: string;
    url: string;
  } | null;
  topicName?: string;
};

interface KnowledgeBankPostCardProps {
  post: BlogPost;
  onInsightClick?: (post: BlogPost) => void;
  onRemove?: (postId: string) => void;
  className?: string;
}

export const KnowledgeBankPostCard = ({ 
  post, 
  onInsightClick,
  onRemove,
  className
}: KnowledgeBankPostCardProps) => {
  const handleClick = () => {
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

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove(post.id);
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
      <div className="flex-1 min-w-0">
        {/* Source and Topic Label */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm text-gray-500">
            {post.blogs?.name || 'Unknown Source'}
          </span>
          {post.topicName && (
            <>
              <span className="text-gray-300">•</span>
              <Badge variant="secondary" className="text-xs">
                {post.topicName}
              </Badge>
            </>
          )}
        </div>
        
        {/* Title */}
        <h3 className="text-base font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {post.title}
        </h3>
        
        {/* Date */}
        <div className="text-xs text-gray-400 mt-1">
          {new Date(post.detected_at).toLocaleDateString()}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex-shrink-0 ml-2 flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleInsightClick}
        >
          <Eye className="h-4 w-4" />
          <span className="ml-1">Insight</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemoveClick}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
