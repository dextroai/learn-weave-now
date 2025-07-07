
import { BlogPostGrid } from "@/components/BlogPostGrid";
import { AllPostsSubNavigation } from "@/components/AllPostsSubNavigation";
import { TopicSubNavigation } from "@/components/TopicSubNavigation";
import { PageBasedNotesArea } from "@/components/PageBasedNotesArea";
import { BlogPostContent } from "@/components/BlogPostContent";
import { Tables } from "@/integrations/supabase/types";

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
  setSelectedSubTab
}: MainContentProps) => {
  // Show individual blog post content
  if (selectedTab.startsWith("post-")) {
    const postId = selectedTab.replace("post-", "");
    const post = allBlogPosts.find(p => p.id === postId);
    
    if (post) {
      return <BlogPostContent post={post} />;
    }
    
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          Post not found
        </div>
      </div>
    );
  }

  // Show all posts in simple list format with search bar and subparts
  if (selectedTab === "all-posts") {
    const postsToShow = selectedSubTab === "knowledge-bank" 
      ? knowledgeBankPosts 
      : searchFilteredPosts;

    return (
      <div className="max-w-4xl mx-auto px-6 py-6">
        <BlogPostGrid 
          posts={postsToShow}
          isLoading={isLoading}
          onMarkAsRead={handleMarkAsRead}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          showSearch={true}
          renderSubNavigation={() => (
            <AllPostsSubNavigation
              activeSubTab={selectedSubTab}
              onSubTabChange={setSelectedSubTab}
              allPostsCount={allBlogPosts.length}
              knowledgeBankCount={knowledgeBankPosts.length}
            />
          )}
        />
      </div>
    );
  }

  // Show topic content with subnavigation for Notes/Sources
  if (selectedTab.startsWith("topic-")) {
    const topic = userTopics.find(t => `topic-${t.topic_id}` === selectedTab);
    
    if (topicSubTab === "notes") {
      return (
        <div className="h-screen flex flex-col">
          <div className="bg-white">
            <div className="max-w-4xl mx-auto px-6 pt-4">
              <TopicSubNavigation
                activeSubTab={topicSubTab}
                onSubTabChange={setTopicSubTab}
                notesCount={0}
                sourcesCount={filteredPosts.length}
              />
            </div>
          </div>
          <div className="flex-1">
            <PageBasedNotesArea category={topic?.name.toLowerCase().replace(' ', '-') || 'general'} />
          </div>
        </div>
      );
    } else {
      // Sources view - show blog posts
      return (
        <div className="max-w-4xl mx-auto px-6 py-6">
          <BlogPostGrid 
            posts={filteredPosts}
            isLoading={isLoading}
            onMarkAsRead={handleMarkAsRead}
            renderSubNavigation={() => (
              <TopicSubNavigation
                activeSubTab={topicSubTab}
                onSubTabChange={setTopicSubTab}
                notesCount={0}
                sourcesCount={filteredPosts.length}
              />
            )}
          />
        </div>
      );
    }
  }

  // Fallback
  return (
    <div className="max-w-4xl mx-auto px-6 py-6">
      <BlogPostGrid 
        posts={filteredPosts}
        isLoading={isLoading}
        onMarkAsRead={handleMarkAsRead}
      />
    </div>
  );
};
