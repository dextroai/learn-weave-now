
import { useState } from "react";
import { 
  Book, 
  Settings, 
  Archive,
  Plus,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBlogs } from "@/hooks/useBlogs";

interface AppSidebarProps {
  selectedTab: string;
  onTabChange: (tab: string) => void;
}

export function AppSidebar({ selectedTab, onTabChange }: AppSidebarProps) {
  const { state } = useSidebar();
  const navigate = useNavigate();
  const isCollapsed = state === "collapsed";
  const [showAllBlogs, setShowAllBlogs] = useState(false);
  
  const { data: blogs = [] } = useBlogs();

  const mainItems = [
    { title: "All Blogs", id: "blogs", icon: Book, badge: "12" },
  ];

  const archiveItems = [
    { title: "Archive", id: "archive", icon: Archive, badge: null },
  ];

  const isActive = (id: string) => selectedTab === id;

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  const handleBlogClick = (blogId: string) => {
    onTabChange(`blog-${blogId}`);
  };

  const displayedBlogs = showAllBlogs ? blogs : blogs.slice(0, 5);

  return (
    <Sidebar 
      collapsible="icon"
      className="bg-white border-r border-gray-200"
    >
      <SidebarContent className="bg-white">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          {!isCollapsed && (
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-lg flex items-center justify-center">
                <Book className="h-3 w-3 text-white" />
              </div>
              <span className="font-semibold text-gray-800 text-sm">
                LearnWeave
              </span>
            </div>
          )}
          {isCollapsed && (
            <div className="flex justify-center">
              <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-lg flex items-center justify-center">
                <Book className="h-3 w-3 text-white" />
              </div>
            </div>
          )}
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          {!isCollapsed && <SidebarGroupLabel className="text-gray-600 text-xs font-medium px-4 py-2">Main</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onTabChange(item.id)}
                    isActive={isActive(item.id)}
                    tooltip={isCollapsed ? item.title : undefined}
                    className={`w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-50 text-sm mx-2 rounded-lg ${
                      isActive(item.id) 
                        ? "bg-orange-50 text-orange-800 border-r-2 border-orange-500" 
                        : ""
                    }`}
                  >
                    <item.icon className={`h-4 w-4 ${isCollapsed ? "mx-auto" : "mr-3"} text-orange-500`} />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-sm font-medium">{item.title}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto bg-gray-100 text-gray-600 text-xs px-2 py-1">
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Individual Blogs Section */}
        {!isCollapsed && blogs.length > 0 && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {displayedBlogs.map((blog) => (
                  <SidebarMenuItem key={blog.id}>
                    <SidebarMenuButton
                      onClick={() => handleBlogClick(blog.id)}
                      isActive={isActive(`blog-${blog.id}`)}
                      className={`w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-50 text-xs mx-2 rounded-lg pl-8 ${
                        isActive(`blog-${blog.id}`) 
                          ? "bg-orange-50 text-orange-800 border-r-2 border-orange-500" 
                          : ""
                      }`}
                    >
                      <span className="flex-1 text-xs truncate">{blog.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                
                {blogs.length > 5 && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setShowAllBlogs(!showAllBlogs)}
                      className="w-full justify-start text-gray-500 hover:text-gray-700 hover:bg-gray-50 text-xs mx-2 rounded-lg pl-8"
                    >
                      {showAllBlogs ? (
                        <ChevronDown className="h-3 w-3 mr-2" />
                      ) : (
                        <ChevronRight className="h-3 w-3 mr-2" />
                      )}
                      <span className="text-xs">
                        {showAllBlogs ? 'Show Less' : `View All (${blogs.length})`}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Archive Section */}
        <SidebarGroup>
          {!isCollapsed && <SidebarGroupLabel className="text-gray-600 text-xs font-medium px-4 py-2">Archive</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {archiveItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onTabChange(item.id)}
                    isActive={isActive(item.id)}
                    tooltip={isCollapsed ? item.title : undefined}
                    className={`w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-50 text-sm mx-2 rounded-lg ${
                      isActive(item.id) 
                        ? "bg-orange-50 text-orange-800 border-r-2 border-orange-500" 
                        : ""
                    }`}
                  >
                    <item.icon className={`h-4 w-4 ${isCollapsed ? "mx-auto" : "mr-3"} text-gray-500`} />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-sm font-medium">{item.title}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto bg-gray-100 text-gray-600 text-xs px-2 py-1">
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <div className="mt-auto p-3 border-t border-gray-200">
          <SidebarMenuButton
            onClick={handleSettingsClick}
            tooltip={isCollapsed ? "Settings" : undefined}
            className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-50 text-sm rounded-lg"
          >
            <Settings className={`h-4 w-4 ${isCollapsed ? "mx-auto" : "mr-3"} text-gray-500`} />
            {!isCollapsed && <span className="text-sm font-medium">Settings</span>}
          </SidebarMenuButton>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
