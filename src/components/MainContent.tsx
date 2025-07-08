import { BlogPostGrid } from "@/components/BlogPostGrid";
import { TopicBlogPostGrid } from "@/components/TopicBlogPostGrid";
import { AllPostsSubNavigation } from "@/components/AllPostsSubNavigation";
import { TopicSubNavigation } from "@/components/TopicSubNavigation";
import { PageBasedNotesArea } from "@/components/PageBasedNotesArea";
import { BlogPostContent } from "@/components/BlogPostContent";
import { Tables } from "@/integrations/supabase/types";
import { useState } from "react";

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
  const [topicSearchQuery, setTopicSearchQuery] = useState("");

  // Filter posts based on topic search query
  const topicFilteredPosts = topicSearchQuery 
    ? filteredPosts.filter(post => 
        post.title.toLowerCase().includes(topicSearchQuery.toLowerCase()) ||
        post.blogs?.name?.toLowerCase().includes(topicSearchQuery.toLowerCase())
      )
    : filteredPosts;

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
          <TopicSubNavigation
            activeSubTab={topicSubTab}
            onSubTabChange={setTopicSubTab}
            notesCount={0}
            sourcesCount={filteredPosts.length}
            topicName={topic?.name}
            searchQuery={topicSearchQuery}
            onSearchChange={setTopicSearchQuery}
            showSearch={true}
          />
          <div className="flex-1">
            <PageBasedNotesArea 
              category={topic?.name.toLowerCase().replace(' ', '-') || 'general'}
              searchQuery={topicSearchQuery}
            />
          </div>
        </div>
      );
    } else {
      // Sources view - show blog posts directly in main content area
      return (
        <div className="h-screen flex flex-col">
          <TopicSubNavigation
            activeSubTab={topicSubTab}
            onSubTabChange={setTopicSubTab}
            notesCount={0}
            sourcesCount={filteredPosts.length}
            topicName={topic?.name}
            searchQuery={topicSearchQuery}
            onSearchChange={setTopicSearchQuery}
            showSearch={true}
          />
          <div className="flex-1 overflow-auto">
            <div className="max-w-4xl mx-auto px-6 py-6">
              <TopicBlogPostGrid 
                posts={topicFilteredPosts}
                isLoading={isLoading}
                onMarkAsRead={handleMarkAsRead}
                topicName={topic?.name}
              />
            </div>
          </div>
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
