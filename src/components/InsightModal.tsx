
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ThumbsUp, ThumbsDown, Move } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useUserTopics } from "@/hooks/useUserTopics";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

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
  const [isLabelDialogOpen, setIsLabelDialogOpen] = useState(false);
  const [selectedLabelId, setSelectedLabelId] = useState("");
  const { data: userTopics = [] } = useUserTopics();
  const { toast } = useToast();

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
    if (userTopics.length === 0) {
      toast({
        title: "No Topics Available",
        description: "Please create a topic first before adding posts to knowledge bank.",
        variant: "destructive",
      });
      return;
    }
    setIsLabelDialogOpen(true);
  };

  const handleConfirmAddToKnowledge = () => {
    if (!selectedLabelId) {
      toast({
        title: "Error",
        description: "Please select a topic label",
        variant: "destructive",
      });
      return;
    }

    // Create a new post object with the selected label
    const postWithLabel = {
      ...post,
      label_id: parseInt(selectedLabelId)
    };

    // Add post to knowledge bank
    window.dispatchEvent(new CustomEvent('postAddedToKnowledgeBank', { 
      detail: { post: postWithLabel } 
    }));
    
    // Close dialogs and redirect to All Posts with Knowledge Bank sub-tab
    setIsLabelDialogOpen(false);
    onOpenChange(false);
    
    // Trigger a custom event to switch to All Posts tab and Knowledge Bank sub-tab
    window.dispatchEvent(new CustomEvent('switchToKnowledgeBank'));
    
    // Reset selected label
    setSelectedLabelId("");
    
    console.log('Added to Knowledge Bank:', post.title, 'with label:', selectedLabelId);
    
    toast({
      title: "Success",
      description: "Post added to Knowledge Bank successfully!",
    });
  };

  return (
    <>
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

      {/* Label Selection Dialog */}
      <Dialog open={isLabelDialogOpen} onOpenChange={setIsLabelDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Select Topic Label</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="labelSelect">Choose a topic label for this post *</Label>
              <Select 
                value={selectedLabelId} 
                onValueChange={setSelectedLabelId}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a topic label" />
                </SelectTrigger>
                <SelectContent>
                  {userTopics.map((topic) => (
                    <SelectItem key={topic.topic_id} value={topic.topic_id.toString()}>
                      {topic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsLabelDialogOpen(false);
                  setSelectedLabelId("");
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmAddToKnowledge}
                disabled={!selectedLabelId}
              >
                Add to Knowledge Bank
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
