
import { cn } from "@/lib/utils";

interface AllPostsSubNavigationProps {
  activeSubTab: string;
  onSubTabChange: (subTab: string) => void;
  allPostsCount: number;
  knowledgeBankCount: number;
}

export const AllPostsSubNavigation = ({ 
  activeSubTab, 
  onSubTabChange, 
  allPostsCount, 
  knowledgeBankCount 
}: AllPostsSubNavigationProps) => {
  const subTabs = [
    { id: 'all', label: 'All', count: allPostsCount },
    { id: 'knowledge-bank', label: 'My Knowledge Bank', count: knowledgeBankCount }
  ];

  return (
    <div className="flex items-center gap-1 mb-4 border-b border-gray-200">
      {subTabs.map((subTab) => (
        <button
          key={subTab.id}
          onClick={() => onSubTabChange(subTab.id)}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            activeSubTab === subTab.id
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          )}
        >
          {subTab.label}
          <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
            {subTab.count}
          </span>
        </button>
      ))}
    </div>
  );
};
