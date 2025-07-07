
import { Home, User, Plus } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";

interface AppSidebarProps {
  selectedTab: string;
  onTabChange: (tab: string) => void;
}

export function AppSidebar({ selectedTab, onTabChange }: AppSidebarProps) {
  const { user, signOut } = useAuth();
  const isActive = selectedTab === "all-posts";

  const handleAccountClick = () => {
    if (user) {
      // If user is logged in, show account options or sign out
      signOut();
    } else {
      // If user is not logged in, redirect to auth page
      window.location.href = "/auth";
    }
  };

  const handleAddPageClick = () => {
    // Trigger a custom event to open add page dialog or switch to notes view
    const event = new CustomEvent('openAddPageDialog');
    window.dispatchEvent(event);
  };

  return (
    <Sidebar 
      collapsible="none"
      className="w-16 bg-gray-900 border-r border-gray-800"
    >
      <SidebarHeader className="bg-gray-900 flex items-center justify-center pt-4 pb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => onTabChange("all-posts")}
              className={`w-12 h-12 flex items-center justify-center rounded-lg transition-colors ${
                isActive 
                  ? "bg-white text-gray-900" 
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <Home className="h-6 w-6" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent className="bg-gray-900 flex-1 flex items-center justify-center">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleAddPageClick}
              className="w-12 h-12 flex items-center justify-center rounded-lg transition-colors text-gray-400 hover:text-white hover:bg-gray-800"
              title="Add Page"
            >
              <Plus className="h-6 w-6" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="bg-gray-900 flex items-center justify-center pb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleAccountClick}
              className="w-12 h-12 flex items-center justify-center rounded-lg transition-colors text-gray-400 hover:text-white hover:bg-gray-800"
              title={user ? "Sign Out" : "Sign In"}
            >
              <User className="h-6 w-6" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
