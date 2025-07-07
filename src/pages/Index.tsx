
import { TabNavigation } from "@/components/TabNavigation";
import { AddTopicDialog } from "@/components/AddTopicDialog";
import { MainContent } from "@/components/MainContent";
import { useIndexPageState } from "@/hooks/useIndexPageState";

const Index = () => {
  const {
    selectedTab,
    setSelectedTab,
    selectedSubTab,
    setSelectedSubTab,
    topicSubTab,
    setTopicSubTab,
    searchQuery,
    setSearchQuery,
    isAddTopicDialogOpen,
    setIsAddTopicDialogOpen,
    userTopics,
    knowledgeBankPosts,
    allBlogPosts,
    isLoading,
    filteredPosts,
    searchFilteredPosts,
    handleMarkAsRead,
    tabs,
    handleAddTab
  } = useIndexPageState();

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Header with Google-style layout */}
      <div className="w-full bg-white border-b border-gray-200">
        <div className="flex items-center px-6 py-4">
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
        <MainContent
          selectedTab={selectedTab}
          selectedSubTab={selectedSubTab}
          topicSubTab={topicSubTab}
          setTopicSubTab={setTopicSubTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          userTopics={userTopics}
          knowledgeBankPosts={knowledgeBankPosts}
          allBlogPosts={allBlogPosts}
          searchFilteredPosts={searchFilteredPosts}
          filteredPosts={filteredPosts}
          isLoading={isLoading}
          handleMarkAsRead={handleMarkAsRead}
          setSelectedSubTab={setSelectedSubTab}
        />
      </main>
      
      <AddTopicDialog 
        open={isAddTopicDialogOpen}
        onOpenChange={setIsAddTopicDialogOpen}
      />
    </div>
  );
};

export default Index;
