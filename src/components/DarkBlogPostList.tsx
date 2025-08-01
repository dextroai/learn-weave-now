import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { Search, Paperclip, Mic, MapPin, Send, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InsightSidebar } from "@/components/InsightSidebar";

type BlogPost = Tables<'blog_posts'> & {
  blogs: {
    id: string;
    name: string;
    url: string;
  } | null;
  topicName?: string;
};

interface DarkBlogPostListProps {
  posts: BlogPost[];
  isLoading: boolean;
}

export function DarkBlogPostList({ posts, isLoading }: DarkBlogPostListProps) {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isInsightOpen, setIsInsightOpen] = useState(false);

  const handleInsightClick = (post: BlogPost, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPost(post);
    setIsInsightOpen(true);
  };

  const handleCloseInsight = () => {
    setIsInsightOpen(false);
    setSelectedPost(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">Loading posts...</div>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">No posts available</div>
      </div>
    );
  }

  // Group posts by date
  const groupPostsByDate = (posts: BlogPost[]) => {
    const groups = posts.reduce((acc, post) => {
      const date = new Date(post.detected_at || post.created_at).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(post);
      return acc;
    }, {} as Record<string, BlogPost[]>);

    return Object.entries(groups).sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime());
  };

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

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return null;
    }
  };

  const groupedPosts = groupPostsByDate(posts);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Content Area */}
      <div className="flex-1 pb-32">
        <div className="max-w-4xl mx-auto space-y-8">
          {groupedPosts.map(([date, datePosts]) => (
            <div key={date} className="space-y-6">
              {/* Date Header */}
              <h2 className="text-lg font-medium text-gray-300 border-b border-gray-700 pb-2 text-center">
                {formatDate(date)} ({datePosts.length})
              </h2>
              
              {/* Posts Grid */}
              <div className="flex justify-center">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                {datePosts.map((post) => (
                  <div 
                    key={post.id} 
                    className="bg-slate-800 rounded-lg p-4 hover:bg-slate-750 transition-colors cursor-pointer border border-slate-700 group"
                  >
                    {/* Source with favicon */}
                    <div className="flex items-center space-x-2 mb-3">
                      {post.blogs?.url && getFaviconUrl(post.blogs.url) ? (
                        <img 
                          src={getFaviconUrl(post.blogs.url)!} 
                          alt=""
                          className="w-4 h-4 rounded"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`w-2 h-2 bg-orange-500 rounded-full ${getFaviconUrl(post.blogs?.url || '') ? 'hidden' : ''}`}></div>
                      <span className="text-sm text-gray-400 truncate">
                        {post.blogs?.url?.replace(/^https?:\/\//, '') || 'Unknown source'}
                      </span>
                    </div>
                    
                    {/* Post title */}
                    <h3 className="text-white font-medium text-sm leading-tight line-clamp-3 mb-3">
                      {post.title}
                    </h3>
                    
                    {/* Date and Insight button */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">
                        {new Date(post.detected_at || post.created_at).toLocaleDateString()}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleInsightClick(post, e)}
                        className="text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity h-6 px-2 text-xs"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Insight
                      </Button>
                    </div>
                  </div>
                ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Search Bar at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative flex items-center bg-slate-800 rounded-lg border border-slate-600 px-4 py-3">
            <Search className="h-5 w-5 text-gray-400 mr-3" />
            <Input
              placeholder="Ask a follow-up..."
              className="flex-1 bg-transparent border-none text-white placeholder-gray-400 focus:ring-0 focus:outline-none"
            />
            <div className="flex items-center space-x-3 ml-3">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                <Mic className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                <MapPin className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-teal-400 hover:text-teal-300">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Insight Sidebar */}
      <InsightSidebar
        post={selectedPost}
        isOpen={isInsightOpen}
        onClose={handleCloseInsight}
      />
    </div>
  );
}