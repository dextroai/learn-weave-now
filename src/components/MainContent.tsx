
import { BlogPostGrid } from "@/components/BlogPostGrid";
import { TopicBlogPostGrid } from "@/components/TopicBlogPostGrid";
import { AllPostsSubNavigation } from "@/components/AllPostsSubNavigation";
import { TopicSubNavigation } from "@/components/TopicSubNavigation";
import { PageBasedNotesArea } from "@/components/PageBasedNotesArea";
import { InteractiveNotesArea } from "@/components/InteractiveNotesArea";
import { DarkBlogPostList } from "@/components/DarkBlogPostList";
import { Tables } from "@/integrations/supabase/types";
import { useKnowledgeBank } from "@/hooks/useKnowledgeBank";
import { useToast } from "@/hooks/use-toast";

type BlogPost = Tables<'blog_posts'> & {
  blogs: {
    id: string;
    name: string;
    url: string;
  } | null;
  topicName?: string;
};

type UserTopic = Tables<'user_topics'>;

interface MainContentProps {
  selectedTab: string;
  selectedSubTab: string;
  topicSubTab: string;
  setTopicSubTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  userTopics: UserTopic[];
  knowledgeBankPosts: BlogPost[];
  allBlogPosts: BlogPost[];
  searchFilteredPosts: BlogPost[];
  filteredPosts: BlogPost[];
  isLoading: boolean;
  handleMarkAsRead: (postId: string) => void;
  setSelectedSubTab: (tab: string) => void;
}

export const MainContent = ({
  selectedTab,
  selectedSubTab,
  topicSubTab,
  setTopicSubTab,
  searchQuery,
  setSearchQuery,
  userTopics,
  knowledgeBankPosts,
  allBlogPosts,
  searchFilteredPosts,
  filteredPosts,
  isLoading,
  handleMarkAsRead,
  setSelectedSubTab,
}: MainContentProps) => {
  const { removeFromKnowledgeBank } = useKnowledgeBank();
  const { toast } = useToast();

  const handleRemoveFromKnowledgeBank = async (postId: string) => {
    try {
      if (removeFromKnowledgeBank) {
        removeFromKnowledgeBank(postId);
        toast({
          title: "Removed from Knowledge Bank",
          description: "Post has been removed from your knowledge bank.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove post from knowledge bank.",
        variant: "destructive",
      });
    }
  };

  // Get topic information
  const getTopicFromTab = (tabId: string) => {
    if (tabId === "all-posts") return null;
    return userTopics.find(t => `topic-${t.topic_id}` === tabId);
  };

  const currentTopic = getTopicFromTab(selectedTab);
  const isTopicView = currentTopic !== null;

  // Filter knowledge bank posts for the current topic
  const topicKnowledgeBankPosts = currentTopic 
    ? knowledgeBankPosts.filter(post => post.label_id === currentTopic.topic_id)
    : [];

  // Handle Posts tab (show all blog posts)
  if (selectedTab === "all") {
    return (
      <DarkBlogPostList
        posts={allBlogPosts}
        isLoading={isLoading}
      />
    );
  }

  // Handle Knowledge Bank tab
  if (selectedTab === "knowledge") {
    return (
      <DarkBlogPostList
        posts={knowledgeBankPosts}
        isLoading={isLoading}
      />
    );
  }

  // Handle Topic-specific views - show notes directly like OneNote
  if (currentTopic) {
    return (
      <div className="flex flex-col min-h-screen">
        {/* Notes Content - Full screen OneNote-like experience */}
        <div className="flex-1">
          <InteractiveNotesArea 
            category={currentTopic.name} 
            pageTitle={`${currentTopic.name} Notes`}
          />
        </div>
      </div>
    );
  }

  return null;
};
