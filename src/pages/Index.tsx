
import { TabNavigation } from "@/components/TabNavigation";
import { AddTopicDialog } from "@/components/AddTopicDialog";
import { MainContent } from "@/components/MainContent";
import { useIndexPageState } from "@/hooks/useIndexPageState";
import { Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

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

  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSettingsClick = () => {
    navigate("/settings");
  };

  const handleAccountClick = () => {
    if (user) {
      signOut();
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Header with Google-style layout */}
      <div className="w-full bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex-1">
            <TabNavigation
              tabs={tabs}
              activeTab={selectedTab}
              onTabChange={setSelectedTab}
              onAddTab={handleAddTab}
            />
          </div>
          
          {/* Settings and Account section */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSettingsClick}
              className="h-9 w-9"
            >
              <Settings className="h-4 w-4" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {user ? (
                  <>
                    <DropdownMenuItem disabled>
                      {user.email}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleAccountClick}>
                      Sign Out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem onClick={handleAccountClick}>
                    Sign In
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
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
