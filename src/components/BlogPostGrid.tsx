
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
      <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="p-2 border-b border-gray-100">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
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
    <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
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
