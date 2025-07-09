
import { useState, useEffect } from "react";
import { useBlogPosts, useMarkPostAsRead } from "@/hooks/useBlogPosts";
import { useUserTopics } from "@/hooks/useUserTopics";
import { useKnowledgeBank } from "@/hooks/useKnowledgeBank";

export const useIndexPageState = () => {
  const [selectedTab, setSelectedTab] = useState("all-posts");
  const [selectedSubTab, setSelectedSubTab] = useState("all");
  const [topicSubTab, setTopicSubTab] = useState("sources"); // Changed default to "sources"
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddTopicDialogOpen, setIsAddTopicDialogOpen] = useState(false);
  const [showAddPageDialog, setShowAddPageDialog] = useState(false);
  
  const { data: userTopics = [] } = useUserTopics();
  const { knowledgeBankPosts } = useKnowledgeBank();
  const { data: allBlogPosts = [], isLoading } = useBlogPosts();
  const markPostAsReadMutation = useMarkPostAsRead();

  // Listen for custom events to switch tabs
  useEffect(() => {
    const handleSwitchToTopic = (event: CustomEvent) => {
      const { topicId } = event.detail;
      if (topicId) {
        setSelectedTab(`topic-${topicId}`);
        setTopicSubTab("sources"); // Default to Knowledge Bank when switching to topic
      }
    };

    const handleSwitchToKnowledgeBank = () => {
      setSelectedTab("all-posts");
      setSelectedSubTab("knowledge-bank");
    };

    const handleOpenAddPageDialog = () => {
      if (selectedTab.startsWith("topic-")) {
        setShowAddPageDialog(true);
      } else {
        if (userTopics.length > 0) {
          setSelectedTab(`topic-${userTopics[0].topic_id}`);
          setTopicSubTab("notes");
        } else {
          setIsAddTopicDialogOpen(true);
        }
      }
    };

    window.addEventListener('switchToTopic', handleSwitchToTopic as EventListener);
    window.addEventListener('switchToKnowledgeBank', handleSwitchToKnowledgeBank as EventListener);
    window.addEventListener('openAddPageDialog', handleOpenAddPageDialog as EventListener);
    
    return () => {
      window.removeEventListener('switchToTopic', handleSwitchToTopic as EventListener);
      window.removeEventListener('switchToKnowledgeBank', handleSwitchToKnowledgeBank as EventListener);
      window.removeEventListener('openAddPageDialog', handleOpenAddPageDialog as EventListener);
    };
  }, [selectedTab, userTopics]);

  const getTopicIdFromTab = (tabId: string) => {
    if (tabId === "all-posts") return undefined;
    const topic = userTopics.find(t => `topic-${t.topic_id}` === tabId);
    return topic?.topic_id?.toString();
  };
  
  const topicId = getTopicIdFromTab(selectedTab);
  const filteredPosts = selectedTab === "all-posts" 
    ? allBlogPosts 
    : allBlogPosts.filter(post => post.label_id?.toString() === topicId);

  const searchFilteredPosts = selectedTab === "all-posts" && searchQuery
    ? filteredPosts.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.blogs?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredPosts;

  const handleMarkAsRead = (postId: string) => {
    markPostAsReadMutation.mutate(postId);
  };

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

  return {
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
    showAddPageDialog,
    setShowAddPageDialog,
    userTopics,
    knowledgeBankPosts,
    allBlogPosts,
    isLoading,
    filteredPosts,
    searchFilteredPosts,
    handleMarkAsRead,
    tabs,
    handleAddTab
  };
};
