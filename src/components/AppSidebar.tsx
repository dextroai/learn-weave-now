
import { useState } from "react";
import { 
  Book, 
  Settings, 
  Archive,
  Plus
} from "lucide-react";
import { NavLink } from "react-router-dom";
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
  const collapsed = state === "collapsed";

  const mainItems = [
    { title: "All Blogs", id: "blogs", icon: Book, badge: "12" },
  ];

  const archiveItems = [
    { title: "Archive", id: "archive", icon: Archive, badge: null },
  ];

  const isActive = (id: string) => selectedTab === id;

  return (
    <Sidebar className={`${collapsed ? "w-16" : "w-48"} transition-all duration-300`}>
      <SidebarContent className="bg-white border-r border-gray-200">
        {/* Header */}
        <div className="p-3 border-b border-gray-200">
          {!collapsed && (
            <div className="flex items-center gap-2 mb-3">
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
          {!collapsed && <SidebarGroupLabel className="text-gray-600 text-xs">Main</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onTabChange(item.id)}
                    className={`w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-100 text-sm ${
                      isActive(item.id) 
                        ? "bg-orange-50 text-orange-800 border-r-2 border-orange-500" 
                        : ""
                    }`}
                  >
                    <item.icon className={`h-4 w-4 ${collapsed ? "mx-auto" : "mr-2"}`} />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-sm">{item.title}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto bg-gray-200 text-gray-700 text-xs">
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
          {!collapsed && <SidebarGroupLabel className="text-gray-600 text-xs">Archive</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {archiveItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onTabChange(item.id)}
                    className={`w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-100 text-sm ${
                      isActive(item.id) 
                        ? "bg-orange-50 text-orange-800 border-r-2 border-orange-500" 
                        : ""
                    }`}
                  >
                    <item.icon className={`h-4 w-4 ${collapsed ? "mx-auto" : "mr-2"}`} />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-sm">{item.title}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto bg-gray-200 text-gray-700 text-xs">
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
            onClick={() => onTabChange("settings")}
            className={`w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-100 text-sm ${
              isActive("settings") 
                ? "bg-orange-50 text-orange-800" 
                : ""
            }`}
          >
            <Settings className={`h-4 w-4 ${collapsed ? "mx-auto" : "mr-2"}`} />
            {!collapsed && <span className="text-sm">Settings</span>}
          </SidebarMenuButton>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
