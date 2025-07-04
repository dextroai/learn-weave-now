
import { Tables } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";

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
  className?: string;
  variant?: 'default' | 'horizontal';
}

export const BlogPostCard = ({ post, onMarkAsRead, className, variant = 'default' }: BlogPostCardProps) => {
  const handleClick = () => {
    if (post.is_new && onMarkAsRead) {
      onMarkAsRead(post.id);
    }
    if (post.link) {
      window.open(post.link, '_blank');
    }
  };

  if (variant === 'horizontal') {
    return (
      <div 
        className={cn(
          "flex-shrink-0 w-80 bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow",
          className
        )}
        onClick={handleClick}
      >
        {/* Header with source and new indicator */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600">
                {post.blogs?.name?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
            <span className="text-sm text-gray-600 font-medium">
              {post.blogs?.name || 'Unknown Source'}
            </span>
          </div>
          {post.is_new && (
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
          )}
        </div>
        
        {/* Title */}
        <h3 className="text-sm font-medium text-gray-900 line-clamp-3 mb-2 leading-tight">
          {post.title}
        </h3>
        
        {/* Date */}
        <div className="text-xs text-gray-400">
          {new Date(post.detected_at).toLocaleDateString()}
        </div>
      </div>
    );
  }

  // Default vertical layout
  return (
    <div 
      className={cn(
        "flex items-start gap-3 py-3 px-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 group",
        className
      )}
      onClick={handleClick}
    >
      {/* New indicator */}
      {post.is_new && (
        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
      )}
      
      <div className="flex-1 min-w-0">
        {/* Source */}
        <div className="text-sm text-gray-500 mb-1">
          {post.blogs?.name || 'Unknown Source'}
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
    </div>
  );
};
