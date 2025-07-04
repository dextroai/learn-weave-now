
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onAddTab?: () => void;
}

export function TabNavigation({ tabs, activeTab, onTabChange, onAddTab }: TabNavigationProps) {
  return (
    <div className="flex items-center">
      <div className="flex items-center space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative pb-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === tab.id
                ? "text-blue-600 border-blue-600"
                : "text-gray-600 hover:text-gray-900 border-transparent hover:border-gray-300"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={`ml-2 text-xs ${
                activeTab === tab.id ? "text-blue-500" : "text-gray-400"
              }`}>
                ({tab.count})
              </span>
            )}
          </button>
        ))}
        
        {onAddTab && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddTab}
            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
