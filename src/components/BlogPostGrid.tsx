
import { useState } from "react";
import { BlogPostCard } from "@/components/BlogPostCard";
import { DateGroupedBlogPosts } from "@/components/DateGroupedBlogPosts";
import { InsightModal } from "@/components/InsightModal";
import { AddBlogPostButton } from "@/components/AddBlogPostButton";
import { Tables } from "@/integrations/supabase/types";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

type BlogPost = Tables<'blog_posts'> & {
  blogs: {
    id: string;
    name: string;
    url: string;
  } | null;
  topicName?: string;
};

interface BlogPostGridProps {
  posts: BlogPost[];
  isLoading: boolean;
  onMarkAsRead: (postId: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  showSearch?: boolean;
  renderSubNavigation?: () => React.ReactNode;
  isKnowledgeBank?: boolean;
  onRemove?: (postId: string) => void;
  isTopicView?: boolean; // New prop to determine if this is a topic-specific view
}

export function BlogPostGrid({ 
  posts, 
  isLoading, 
  onMarkAsRead, 
  searchQuery = "", 
  onSearchChange, 
  showSearch = false,
  renderSubNavigation,
  isKnowledgeBank = false,
  onRemove,
  isTopicView = false // Default to false for All Posts view
}: BlogPostGridProps) {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isInsightModalOpen, setIsInsightModalOpen] = useState(false);

  const handleInsightClick = (post: BlogPost) => {
    setSelectedPost(post);
    setIsInsightModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm">
        {showSearch && (
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="relative max-w-md mx-auto flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <div className="pl-10 pr-4 py-2 bg-gray-100 rounded-full h-10 animate-pulse"></div>
              </div>
              <div className="w-20 h-8 bg-gray-100 rounded animate-pulse"></div>
            </div>
          </div>
        )}
        {renderSubNavigation && (
          <div className="px-4 pt-4">
            {renderSubNavigation()}
          </div>
        )}
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

  if (posts.length === 0 && !searchQuery) {
    return (
      <div className="bg-white rounded-lg shadow-sm">
        {showSearch && (
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="relative max-w-md mx-auto flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Ask a question..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-50 border-gray-200 rounded-full focus:bg-white focus-visible:ring-1 focus-visible:ring-gray-300"
                />
              </div>
              <AddBlogPostButton />
            </div>
          </div>
        )}
        {renderSubNavigation && (
          <div className="px-4 pt-4">
            {renderSubNavigation()}
          </div>
        )}
        <div className="text-center py-12 px-6">
          <div className="text-gray-500 mb-2">No posts found</div>
          <div className="text-sm text-gray-400">
            No blog posts available. Try adding some blog sources in Settings.
          </div>
        </div>
      </div>
    );
  }

  if (posts.length === 0 && searchQuery) {
    return (
      <div className="bg-white rounded-lg shadow-sm">
        {showSearch && (
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="relative max-w-md mx-auto flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Ask a question..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-50 border-gray-200 rounded-full focus:bg-white focus-visible:ring-1 focus-visible:ring-gray-300"
                />
              </div>
              <AddBlogPostButton />
            </div>
          </div>
        )}
        {renderSubNavigation && (
          <div className="px-4 pt-4">
            {renderSubNavigation()}
          </div>
        )}
        <div className="text-center py-12 px-6">
          <div className="text-gray-500 mb-2">No posts found</div>
          <div className="text-sm text-gray-400">
            No posts match your search query "{searchQuery}".
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {showSearch && (
          <div className="bg-white rounded-lg shadow-sm p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="relative max-w-md mx-auto flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Ask a question..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-50 border-gray-200 rounded-full focus:bg-white focus-visible:ring-1 focus-visible:ring-gray-300"
                />
              </div>
              <AddBlogPostButton />
            </div>
          </div>
        )}
        
        {renderSubNavigation && (
          <div className="bg-white rounded-lg shadow-sm px-4 pt-4">
            {renderSubNavigation()}
          </div>
        )}
        
        <DateGroupedBlogPosts
          posts={posts}
          onMarkAsRead={onMarkAsRead}
          onInsightClick={handleInsightClick}
          onRemove={onRemove}
          isKnowledgeBank={isKnowledgeBank}
          showAddButton={isTopicView} // Only show Add button in topic views
        />
      </div>

      <InsightModal
        post={selectedPost}
        isOpen={isInsightModalOpen}
        onOpenChange={setIsInsightModalOpen}
      />
    </>
  );
}
