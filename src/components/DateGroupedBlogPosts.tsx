
import { BlogPostCard } from "@/components/BlogPostCard";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

type BlogPost = Tables<'blog_posts'> & {
  blogs: {
    id: string;
    name: string;
    url: string;
  } | null;
  topicName?: string;
};

interface DateGroupedBlogPostsProps {
  posts: BlogPost[];
  onMarkAsRead: (postId: string) => void;
  onInsightClick: (post: BlogPost) => void;
  onRemove?: (postId: string) => void;
  isKnowledgeBank?: boolean;
  showAddButton?: boolean; // New prop to control Add button visibility
}

const groupPostsByDate = (posts: BlogPost[]) => {
  const grouped = posts.reduce((acc, post) => {
    const date = new Date(post.detected_at).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(post);
    return acc;
  }, {} as Record<string, BlogPost[]>);

  return Object.entries(grouped).sort(([a], [b]) => 
    new Date(b).getTime() - new Date(a).getTime()
  );
};

export function DateGroupedBlogPosts({ 
  posts, 
  onMarkAsRead, 
  onInsightClick, 
  onRemove, 
  isKnowledgeBank = false,
  showAddButton = false // Default to false
}: DateGroupedBlogPostsProps) {
  const groupedPosts = groupPostsByDate(posts);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  if (groupedPosts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm">
        <div className="text-center py-12 px-6">
          <div className="text-gray-500 mb-2">No posts found</div>
          <div className="text-sm text-gray-400">
            {isKnowledgeBank 
              ? "No posts in your knowledge bank yet." 
              : "No blog posts available."
            }
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groupedPosts.map(([date, datePosts]) => (
        <div key={date} className="bg-white rounded-lg shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-medium text-gray-900">
              {formatDate(date)} ({datePosts.length})
            </h3>
          </div>
          
          <div className="divide-y divide-gray-100">
            {datePosts.map((post) => (
              <div key={post.id} className="relative">
                <BlogPostCard
                  post={post}
                  onMarkAsRead={onMarkAsRead}
                  onInsightClick={onInsightClick}
                  showAddButton={showAddButton}
                />
                
                {isKnowledgeBank && onRemove && (
                  <div className="absolute top-2 right-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(post.id);
                      }}
                      className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                
                {isKnowledgeBank && post.topicName && (
                  <div className="absolute top-2 left-4 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {post.topicName}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
