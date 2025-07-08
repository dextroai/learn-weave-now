
import { BlogPostCard } from "@/components/BlogPostCard";
import { Tables } from "@/integrations/supabase/types";

type BlogPost = Tables<'blog_posts'> & {
  blogs: {
    id: string;
    name: string;
    url: string;
  } | null;
};

interface DateGroupedBlogPostsProps {
  posts: BlogPost[];
  onMarkAsRead: (postId: string) => void;
  onInsightClick: (post: BlogPost) => void;
}

export const DateGroupedBlogPosts = ({ 
  posts, 
  onMarkAsRead, 
  onInsightClick 
}: DateGroupedBlogPostsProps) => {
  // Group posts by date
  const groupedPosts = posts.reduce((groups, post) => {
    const date = new Date(post.detected_at).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(post);
    return groups;
  }, {} as Record<string, BlogPost[]>);

  // Sort dates in descending order (most recent first)
  const sortedDates = Object.keys(groupedPosts).sort((a, b) => {
    const dateA = new Date(groupedPosts[a][0].detected_at);
    const dateB = new Date(groupedPosts[b][0].detected_at);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="space-y-6">
      {sortedDates.map((date) => (
        <div key={date} className="space-y-3">
          {/* Date Header */}
          <div className="sticky top-0 bg-gray-50 px-4 py-2 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-700">{date}</h3>
          </div>
          
          {/* Posts for this date */}
          <div className="bg-white rounded-lg shadow-sm">
            {groupedPosts[date].map((post) => (
              <BlogPostCard
                key={post.id}
                post={post}
                onMarkAsRead={onMarkAsRead}
                onInsightClick={onInsightClick}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
