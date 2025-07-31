import { useState } from "react";
import { X, ThumbsUp, ThumbsDown, Plus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";
import { AddToKnowledgeModal } from "@/components/AddToKnowledgeModal";
import { useKnowledgeBank } from "@/hooks/useKnowledgeBank";
import { useUserTopics } from "@/hooks/useUserTopics";
import { useToast } from "@/hooks/use-toast";

type BlogPost = Tables<'blog_posts'> & {
  blogs: {
    id: string;
    name: string;
    url: string;
  } | null;
  topicName?: string;
};

interface InsightSidebarProps {
  post: BlogPost | null;
  isOpen: boolean;
  onClose: () => void;
}

export function InsightSidebar({ post, isOpen, onClose }: InsightSidebarProps) {
  const [isAddToKnowledgeModalOpen, setIsAddToKnowledgeModalOpen] = useState(false);
  const { addToKnowledgeBank } = useKnowledgeBank();
  const { data: userTopics = [] } = useUserTopics();
  const { toast } = useToast();

  if (!isOpen || !post) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleReadFullArticle = () => {
    if (post.link) {
      window.open(post.link, '_blank');
    }
  };

  const handleAddToKnowledgeClick = () => {
    setIsAddToKnowledgeModalOpen(true);
  };

  const handleAddToKnowledgeBank = async (topicId: string) => {
    try {
      if (addToKnowledgeBank) {
        addToKnowledgeBank(post);
        toast({
          title: "Added to Knowledge Bank",
          description: "Post has been successfully added to your knowledge bank.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add post to knowledge bank.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={handleOverlayClick}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b">
            <div className="flex-1 pr-4">
              <h2 className="text-xl font-semibold text-gray-900 leading-tight mb-3">
                {post.title}
              </h2>
              <div className="flex items-center text-sm text-gray-500 space-x-2">
                <span>{post.blogs?.url?.replace(/^https?:\/\//, '') || 'Unknown source'}</span>
                <span>•</span>
                <span>{new Date(post.detected_at || post.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4 px-6 py-4 border-b">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-green-600">
              <ThumbsUp className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-red-600">
              <ThumbsDown className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-blue-600 hover:text-blue-700"
              onClick={handleAddToKnowledgeClick}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add to Knowledge
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Summary Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Summary</h3>
                <p className="text-gray-700 leading-relaxed">
                  {post.summary || post.content || "No summary available for this post."}
                </p>
              </div>

              {/* Read Full Article Link */}
              {post.link && (
                <div className="pt-4 border-t">
                  <Button
                    variant="ghost"
                    onClick={handleReadFullArticle}
                    className="text-blue-600 hover:text-blue-700 p-0 h-auto font-normal"
                  >
                    Read full article
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add to Knowledge Modal */}
      <AddToKnowledgeModal
        isOpen={isAddToKnowledgeModalOpen}
        onClose={() => setIsAddToKnowledgeModalOpen(false)}
        onAddToKnowledgeBank={handleAddToKnowledgeBank}
        userTopics={userTopics}
      />
    </>
  );
}