
import { cn } from "@/lib/utils";

interface TopicSubNavigationProps {
  activeSubTab: string;
  onSubTabChange: (subTab: string) => void;
  notesCount: number;
  sourcesCount: number;
}

export const TopicSubNavigation = ({ 
  activeSubTab, 
  onSubTabChange, 
  notesCount, 
  sourcesCount 
}: TopicSubNavigationProps) => {
  const subTabs = [
    { id: 'notes', label: 'Notes', count: notesCount },
    { id: 'sources', label: 'Sources', count: sourcesCount }
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
