
import { cn } from "@/lib/utils";
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface AllPostsSubNavigationProps {
  activeSubTab: string;
  onSubTabChange: (subTab: string) => void;
  allPostsCount: number;
  knowledgeBankCount: number;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  isAllPostsView?: boolean;
}

export const AllPostsSubNavigation = ({ 
  activeSubTab, 
  onSubTabChange, 
  allPostsCount, 
  knowledgeBankCount,
  searchQuery = "",
  onSearchChange,
  isAllPostsView = false
}: AllPostsSubNavigationProps) => {
  const subTabs = [
    { id: 'all', label: 'All', count: allPostsCount },
    { id: 'knowledge-bank', label: 'My Knowledge Bank', count: knowledgeBankCount }
  ];

  const getSearchPlaceholder = () => {
    if (activeSubTab === 'knowledge-bank') {
      return "Search in My Knowledge Bank...";
    }
    return "Search all posts...";
  };

  return (
    <div className="w-full bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Always show centered search bar */}
        <div className="py-6 border-b border-gray-100 flex justify-center">
          <div className="relative max-w-md w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder={getSearchPlaceholder()}
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border-gray-200 rounded-full focus:bg-white focus-visible:ring-1 focus-visible:ring-gray-300 w-full"
            />
          </div>
        </div>

        {/* Centered Sub Navigation Tabs */}
        <div className="flex items-center justify-center gap-8 py-4">
          {subTabs.map((subTab) => (
            <button
              key={subTab.id}
              onClick={() => onSubTabChange(subTab.id)}
              className={cn(
                "flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors hover:bg-gray-50 rounded-t-lg",
                activeSubTab === subTab.id
                  ? "border-blue-500 text-blue-600 bg-blue-50"
                  : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
              )}
            >
              <span>{subTab.label}</span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-normal">
                {subTab.count}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
