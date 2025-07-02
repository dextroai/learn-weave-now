
import { useState } from "react";
import { 
  Book, 
  Settings, 
  Archive,
  Plus,
  Search,
  Square,
  Circle,
  Triangle,
  Star,
  Heart,
  Coffee,
  Bookmark,
  Calendar,
  Users,
  ShoppingBag,
  Shield,
  Code
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
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const [searchQuery, setSearchQuery] = useState("");

  const mainItems = [
    { title: "All Blogs", id: "blogs", icon: Book, badge: "12" },
  ];

  const labels = [
    { name: "Art of conversation", count: 2, color: "bg-blue-500", icon: Circle },
    { name: "Bucket List", count: 5, color: "bg-purple-500", icon: Square },
    { name: "Chai Cafe", count: 3, color: "bg-yellow-500", icon: Coffee },
    { name: "comics/book", count: 8, color: "bg-green-500", icon: Bookmark },
    { name: "Daily 5 Min. Journal", count: 12, color: "bg-red-500", icon: Calendar },
    { name: "Dating To Marriage Ideas", count: 4, color: "bg-pink-500", icon: Heart },
    { name: "Family", count: 6, color: "bg-orange-500", icon: Users },
    { name: "Fashion + Fashion Influence...", count: 7, color: "bg-indigo-500", icon: ShoppingBag },
    { name: "Ideas Bank Implementation", count: 9, color: "bg-cyan-500", icon: Star },
    { name: "Inshorts Type. GitHub Proje...", count: 3, color: "bg-teal-500", icon: Code },
    { name: "Insurance For Healthy Food...", count: 2, color: "bg-lime-500", icon: Shield },
  ];

  const archiveItems = [
    { title: "Archive", id: "archive", icon: Archive, badge: null },
  ];

  const isActive = (id: string) => selectedTab === id;

  return (
    <Sidebar className={`${collapsed ? "w-16" : "w-72"} transition-all duration-300`}>
      <SidebarContent className="bg-slate-900 border-r border-slate-700">
        {/* Header */}
        <div className="p-4 border-b border-slate-700">
          {!collapsed && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Book className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-white">
                  LearnWeave
                </span>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search workspace..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
                />
              </div>
            </>
          )}
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-slate-400">Main</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onTabChange(item.id)}
                    className={`w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800 ${
                      isActive(item.id) 
                        ? "bg-blue-950 text-blue-300 border-r-2 border-blue-600" 
                        : ""
                    }`}
                  >
                    <item.icon className={`h-4 w-4 ${collapsed ? "mx-auto" : "mr-3"}`} />
                    {!collapsed && (
                      <>
                        <span className="flex-1">{item.title}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto bg-slate-700 text-slate-300">
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
              <SidebarGroupLabel className="text-slate-400">Labels</SidebarGroupLabel>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-slate-400 hover:text-white hover:bg-slate-800">
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <SidebarGroupContent>
              <SidebarMenu>
                {labels.map((label) => (
                  <SidebarMenuItem key={label.name}>
                    <SidebarMenuButton className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800">
                      <label.icon className={`w-3 h-3 mr-3 text-white`} style={{ color: label.color.replace('bg-', '').replace('-500', '') }} />
                      <span className="flex-1 text-xs">{label.name}</span>
                      <Badge variant="outline" className="ml-auto text-xs bg-slate-800 text-slate-400 border-slate-600">
                        {label.count}
                      </Badge>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Archive Section */}
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-slate-400">Archive</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {archiveItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onTabChange(item.id)}
                    className={`w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800 ${
                      isActive(item.id) 
                        ? "bg-blue-950 text-blue-300 border-r-2 border-blue-600" 
                        : ""
                    }`}
                  >
                    <item.icon className={`h-4 w-4 ${collapsed ? "mx-auto" : "mr-3"}`} />
                    {!collapsed && (
                      <>
                        <span className="flex-1">{item.title}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto bg-slate-700 text-slate-300">
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
        <div className="mt-auto p-4 border-t border-slate-700">
          <SidebarMenuButton
            onClick={() => onTabChange("settings")}
            className={`w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800 ${
              isActive("settings") 
                ? "bg-blue-950 text-blue-300" 
                : ""
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
