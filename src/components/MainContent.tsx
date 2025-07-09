
import { BlogPostGrid } from "@/components/BlogPostGrid";
import { TopicBlogPostGrid } from "@/components/TopicBlogPostGrid";
import { AllPostsSubNavigation } from "@/components/AllPostsSubNavigation";
import { TopicSubNavigation } from "@/components/TopicSubNavigation";
import { PageBasedNotesArea } from "@/components/PageBasedNotesArea";
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

  if (selectedTab === "all-posts") {
    if (selectedSubTab === "knowledge-bank") {
      return (
        <div className="max-w-4xl mx-auto p-6">
          <BlogPostGrid
            posts={knowledgeBankPosts}
            isLoading={isLoading}
            onMarkAsRead={handleMarkAsRead}
            isKnowledgeBank={true}
            onRemove={handleRemoveFromKnowledgeBank}
            renderSubNavigation={() => (
              <AllPostsSubNavigation 
                activeSubTab={selectedSubTab} 
                onSubTabChange={setSelectedSubTab}
                knowledgeBankCount={knowledgeBankPosts.length}
                allPostsCount={allBlogPosts.length}
              />
            )}
            isTopicView={false} // This is the All Posts view
          />
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto p-6">
        <BlogPostGrid
          posts={searchFilteredPosts}
          isLoading={isLoading}
          onMarkAsRead={handleMarkAsRead}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          showSearch={true}
          renderSubNavigation={() => (
            <AllPostsSubNavigation 
              activeSubTab={selectedSubTab} 
              onSubTabChange={setSelectedSubTab}
              knowledgeBankCount={knowledgeBankPosts.length}
              allPostsCount={allBlogPosts.length}
            />
          )}
          isTopicView={false} // This is the All Posts view
        />
      </div>
    );
  }

  // Topic-specific views
  if (currentTopic) {
    if (topicSubTab === "notes") {
      return (
        <div className="max-w-6xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-sm px-4 pt-4 mb-4">
            <TopicSubNavigation 
              activeSubTab={topicSubTab}
              onSubTabChange={setTopicSubTab}
              notesCount={0}
              sourcesCount={filteredPosts.length}
              topicName={currentTopic.name}
            />
          </div>
          <PageBasedNotesArea category={currentTopic.name} />
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto p-6">
        <TopicBlogPostGrid
          posts={filteredPosts}
          isLoading={isLoading}
          onMarkAsRead={handleMarkAsRead}
          topicName={currentTopic.name}
          renderSubNavigation={() => (
            <TopicSubNavigation 
              activeSubTab={topicSubTab}
              onSubTabChange={setTopicSubTab}
              notesCount={0}
              sourcesCount={filteredPosts.length}
              topicName={currentTopic.name}
            />
          )}
        />
      </div>
    );
  }

  return null;
};
