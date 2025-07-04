
import { Home } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

interface AppSidebarProps {
  selectedTab: string;
  onTabChange: (tab: string) => void;
}

export function AppSidebar({ selectedTab, onTabChange }: AppSidebarProps) {
  const isActive = selectedTab === "all-posts";

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
      <SidebarContent className="bg-gray-900">
        {/* Additional content can be added here later */}
      </SidebarContent>
    </Sidebar>
  );
}
