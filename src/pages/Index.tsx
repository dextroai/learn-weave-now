import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TabNavigation } from "@/components/TabNavigation";
import { BlogPostGrid } from "@/components/BlogPostGrid";
import { HorizontalPostGroup } from "@/components/HorizontalPostGroup";
import { InteractiveNotesArea } from "@/components/InteractiveNotesArea";
import { AddTopicDialog } from "@/components/AddTopicDialog";
import { AllPostsSubNavigation } from "@/components/AllPostsSubNavigation";
import { TopicSubNavigation } from "@/components/TopicSubNavigation";
import { Separator } from "@/components/ui/separator";
import { useBlogPosts, useMarkPostAsRead } from "@/hooks/useBlogPosts";
import { useUserTopics } from "@/hooks/useUserTopics";
import { useKnowledgeBank } from "@/hooks/useKnowledgeBank";
import { PageBasedNotesArea } from "@/components/PageBasedNotesArea";

const Index = () => {
  const [selectedTab, setSelectedTab] = useState("all-posts");
  const [selectedSubTab, setSelectedSubTab] = useState("all");
  const [topicSubTab, setTopicSubTab] = useState("notes"); // Default to notes for topic tabs
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddTopicDialogOpen, setIsAddTopicDialogOpen] = useState(false);
  
  // Get user topics to build tabs
  const { data: userTopics = [] } = useUserTopics();
  const { knowledgeBankPosts } = useKnowledgeBank();
  
  // Listen for custom events to switch tabs
  useEffect(() => {
    const handleSwitchToTopic = (event: CustomEvent) => {
      const { topicId } = event.detail;
      if (topicId) {
        setSelectedTab(`topic-${topicId}`);
      }
    };

    const handleSwitchToKnowledgeBank = () => {
      setSelectedTab("all-posts");
      setSelectedSubTab("knowledge-bank");
    };

    window.addEventListener('switchToTopic', handleSwitchToTopic as EventListener);
    window.addEventListener('switchToKnowledgeBank', handleSwitchToKnowledgeBank as EventListener);
    
    return () => {
      window.removeEventListener('switchToTopic', handleSwitchToTopic as EventListener);
      window.removeEventListener('switchToKnowledgeBank', handleSwitchToKnowledgeBank as EventListener);
    };
  }, []);
  
  // Extract category from selectedTab for filtering
  const getTopicIdFromTab = (tabId: string) => {
    if (tabId === "all-posts") return undefined;
    const topic = userTopics.find(t => `topic-${t.topic_id}` === tabId);
    return topic?.topic_id?.toString();
  };
  
  const topicId = getTopicIdFromTab(selectedTab);
  const { data: allBlogPosts = [], isLoading } = useBlogPosts();
  const markPostAsReadMutation = useMarkPostAsRead();

  // Filter posts based on selected topic
  const filteredPosts = selectedTab === "all-posts" 
    ? allBlogPosts 
    : allBlogPosts.filter(post => post.label_id?.toString() === topicId);

  // Filter posts based on search query (only for all-posts tab)
  const searchFilteredPosts = selectedTab === "all-posts" && searchQuery
    ? filteredPosts.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.blogs?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredPosts;

  const handleMarkAsRead = (postId: string) => {
    markPostAsReadMutation.mutate(postId);
  };

  // Build tabs array
  const tabs = [
    { id: "all-posts", label: "All Posts", count: allBlogPosts.length },
    ...userTopics.map(topic => ({
      id: `topic-${topic.topic_id}`,
      label: topic.name,
      count: allBlogPosts.filter(post => post.label_id === topic.topic_id).length
    }))
  ];

  const handleAddTab = () => {
    setIsAddTopicDialogOpen(true);
  };

  const renderContent = () => {
    // Show individual blog post content
    if (selectedTab.startsWith("post-")) {
      const postId = selectedTab.replace("post-", "");
      const post = allBlogPosts.find(p => p.id === postId);
      
      if (post) {
        return (
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{post.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{post.blogs?.name}</span>
                  <span>•</span>
                  <span>{new Date(post.detected_at).toLocaleDateString()}</span>
                </div>
              </div>
              
              {post.summary && (
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <h2 className="font-semibold text-gray-900 mb-2">Summary</h2>
                  <p className="text-gray-700">{post.summary}</p>
                </div>
              )}
              
              {post.content && (
                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: post.content }} />
                </div>
              )}
              
              {post.link && (
                <div className="mt-6 pt-6 border-t">
                  <a 
                    href={post.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                  >
                    Read full article
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          </div>
        );
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
      // Determine which posts to show based on sub-tab
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
            <div className="bg-white border-b border-gray-200">
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

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar selectedTab={selectedTab} onTabChange={setSelectedTab} />
        <SidebarInset className="flex-1">
          <div className="w-full">
            {/* Header with Google-style layout */}
            <div className="w-full bg-white border-b border-gray-200">
              <div className="flex items-center px-6 py-4">
                <SidebarTrigger className="-ml-1 mr-4" />
                <div className="flex-1">
                  <TabNavigation
                    tabs={tabs}
                    activeTab={selectedTab}
                    onTabChange={setSelectedTab}
                    onAddTab={handleAddTab}
                  />
                </div>
              </div>
            </div>
            
            <main className="mt-0">
              {renderContent()}
            </main>
          </div>
        </SidebarInset>
      </div>
      
      <AddTopicDialog 
        open={isAddTopicDialogOpen}
        onOpenChange={setIsAddTopicDialogOpen}
      />
    </SidebarProvider>
  );
};

export default Index;
