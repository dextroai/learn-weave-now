
import { useState } from "react";
import { 
  Book, 
  Settings, 
  Archive,
  Plus
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

interface AppSidebarProps {
  selectedTab: string;
  onTabChange: (tab: string) => void;
}

export function AppSidebar({ selectedTab, onTabChange }: AppSidebarProps) {
  const { state } = useSidebar();
  const navigate = useNavigate();
  const collapsed = state === "collapsed";

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

  return (
    <Sidebar className={`${collapsed ? "w-16" : "w-64"} transition-all duration-300 bg-white border-r border-gray-200`}>
      <SidebarContent className="bg-white">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          {!collapsed && (
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-lg flex items-center justify-center">
                <Book className="h-3 w-3 text-white" />
              </div>
              <span className="font-semibold text-gray-800 text-sm">
                LearnWeave
              </span>
            </div>
          )}
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-gray-600 text-xs font-medium px-4 py-2">Main</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onTabChange(item.id)}
                    className={`w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-50 text-sm mx-2 rounded-lg ${
                      isActive(item.id) 
                        ? "bg-orange-50 text-orange-800 border-r-2 border-orange-500" 
                        : ""
                    }`}
                  >
                    <item.icon className={`h-4 w-4 ${collapsed ? "mx-auto" : "mr-3"} text-orange-500`} />
                    {!collapsed && (
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

        {/* Archive Section */}
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-gray-600 text-xs font-medium px-4 py-2">Archive</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {archiveItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onTabChange(item.id)}
                    className={`w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-50 text-sm mx-2 rounded-lg ${
                      isActive(item.id) 
                        ? "bg-orange-50 text-orange-800 border-r-2 border-orange-500" 
                        : ""
                    }`}
                  >
                    <item.icon className={`h-4 w-4 ${collapsed ? "mx-auto" : "mr-3"} text-gray-500`} />
                    {!collapsed && (
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
            className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-50 text-sm rounded-lg"
          >
            <Settings className={`h-4 w-4 ${collapsed ? "mx-auto" : "mr-3"} text-gray-500`} />
            {!collapsed && <span className="text-sm font-medium">Settings</span>}
          </SidebarMenuButton>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
