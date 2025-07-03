
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
        `cursor-pointer hover:bg-gray-50 p-2 border-b border-gray-100 transition-colors ${
          post.is_new ? 'bg-orange-50/30' : ''
        }`,
        className
      )}
      onClick={handleClick}
    >
      <div className="flex items-center gap-2">
        {post.is_new && (
          <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
        )}
        <div className="flex items-center gap-2 text-xs text-gray-500 flex-shrink-0">
          <span>{post.blogs?.name || 'Unknown'}</span>
        </div>
        <h3 className="text-sm text-gray-900 hover:text-blue-600 truncate flex-1">
          {post.title}
        </h3>
      </div>
    </div>
  );
};
