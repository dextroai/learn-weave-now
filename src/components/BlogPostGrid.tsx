
import { BlogPostCard } from "@/components/BlogPostCard";
import { Tables } from "@/integrations/supabase/types";

type BlogPost = Tables<'blog_posts'> & {
  blogs: {
    id: string;
    name: string;
    url: string;
  } | null;
};

interface BlogPostGridProps {
  posts: BlogPost[];
  isLoading: boolean;
  onMarkAsRead: (postId: string) => void;
}

export function BlogPostGrid({ posts, isLoading, onMarkAsRead }: BlogPostGridProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-start gap-3 py-3 px-4 border-b border-gray-100 last:border-b-0">
            <div className="w-2 h-2 bg-gray-200 rounded-full mt-2 animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
              <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-1/6 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 px-6 bg-white rounded-lg shadow-sm">
        <div className="text-gray-500 mb-2">No posts found</div>
        <div className="text-sm text-gray-400">
          No blog posts available. Try adding some blog sources in Settings.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {posts.map((post) => (
        <BlogPostCard
          key={post.id}
          post={post}
          onMarkAsRead={onMarkAsRead}
        />
      ))}
    </div>
  );
}
