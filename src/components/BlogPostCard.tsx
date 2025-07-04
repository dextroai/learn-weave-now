
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
}

export const BlogPostCard = ({ post, onMarkAsRead, className }: BlogPostCardProps) => {
  const handleClick = () => {
    if (post.is_new && onMarkAsRead) {
      onMarkAsRead(post.id);
    }
    if (post.link) {
      window.open(post.link, '_blank');
    }
  };

  return (
    <div 
      className={cn(
        `relative cursor-pointer bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group ${
          post.is_new ? 'ring-2 ring-orange-200' : ''
        }`,
        className
      )}
      onClick={handleClick}
    >
      {/* New indicator */}
      {post.is_new && (
        <div className="absolute top-3 right-3 w-3 h-3 bg-orange-500 rounded-full z-10"></div>
      )}
      
      {/* Content overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
      
      {/* Placeholder image area with gradient background */}
      <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-200/50 to-purple-200/50"></div>
        
        {/* Content positioned at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
          <h3 className="text-sm font-semibold line-clamp-2 mb-2 leading-tight">
            {post.title}
          </h3>
          
          <div className="flex items-center justify-between text-xs">
            <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
              {post.blogs?.name || 'Unknown'}
            </span>
            <span className="text-white/80">
              {new Date(post.detected_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
      
      {/* Summary preview on hover */}
      {post.summary && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-center">
          <p className="text-sm text-gray-700 line-clamp-6 leading-relaxed">
            {post.summary}
          </p>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{post.blogs?.name}</span>
              <span>Click to read more</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
