
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
    <div className="border-b border-gray-200 bg-white">
      <div className="flex items-center px-6 py-3">
        <div className="flex items-center space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={`ml-2 text-xs ${
                  activeTab === tab.id ? "text-gray-300" : "text-gray-400"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
          
          {onAddTab && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onAddTab}
              className="ml-2 h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
