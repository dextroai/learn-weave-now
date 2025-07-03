
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Clock } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

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
}

export const BlogPostCard = ({ post, onMarkAsRead }: BlogPostCardProps) => {
  const handleClick = () => {
    if (post.is_new && onMarkAsRead) {
      onMarkAsRead(post.id);
    }
    if (post.link) {
      window.open(post.link, '_blank');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        post.is_new ? 'border-orange-200 bg-orange-50/50' : 'border-gray-200'
      }`}
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight">
            {post.title}
          </CardTitle>
          {post.is_new && (
            <Badge variant="destructive" className="bg-orange-500 hover:bg-orange-600 text-xs px-2 py-1 flex-shrink-0">
              New
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{post.blogs?.name || 'Unknown Blog'}</span>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatDate(post.detected_at)}</span>
          </div>
        </div>
      </CardHeader>
      
      {(post.summary || post.link) && (
        <CardContent className="pt-0">
          {post.summary && (
            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
              {post.summary}
            </p>
          )}
          
          {post.link && (
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <ExternalLink className="h-3 w-3" />
              <span>Read more</span>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};
