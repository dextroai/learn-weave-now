import { TabNavigation } from "@/components/TabNavigation";
import { AddTopicDialog } from "@/components/AddTopicDialog";
import { MainContent } from "@/components/MainContent";
import { useIndexPageState } from "@/hooks/useIndexPageState";
import { Settings, User, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";

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
  const [searchParams, setSearchParams] = useSearchParams();

  // Handle URL parameters on component mount and when they change
  useEffect(() => {
    const topicParam = searchParams.get('topic');
    const pageParam = searchParams.get('page');
    
    console.log('URL params changed:', { topicParam, pageParam });
    
    if (topicParam) {
      const topicId = parseInt(topicParam);
      const topic = userTopics.find(t => t.topic_id === topicId);
      if (topic) {
        console.log('Setting selected tab from URL:', `topic-${topicId}`);
        setSelectedTab(`topic-${topicId}`);
        setTopicSubTab('notes');
      }
    } else {
      // If no topic param, default to 'all'
      if (selectedTab.startsWith('topic-')) {
        setSelectedTab('all');
      }
    }
  }, [searchParams, userTopics, setSelectedTab, setTopicSubTab]);

  const handleHomeClick = () => {
    console.log('Home clicked');
    setSelectedTab('all');
    setSearchParams({}); // Clear URL parameters
  };

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

  const handleTopicClick = (topicId: number) => {
    console.log('Topic clicked:', topicId);
    setSelectedTab(`topic-${topicId}`);
    setTopicSubTab('notes');
    // Update URL parameters to reflect the selected topic
    setSearchParams({ topic: topicId.toString() });
  };

  console.log('Index render:', {
    selectedTab,
    userTopicsCount: userTopics.length,
    currentParams: Object.fromEntries(searchParams.entries())
  });

  return (
    <div className="min-h-screen w-full bg-slate-900 text-white">
      {/* Compact Modern Header */}
      <div className="w-full bg-slate-900">
        <div className="flex items-center px-4 py-2">
          {/* Compact Navigation tabs */}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              className={`px-3 py-1.5 rounded text-sm font-medium h-8 ${
                selectedTab === 'all' 
                  ? "bg-orange-500 text-black hover:bg-orange-600" 
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
              onClick={handleHomeClick}
            >
              Home
            </Button>
            {userTopics.map((topic) => (
              <Button 
                key={topic.id}
                variant="ghost" 
                className={`px-3 py-1.5 text-sm h-8 rounded ${
                  selectedTab === `topic-${topic.topic_id}`
                    ? "text-white bg-slate-700"
                    : "text-gray-300 bg-slate-800 hover:text-white hover:bg-slate-700"
                }`}
                onClick={() => handleTopicClick(topic.topic_id)}
              >
                {topic.name}
              </Button>
            ))}
          </div>
          
          {/* Settings and Account section */}
          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSettingsClick}
              className="h-9 w-9 text-gray-300 hover:text-white hover:bg-slate-700"
            >
              <Settings className="h-4 w-4" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-300 hover:text-white hover:bg-slate-700">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                {user ? (
                  <>
                    <DropdownMenuItem disabled className="text-gray-300">
                      {user.email}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleAccountClick} className="text-gray-300 hover:bg-slate-700">
                      Sign Out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem onClick={handleAccountClick} className="text-gray-300 hover:bg-slate-700">
                    Sign In
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Title - Only show for Home (all/knowledge tabs) */}
      {(selectedTab === 'all' || selectedTab === 'knowledge') && (
        <div className="px-6 py-8 flex flex-col items-center">
          <h1 className="text-4xl font-bold text-white mb-8">Firenotes</h1>
          
          {/* Tab Navigation for Posts/Knowledge Bank */}
          <div className="flex items-center space-x-8 mb-8">
            <button
              onClick={() => setSelectedTab('all')}
              className={`flex items-center space-x-2 pb-3 text-sm font-medium transition-colors border-b-2 ${
                selectedTab === 'all'
                  ? "text-white border-red-500"
                  : "text-gray-400 hover:text-white border-transparent"
              }`}
            >
              <span className="text-red-500">📄</span>
              <span>Posts</span>
            </button>
            
            <button
              onClick={() => setSelectedTab('knowledge')}
              className={`flex items-center space-x-2 pb-3 text-sm font-medium transition-colors border-b-2 ${
                selectedTab === 'knowledge'
                  ? "text-white border-green-500"
                  : "text-gray-400 hover:text-white border-transparent"
              }`}
            >
              <span className="text-green-500">📁</span>
              <span>Knowledge bank</span>
              <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded">
                {knowledgeBankPosts?.length || 0}
              </span>
            </button>
          </div>
        </div>
      )}
      
      <main>
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