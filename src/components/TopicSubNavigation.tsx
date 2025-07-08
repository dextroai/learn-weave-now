
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface TopicSubNavigationProps {
  activeSubTab: string;
  onSubTabChange: (subTab: string) => void;
  notesCount: number;
  sourcesCount: number;
  topicName?: string;
}

export const TopicSubNavigation = ({ 
  activeSubTab, 
  onSubTabChange, 
  notesCount: initialNotesCount, 
  sourcesCount,
  topicName = "General"
}: TopicSubNavigationProps) => {
  const [notesCount, setNotesCount] = useState(initialNotesCount);

  // Calculate actual notes count from localStorage
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
    // Calculate and set the actual notes count on mount
    const actualCount = calculateNotesCount();
    setNotesCount(actualCount);
  }, [topicName]);

  useEffect(() => {
    // Listen for notes updates
    const handleNotesUpdate = (event: CustomEvent) => {
      const { topicName: updatedTopic, action } = event.detail;
      if (updatedTopic === topicName && action === 'add') {
        // Recalculate the actual count instead of just incrementing
        const actualCount = calculateNotesCount();
        setNotesCount(actualCount);
      }
    };

    window.addEventListener('notesUpdated', handleNotesUpdate as EventListener);
    
    return () => {
      window.removeEventListener('notesUpdated', handleNotesUpdate as EventListener);
    };
  }, [topicName]);

  // Update notes count when initialNotesCount changes
  useEffect(() => {
    const actualCount = calculateNotesCount();
    setNotesCount(actualCount);
  }, [initialNotesCount]);

  const getKnowledgeBankLabel = (topicName: string) => {
    return `${topicName} Knowledge Bank`;
  };

  const subTabs = [
    { id: 'notes', label: 'Notes', count: notesCount },
    { id: 'sources', label: getKnowledgeBankLabel(topicName), count: sourcesCount }
  ];

  return (
    <div className="flex items-center justify-center gap-1 mb-4 border-b border-gray-200">
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
