
import { AllPostsSubNavigation } from "@/components/AllPostsSubNavigation";
import { BlogPostGrid } from "@/components/BlogPostGrid";
import { TopicBlogPostGrid } from "@/components/TopicBlogPostGrid";
import { TopicSubNavigation } from "@/components/TopicSubNavigation";
import { PageBasedNotesArea } from "@/components/PageBasedNotesArea";
import { Tables } from "@/integrations/supabase/types";
import { useKnowledgeBank } from "@/hooks/useKnowledgeBank";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { AddBlogPostButton } from "@/components/AddBlogPostButton";

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
    const renderSearchSection = () => (
      <div className="bg-white rounded-lg shadow-sm p-4 border-b border-gray-100">
        <div className="flex items-center justify-center gap-3 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Ask a question..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-50 border-gray-200 rounded-full focus:bg-white focus-visible:ring-1 focus-visible:ring-gray-300"
            />
          </div>
          <AddBlogPostButton />
        </div>
      </div>
    );

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
        <div className="space-y-4">
          {renderSearchSection()}
          <div className="bg-white rounded-lg shadow-sm max-w-4xl mx-auto">
            {renderSubNavigation()}
          </div>
          <div className="max-w-4xl mx-auto">
            <BlogPostGrid
              posts={knowledgeBankPosts}
              isLoading={false}
              onMarkAsRead={handleMarkAsRead}
              isKnowledgeBank={true}
              onRemove={removeFromKnowledgeBank}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {renderSearchSection()}
        <div className="bg-white rounded-lg shadow-sm max-w-4xl mx-auto">
          {renderSubNavigation()}
        </div>
        <div className="max-w-4xl mx-auto">
          <BlogPostGrid
            posts={searchQuery ? searchFilteredPosts : allBlogPosts}
            isLoading={isLoading}
            onMarkAsRead={handleMarkAsRead}
          />
        </div>
      </div>
    );
  };

  const renderTopicContent = () => {
    const topicId = selectedTab.replace("topic-", "");
    const topic = userTopics.find(t => t.topic_id.toString() === topicId);
    
    if (!topic) {
      return <div>Topic not found</div>;
    }

    // Filter posts for this specific topic from knowledge bank
    const topicKnowledgeBankPosts = knowledgeBankPosts.filter(
      post => post.label_id?.toString() === topicId
    );

    const renderSubNavigation = () => (
      <TopicSubNavigation
        activeSubTab={topicSubTab}
        onSubTabChange={setTopicSubTab}
        notesCount={0}
        sourcesCount={topicKnowledgeBankPosts.length}
        topicName={topic.name}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showSearch={true}
      />
    );

    // Render notes section when topicSubTab is "notes"
    if (topicSubTab === "notes") {
      return (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm max-w-4xl mx-auto">
            {renderSubNavigation()}
          </div>
          <div className="max-w-4xl mx-auto">
            <PageBasedNotesArea 
              category={topic.name.toLowerCase().replace(' ', '-')}
              searchQuery={searchQuery}
            />
          </div>
        </div>
      );
    }

    // Render knowledge bank posts when topicSubTab is "sources"
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow-sm max-w-4xl mx-auto">
          {renderSubNavigation()}
        </div>
        <div className="max-w-4xl mx-auto">
          <TopicBlogPostGrid
            posts={topicKnowledgeBankPosts}
            isLoading={isLoading}
            onMarkAsRead={handleMarkAsRead}
            topicName={topic.name}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="py-6">
      {selectedTab === "all-posts" ? renderAllPostsContent() : renderTopicContent()}
    </div>
  );
};
