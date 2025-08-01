import { Home, Search, Grid3X3, User, ArrowUp, Download, Plus, ChevronDown, ChevronRight } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useUserTopics } from "@/hooks/useUserTopics";
import { useNotePagesDatabase } from "@/hooks/useNotePagesDatabase";
import { Button } from "@/components/ui/button";

// Component for individual topic
function TopicSection({ topic, isSelected, onSelect }: { topic: any; isSelected: boolean; onSelect: () => void }) {
  const { pages, addPage } = useNotePagesDatabase(topic.name.toLowerCase().replace(' ', '-'));

  const handleAddPage = () => {
    const pageTitle = prompt(`Enter page title for ${topic.name}:`);
    if (pageTitle) {
      const newPage = {
        id: Date.now().toString(),
        title: pageTitle,
      };
      addPage(newPage);
    }
  };

  if (isSelected) {
    // Show + sign and page titles for selected topic
    return (
      <div className="mb-1 space-y-1">
        {/* Add Page Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-full text-gray-500 hover:text-white hover:bg-slate-800 rounded text-xs"
          onClick={handleAddPage}
          title={`Add page to ${topic.name}`}
        >
          <Plus className="h-3 w-3" />
        </Button>
        
        {/* Pages */}
        {pages.map((page) => (
          <SidebarMenuButton key={page.id} asChild className="h-6 px-1 w-full">
            <NavLink
              to={`/?topic=${topic.topic_id}&page=${page.id}`}
              className={({ isActive }) =>
                `flex items-center text-gray-500 hover:text-white hover:bg-slate-700 rounded text-xs transition-colors truncate ${
                  isActive ? "text-white bg-slate-700" : ""
                }`
              }
              title={page.title}
            >
              <span className="text-xs truncate w-full text-center">
                {page.title.length > 3 ? page.title.substring(0, 3) + '...' : page.title}
              </span>
            </NavLink>
          </SidebarMenuButton>
        ))}
      </div>
    );
  }

  // Show topic label when not selected
  return (
    <div className="mb-1">
      <div 
        className="h-6 w-full cursor-pointer flex items-center justify-center text-gray-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
        onClick={onSelect}
        title={topic.name}
      >
        <span className="text-xs font-medium">
          {topic.name.charAt(0).toUpperCase()}
        </span>
      </div>
    </div>
  );
}

const navigationItems = [];

const bottomItems = [
  { title: "Account", url: "/account", icon: User, hasIndicator: true },
  { title: "Upgrade", url: "/upgrade", icon: ArrowUp },
  { title: "Install", url: "/install", icon: Download, hasNotification: true },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { user } = useAuth();
  const { data: userTopics = [] } = useUserTopics();
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const isCollapsed = state === "collapsed";

  const handleTopicSelect = (topicId: string) => {
    setSelectedTopicId(topicId);
  };

  return (
    <Sidebar className="w-12 bg-slate-900 border-r border-slate-700 h-screen fixed left-0 top-0 z-50" collapsible="none">
      <SidebarContent className="bg-slate-900 h-full flex flex-col">
        {/* Logo/Brand */}
        <div className="p-2 flex items-center justify-center">
          <div className="w-5 h-5 bg-white rounded text-slate-900 flex items-center justify-center text-xs font-bold">
            F
          </div>
        </div>

        {/* User Topics */}
        <SidebarGroup className="mt-8">
          <SidebarGroupContent>
            <SidebarMenu>
              {selectedTopicId ? (
                // Show only the selected topic's + button and pages
                userTopics
                  .filter((topic) => topic.id === selectedTopicId)
                  .map((topic) => (
                    <SidebarMenuItem key={topic.id}>
                      <TopicSection 
                        topic={topic} 
                        isSelected={true}
                        onSelect={() => {}}
                      />
                    </SidebarMenuItem>
                  ))
              ) : (
                // Show all topic labels when none selected
                userTopics.map((topic) => (
                  <SidebarMenuItem key={topic.id}>
                    <TopicSection 
                      topic={topic} 
                      isSelected={false}
                      onSelect={() => handleTopicSelect(topic.id)}
                    />
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Bottom Navigation */}
        <div className="mt-auto pb-4">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {bottomItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="h-10 px-2 mb-1">
                      <NavLink
                        to={item.url}
                        className={({ isActive }) =>
                          `flex items-center justify-center text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors relative ${
                            isActive ? "text-white bg-slate-800" : ""
                          }`
                        }
                        title={item.title}
                      >
                        <div className="relative">
                          <item.icon className="h-4 w-4" />
                          {item.hasNotification && (
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                          )}
                          {item.hasIndicator && user && (
                            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                          )}
                        </div>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}