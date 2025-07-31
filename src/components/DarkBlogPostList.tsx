import { Tables } from "@/integrations/supabase/types";
import { Search, Paperclip, Mic, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

  return (
    <div className="flex flex-col min-h-screen">
      {/* Content Area */}
      <div className="flex-1 px-6 pb-32">
        <div className="max-w-4xl mx-auto space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="text-gray-300 space-y-4">
              <div className="text-lg leading-relaxed">
                {post.summary || post.title}
              </div>
              
              {post.content && (
                <div className="text-base leading-relaxed">
                  {post.content.split('\n').map((line, index) => (
                    <div key={index} className="mb-2">
                      {line}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="border-b border-gray-700 pb-6"></div>
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
    </div>
  );
}