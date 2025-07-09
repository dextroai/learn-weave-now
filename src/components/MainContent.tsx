
import { AllPostsSubNavigation } from "@/components/AllPostsSubNavigation";
import { BlogPostGrid } from "@/components/BlogPostGrid";
import { TopicBlogPostGrid } from "@/components/TopicBlogPostGrid";
import { TopicSubNavigation } from "@/components/TopicSubNavigation";
import { Tables } from "@/integrations/supabase/types";
import { useKnowledgeBank } from "@/hooks/useKnowledgeBank";

type BlogPost = Tables<'blog_posts'> & {
  blogs: {
    id: string;
    name: string;
    url: string;
  } | null;
};

interface MainContentProps {
  selectedTab: string;
  selectedSubTab: string;
  topicSubTab: string;
  setTopicSubTab: (subTab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  userTopics: any[];
  knowledgeBankPosts: BlogPost[];
  allBlogPosts: BlogPost[];
  searchFilteredPosts: BlogPost[];
  filteredPosts: BlogPost[];
  isLoading: boolean;
  handleMarkAsRead: (postId: string) => void;
  setSelectedSubTab: (subTab: string) => void;
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

  const renderAllPostsContent = () => {
    const renderSubNavigation = () => (
      <AllPostsSubNavigation
        activeSubTab={selectedSubTab}
        onSubTabChange={setSelectedSubTab}
        allPostsCount={allBlogPosts.length}
        knowledgeBankCount={knowledgeBankPosts.length}
      />
    );

    if (selectedSubTab === "knowledge-bank") {
      return (
        <BlogPostGrid
          posts={knowledgeBankPosts}
          isLoading={false}
          onMarkAsRead={handleMarkAsRead}
          renderSubNavigation={renderSubNavigation}
          isKnowledgeBank={true}
          onRemove={removeFromKnowledgeBank}
        />
      );
    }

    return (
      <BlogPostGrid
        posts={searchQuery ? searchFilteredPosts : allBlogPosts}
        isLoading={isLoading}
        onMarkAsRead={handleMarkAsRead}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showSearch={true}
        renderSubNavigation={renderSubNavigation}
      />
    );
  };

  const renderTopicContent = () => {
    const topicId = selectedTab.replace("topic-", "");
    const topic = userTopics.find(t => t.topic_id.toString() === topicId);
    
    if (!topic) {
      return <div>Topic not found</div>;
    }

    return (
      <TopicBlogPostGrid
        posts={filteredPosts}
        isLoading={isLoading}
        onMarkAsRead={handleMarkAsRead}
        renderSubNavigation={() => (
          <TopicSubNavigation
            activeSubTab={topicSubTab}
            onSubTabChange={setTopicSubTab}
            notesCount={0}
            sourcesCount={filteredPosts.length}
            topicName={topic.name}
          />
        )}
        topicName={topic.name}
      />
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {selectedTab === "all-posts" ? renderAllPostsContent() : renderTopicContent()}
    </div>
  );
};
