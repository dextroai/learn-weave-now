
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Move } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type BlogPost = Tables<'blog_posts'> & {
  blogs: {
    id: string;
    name: string;
    url: string;
  } | null;
};

interface InsightModalProps {
  post: BlogPost | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InsightModal = ({ post, isOpen, onOpenChange }: InsightModalProps) => {
  if (!post) return null;

  const handleLike = () => {
    // TODO: Implement like functionality
    console.log('Liked post:', post.title);
  };

  const handleDislike = () => {
    // TODO: Implement dislike functionality
    console.log('Disliked post:', post.title);
  };

  const handleAddToKnowledge = () => {
    // Add post to knowledge bank
    window.dispatchEvent(new CustomEvent('postAddedToKnowledgeBank', { 
      detail: { post } 
    }));
    
    // Close modal and redirect to All Posts with Knowledge Bank sub-tab
    onOpenChange(false);
    
    // Trigger a custom event to switch to All Posts tab and Knowledge Bank sub-tab
    window.dispatchEvent(new CustomEvent('switchToKnowledgeBank'));
    
    console.log('Added to Knowledge Bank:', post.title);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="text-left">{post.title}</SheetTitle>
          <SheetDescription className="text-left">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <span>{post.blogs?.name}</span>
              <span>•</span>
              <span>{new Date(post.detected_at).toLocaleDateString()}</span>
            </div>
          </SheetDescription>
        </SheetHeader>
        
        {/* Action buttons */}
        <div className="flex items-center gap-2 mb-6 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className="flex items-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-50"
          >
            <ThumbsUp className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDislike}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <ThumbsDown className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddToKnowledge}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Move className="h-4 w-4" />
            <span className="text-xs">Add to Knowledge</span>
          </Button>
        </div>
        
        <div className="mt-6">
          <h3 className="font-semibold text-gray-900 mb-3">Summary</h3>
          {post.summary ? (
            <div className="text-gray-700 leading-relaxed">
              {post.summary}
            </div>
          ) : (
            <div className="text-gray-500 italic">
              No summary available for this post.
            </div>
          )}
          
          {post.link && (
            <div className="mt-6 pt-4 border-t">
              <a 
                href={post.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
              >
                Read full article
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
