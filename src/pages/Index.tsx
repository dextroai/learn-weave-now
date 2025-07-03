
import { useState } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TabNavigation } from "@/components/TabNavigation";
import { BlogPostGrid } from "@/components/BlogPostGrid";
import { NotesEditor } from "@/components/NotesEditor";
import { Separator } from "@/components/ui/separator";
import { useBlogPosts, useMarkPostAsRead } from "@/hooks/useBlogPosts";
import { useUserTopics } from "@/hooks/useUserTopics";

const Index = () => {
  const [selectedTab, setSelectedTab] = useState("all-posts");
  
  // Get user topics to build tabs
  const { data: userTopics = [] } = useUserTopics();
  
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
    // TODO: Implement add new topic functionality
    console.log("Add new topic");
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
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

    // Show filtered blog posts grid for topic tabs with notes section
    if (selectedTab.startsWith("topic-")) {
      const topic = userTopics.find(t => `topic-${t.topic_id}` === selectedTab);
      
      return (
        <>
          <div className="max-w-2xl mx-auto px-6">
            <BlogPostGrid 
              posts={filteredPosts}
              isLoading={isLoading}
              onMarkAsRead={handleMarkAsRead}
            />
          </div>
          
          {/* Full-width separator */}
          <div className="w-full mt-8">
            <Separator className="w-full" />
          </div>
          
          {/* Full-width notes section */}
          <div className="w-full min-h-screen bg-gray-50">
            <NotesEditor category={topic?.name.toLowerCase().replace(' ', '-') || 'general'} />
          </div>
        </>
      );
    }

    // Show filtered blog posts grid for "all-posts"
    return (
      <div className="max-w-2xl mx-auto px-6">
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
            <div className="max-w-2xl mx-auto px-6 py-4">
              <header className="flex h-8 shrink-0 items-center gap-2 mb-4">
                <SidebarTrigger className="-ml-1" />
              </header>
              
              <TabNavigation
                tabs={tabs}
                activeTab={selectedTab}
                onTabChange={setSelectedTab}
                onAddTab={handleAddTab}
              />
            </div>
            
            <main className="mt-4">
              {renderContent()}
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
