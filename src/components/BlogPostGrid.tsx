
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="p-4 border border-gray-200 rounded-lg">
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3 mb-2"></div>
            <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 px-6">
        <div className="text-gray-500 mb-2">No posts found</div>
        <div className="text-sm text-gray-400">
          No blog posts available. Try adding some blog sources in Settings.
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
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
