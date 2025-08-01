import { Home, Search, Grid3X3, User, ArrowUp, Download } from "lucide-react";
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

const navigationItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Discover", url: "/discover", icon: Search },
  { title: "Spaces", url: "/spaces", icon: Grid3X3 },
];

const bottomItems = [
  { title: "Account", url: "/account", icon: User, hasIndicator: true },
  { title: "Upgrade", url: "/upgrade", icon: ArrowUp },
  { title: "Install", url: "/install", icon: Download, hasNotification: true },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { user } = useAuth();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar className={`${isCollapsed ? "w-14" : "w-60"} bg-slate-900 border-r border-slate-800`}>
      <SidebarContent className="bg-slate-900">
        {/* Logo/Brand */}
        <div className="p-4 flex items-center justify-center">
          {!isCollapsed ? (
            <div className="text-white font-bold text-xl">FN</div>
          ) : (
            <div className="w-6 h-6 bg-white rounded text-slate-900 flex items-center justify-center text-sm font-bold">
              F
            </div>
          )}
        </div>

        {/* Main Navigation */}
        <SidebarGroup className="mt-8">
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-12 px-4 mb-2">
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        `flex items-center gap-3 text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ${
                          isActive ? "text-white bg-slate-800" : ""
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!isCollapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
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
                    <SidebarMenuButton asChild className="h-12 px-4 mb-2">
                      <NavLink
                        to={item.url}
                        className={({ isActive }) =>
                          `flex items-center gap-3 text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors relative ${
                            isActive ? "text-white bg-slate-800" : ""
                          }`
                        }
                      >
                        <div className="relative">
                          <item.icon className="h-5 w-5 flex-shrink-0" />
                          {item.hasNotification && (
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                          )}
                        </div>
                        {!isCollapsed && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{item.title}</span>
                            {item.hasIndicator && user && (
                              <span className="text-xs text-green-400">✓</span>
                            )}
                          </div>
                        )}
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