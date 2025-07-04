
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
      <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="break-inside-avoid">
            <div className="bg-gray-200 rounded-lg animate-pulse" style={{ height: `${Math.floor(Math.random() * 200) + 200}px` }}>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
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
    <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
      {posts.map((post) => (
        <div key={post.id} className="break-inside-avoid">
          <BlogPostCard
            post={post}
            onMarkAsRead={onMarkAsRead}
          />
        </div>
      ))}
    </div>
  );
}
