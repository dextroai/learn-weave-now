
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface TopicSubNavigationProps {
  activeSubTab: string;
  onSubTabChange: (subTab: string) => void;
  notesCount: number;
  sourcesCount: number;
  topicName?: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  showSearch?: boolean;
}

export const TopicSubNavigation = ({ 
  activeSubTab, 
  onSubTabChange, 
  notesCount: initialNotesCount, 
  sourcesCount,
  topicName = "General",
  searchQuery = "",
  onSearchChange,
  showSearch = true
}: TopicSubNavigationProps) => {
  const [notesCount, setNotesCount] = useState(initialNotesCount);

  const calculateNotesCount = () => {
    const categoryKey = topicName.toLowerCase().replace(' ', '-');
    const savedPages = localStorage.getItem(`notes-pages-${categoryKey}`);
    
    if (!savedPages) return 0;
    
    let totalNotes = 0;
    const pages = JSON.parse(savedPages);
    
    for (const page of pages) {
      const notesKey = `interactive-notes-${categoryKey}-${page.id}`;
      const savedNotes = localStorage.getItem(notesKey);
      if (savedNotes) {
        const noteBoxes = JSON.parse(savedNotes);
        totalNotes += noteBoxes.length;
      }
    }
    
    return totalNotes;
  };

  useEffect(() => {
    const actualCount = calculateNotesCount();
    setNotesCount(actualCount);
  }, [topicName]);

  useEffect(() => {
    const handleNotesUpdate = (event: CustomEvent) => {
      const { topicName: updatedTopic, action } = event.detail;
      if (updatedTopic === topicName && action === 'add') {
        const actualCount = calculateNotesCount();
        setNotesCount(actualCount);
      }
    };

    window.addEventListener('notesUpdated', handleNotesUpdate as EventListener);
    
    return () => {
      window.removeEventListener('notesUpdated', handleNotesUpdate as EventListener);
    };
  }, [topicName]);

  useEffect(() => {
    const actualCount = calculateNotesCount();
    setNotesCount(actualCount);
  }, [initialNotesCount]);

  const getSearchPlaceholder = () => {
    if (activeSubTab === 'notes') {
      return "Search notes pages...";
    }
    return `Search in ${topicName} Knowledge Bank...`;
  };

  const subTabs = [
    { id: 'notes', label: 'Notes', count: notesCount },
    { id: 'sources', label: `${topicName} Knowledge Bank`, count: sourcesCount }
  ];

  return (
    <div className="bg-white">
      {/* Container with search bar and headers */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          {/* Search Bar Section */}
          {showSearch && (
            <div className="mb-6">
              <div className="relative max-w-md mx-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder={getSearchPlaceholder()}
                  value={searchQuery}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white border-gray-200 rounded-full focus:bg-white focus-visible:ring-1 focus-visible:ring-gray-300"
                />
              </div>
            </div>
          )}

          {/* Sub Navigation Tabs */}
          <div className="flex items-center justify-center gap-1">
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
        </div>
      </div>
    </div>
  );
};
