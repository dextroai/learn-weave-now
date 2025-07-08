
import { useState } from "react";
import { TopicBlogPostCard } from "@/components/TopicBlogPostCard";
import { InsightModal } from "@/components/InsightModal";
import { Tables } from "@/integrations/supabase/types";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type BlogPost = Tables<'blog_posts'> & {
  blogs: {
    id: string;
    name: string;
    url: string;
  } | null;
};

interface TopicBlogPostGridProps {
  posts: BlogPost[];
  isLoading: boolean;
  onMarkAsRead: (postId: string) => void;
  renderSubNavigation?: () => React.ReactNode;
  topicName?: string;
}

export function TopicBlogPostGrid({ 
  posts, 
  isLoading, 
  onMarkAsRead, 
  renderSubNavigation,
  topicName = "General"
}: TopicBlogPostGridProps) {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isInsightModalOpen, setIsInsightModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const handleInsightClick = (post: BlogPost) => {
    setSelectedPost(post);
    setIsInsightModalOpen(true);
  };

  const handleAddToKnowledgeBank = (post: BlogPost) => {
    // Dispatch custom event to add post to knowledge bank
    const event = new CustomEvent('postAddedToKnowledgeBank', {
      detail: { post }
    });
    window.dispatchEvent(event);
    
    toast({
      title: "Added to Knowledge Bank",
      description: `"${post.title}" has been added to your ${topicName} Knowledge Bank.`,
    });
  };

  // Filter posts based on search query
  const filteredPosts = searchQuery
    ? posts.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.blogs?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : posts;

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-md mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <div className="pl-10 pr-4 py-2 bg-gray-100 rounded-full h-10 animate-pulse"></div>
          </div>
        </div>
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

  if (filteredPosts.length === 0 && !searchQuery) {
    return (
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-md mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder={`Search in ${topicName} Knowledge Bank...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-50 border-gray-200 rounded-full focus:bg-white focus-visible:ring-1 focus-visible:ring-gray-300"
            />
          </div>
        </div>
        {renderSubNavigation && (
          <div className="px-4 pt-4">
            {renderSubNavigation()}
          </div>
        )}
        <div className="text-center py-12 px-6">
          <div className="text-gray-500 mb-2">No posts found</div>
          <div className="text-sm text-gray-400">
            No blog posts available for this topic.
          </div>
        </div>
      </div>
    );
  }

  if (filteredPosts.length === 0 && searchQuery) {
    return (
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-md mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder={`Search in ${topicName} Knowledge Bank...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-50 border-gray-200 rounded-full focus:bg-white focus-visible:ring-1 focus-visible:ring-gray-300"
            />
          </div>
        </div>
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
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-md mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder={`Search in ${topicName} Knowledge Bank...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-50 border-gray-200 rounded-full focus:bg-white focus-visible:ring-1 focus-visible:ring-gray-300"
            />
          </div>
        </div>
        {renderSubNavigation && (
          <div className="px-4 pt-4">
            {renderSubNavigation()}
          </div>
        )}
        {filteredPosts.map((post) => (
          <TopicBlogPostCard
            key={post.id}
            post={post}
            onMarkAsRead={onMarkAsRead}
            onInsightClick={handleInsightClick}
            onAddToKnowledgeBank={handleAddToKnowledgeBank}
          />
        ))}
      </div>

      <InsightModal
        post={selectedPost}
        isOpen={isInsightModalOpen}
        onOpenChange={setIsInsightModalOpen}
      />
    </>
  );
}
