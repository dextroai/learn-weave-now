
import { useState } from "react";
import { 
  Book, 
  Home, 
  Settings, 
  Tags, 
  Archive, 
  Bell,
  Plus,
  Search
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
import { Input } from "@/components/ui/input";

interface AppSidebarProps {
  selectedTab: string;
  onTabChange: (tab: string) => void;
}

export function AppSidebar({ selectedTab, onTabChange }: AppSidebarProps) {
  const { collapsed } = useSidebar();
  const [searchQuery, setSearchQuery] = useState("");

  const mainItems = [
    { title: "Dashboard", id: "dashboard", icon: Home, badge: null },
    { title: "All Blogs", id: "blogs", icon: Book, badge: "12" },
    { title: "Labels", id: "labels", icon: Tags, badge: "3" },
    { title: "Archive", id: "archive", icon: Archive, badge: null },
    { title: "Notifications", id: "notifications", icon: Bell, badge: "5" },
  ];

  const labels = [
    { name: "React", count: 8, color: "bg-blue-500" },
    { name: "AI/ML", count: 5, color: "bg-purple-500" },
    { name: "Design", count: 3, color: "bg-pink-500" },
    { name: "Backend", count: 6, color: "bg-green-500" },
    { name: "DevOps", count: 4, color: "bg-orange-500" },
  ];

  const isActive = (id: string) => selectedTab === id;

  return (
    <Sidebar className={`${collapsed ? "w-16" : "w-72"} transition-all duration-300`}>
      <SidebarContent className="bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          {!collapsed && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Book className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-slate-900 dark:text-white">
                  LearnWeave
                </span>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search workspace..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
              </div>
            </>
          )}
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>Main</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onTabChange(item.id)}
                    className={`w-full justify-start ${
                      isActive(item.id) 
                        ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-r-2 border-blue-600" 
                        : "hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <item.icon className={`h-4 w-4 ${collapsed ? "mx-auto" : "mr-3"}`} />
                    {!collapsed && (
                      <>
                        <span className="flex-1">{item.title}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto">
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

        {/* Labels Section */}
        {!collapsed && (
          <SidebarGroup>
            <div className="flex items-center justify-between px-2">
              <SidebarGroupLabel>Labels</SidebarGroupLabel>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <SidebarGroupContent>
              <SidebarMenu>
                {labels.map((label) => (
                  <SidebarMenuItem key={label.name}>
                    <SidebarMenuButton className="w-full justify-start hover:bg-slate-50 dark:hover:bg-slate-800">
                      <div className={`w-3 h-3 rounded-full ${label.color} mr-3`} />
                      <span className="flex-1">{label.name}</span>
                      <Badge variant="outline" className="ml-auto text-xs">
                        {label.count}
                      </Badge>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Settings */}
        <div className="mt-auto p-4 border-t border-slate-200 dark:border-slate-700">
          <SidebarMenuButton
            onClick={() => onTabChange("settings")}
            className={`w-full justify-start ${
              isActive("settings") 
                ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300" 
                : "hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <Settings className={`h-4 w-4 ${collapsed ? "mx-auto" : "mr-3"}`} />
            {!collapsed && <span>Settings</span>}
          </SidebarMenuButton>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
