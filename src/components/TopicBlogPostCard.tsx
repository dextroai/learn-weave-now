
import { Tables } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Eye, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type BlogPost = Tables<'blog_posts'> & {
  blogs: {
    id: string;
    name: string;
    url: string;
  } | null;
};

interface TopicBlogPostCardProps {
  post: BlogPost;
  onMarkAsRead?: (postId: string) => void;
  onInsightClick?: (post: BlogPost) => void;
  topicName?: string;
  className?: string;
}

export const TopicBlogPostCard = ({ 
  post, 
  onMarkAsRead, 
  onInsightClick,
  topicName = "General",
  className
}: TopicBlogPostCardProps) => {
  const { toast } = useToast();

  const handleClick = () => {
    if (post.is_new && onMarkAsRead) {
      onMarkAsRead(post.id);
    }
    if (post.link) {
      window.open(post.link, '_blank');
    }
  };

  const handleInsightClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onInsightClick) {
      onInsightClick(post);
    }
  };

  const handleAddToNotes = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Get the category key for localStorage
    const categoryKey = topicName.toLowerCase().replace(' ', '-');
    
    // Get existing pages for this topic
    const savedPages = localStorage.getItem(`notes-pages-${categoryKey}`);
    let pages = savedPages ? JSON.parse(savedPages) : [];
    
    // If no pages exist, create a default page
    if (pages.length === 0) {
      const defaultPage = {
        id: Date.now().toString(),
        title: `${topicName} Links`,
        createdAt: new Date().toISOString(),
      };
      pages = [defaultPage];
      localStorage.setItem(`notes-pages-${categoryKey}`, JSON.stringify(pages));
    }
    
    // Use the first page to add the link
    const targetPage = pages[0];
    const notesKey = `interactive-notes-${categoryKey}-${targetPage.id}`;
    
    // Get existing notes for this page
    const savedNotes = localStorage.getItem(notesKey);
    let noteBoxes = savedNotes ? JSON.parse(savedNotes) : [];
    
    // Create a new note box with the post link and title
    const linkText = `${post.title}\n${post.link}\nSource: ${post.blogs?.name || 'Unknown'}`;
    
    const newNoteBox = {
      id: Date.now().toString(),
      content: linkText,
      x: Math.random() * 300,
      y: Math.random() * 200,
      width: 300,
      height: 120,
    };
    
    // Add the new note box
    const updatedNoteBoxes = [...noteBoxes, newNoteBox];
    localStorage.setItem(notesKey, JSON.stringify(updatedNoteBoxes));
    
    // Mark the post as read
    if (post.is_new && onMarkAsRead) {
      onMarkAsRead(post.id);
    }
    
    toast({
      title: "Added to Notes",
      description: `"${post.title}" has been added to your ${topicName} notes.`,
    });
  };

  return (
    <div 
      className={cn(
        "flex items-start gap-3 py-3 px-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 group",
        className
      )}
      onClick={handleClick}
    >
      {/* New indicator */}
      {post.is_new && (
        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
      )}
      
      <div className="flex-1 min-w-0">
        {/* Source */}
        <div className="text-sm text-gray-500 mb-1">
          {post.blogs?.name || 'Unknown Source'}
        </div>
        
        {/* Title */}
        <h3 className="text-base font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {post.title}
        </h3>
        
        {/* Date */}
        <div className="text-xs text-gray-400 mt-1">
          {new Date(post.detected_at).toLocaleDateString()}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex-shrink-0 ml-2 flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddToNotes}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          <span className="ml-1">Add</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleInsightClick}
        >
          <Eye className="h-4 w-4" />
          <span className="ml-1">Insight</span>
        </Button>
      </div>
    </div>
  );
};
