import { Home, Search, Grid3X3, User, ArrowUp, Download, Plus } from "lucide-react";
import { NavLink } from "react-router-dom";
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
import { Button } from "@/components/ui/button";

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
  const isCollapsed = state === "collapsed";

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
              {userTopics.map((topic) => (
                <SidebarMenuItem key={topic.id}>
                  <div className="flex items-center gap-1 mb-1">
                    <SidebarMenuButton asChild className="h-10 px-2 flex-1">
                      <NavLink
                        to={`/?topic=${topic.topic_id}`}
                        className={({ isActive }) =>
                          `flex items-center justify-center text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ${
                            isActive ? "text-white bg-slate-800" : ""
                          }`
                        }
                        title={topic.name}
                      >
                        <span className="text-xs font-medium truncate max-w-[24px] text-center">
                          {topic.name.charAt(0).toUpperCase()}
                        </span>
                      </NavLink>
                    </SidebarMenuButton>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-gray-400 hover:text-white hover:bg-slate-800 rounded"
                      onClick={() => {
                        // TODO: Add functionality to create new page for this topic
                        console.log(`Add page for topic: ${topic.name}`);
                      }}
                      title={`Add page for ${topic.name}`}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </SidebarMenuItem>
              ))}
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