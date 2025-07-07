
import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { InteractiveNotesArea } from './InteractiveNotesArea';

interface NotePage {
  id: string;
  title: string;
  createdAt: string;
}

interface PageBasedNotesAreaProps {
  category: string;
}

export function PageBasedNotesArea({ category }: PageBasedNotesAreaProps) {
  const [pages, setPages] = useState<NotePage[]>([]);
  const [activePage, setActivePage] = useState<string | null>(null);
  const [isAddingPage, setIsAddingPage] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');

  // Load saved pages from localStorage
  useEffect(() => {
    const savedPages = localStorage.getItem(`notes-pages-${category}`);
    if (savedPages) {
      const parsedPages = JSON.parse(savedPages);
      setPages(parsedPages);
      if (parsedPages.length > 0 && !activePage) {
        setActivePage(parsedPages[0].id);
      }
    }
  }, [category]);

  const savePages = (newPages: NotePage[]) => {
    localStorage.setItem(`notes-pages-${category}`, JSON.stringify(newPages));
  };

  const addNewPage = () => {
    if (newPageTitle.trim()) {
      const newPage: NotePage = {
        id: Date.now().toString(),
        title: newPageTitle.trim(),
        createdAt: new Date().toISOString(),
      };
      const updatedPages = [...pages, newPage];
      setPages(updatedPages);
      savePages(updatedPages);
      setActivePage(newPage.id);
      setNewPageTitle('');
      setIsAddingPage(false);
    }
  };

  const deletePage = (pageId: string) => {
    const updatedPages = pages.filter(page => page.id !== pageId);
    setPages(updatedPages);
    savePages(updatedPages);
    
    // Clear the page's notes from localStorage
    localStorage.removeItem(`interactive-notes-${category}-${pageId}`);
    
    // If we deleted the active page, switch to another page or none
    if (activePage === pageId) {
      setActivePage(updatedPages.length > 0 ? updatedPages[0].id : null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addNewPage();
    } else if (e.key === 'Escape') {
      setIsAddingPage(false);
      setNewPageTitle('');
    }
  };

  return (
    <div className="flex h-full">
      {/* Sidebar with pages */}
      <div className="w-64 bg-purple-50 border-r border-purple-200 flex flex-col">
        <div className="p-4 border-b border-purple-200">
          <button
            onClick={() => setIsAddingPage(true)}
            className="flex items-center gap-2 w-full p-2 text-sm text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Page
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {isAddingPage && (
            <div className="p-3 border-b border-purple-200">
              <input
                type="text"
                value={newPageTitle}
                onChange={(e) => setNewPageTitle(e.target.value)}
                onKeyDown={handleKeyPress}
                onBlur={() => {
                  if (newPageTitle.trim()) {
                    addNewPage();
                  } else {
                    setIsAddingPage(false);
                  }
                }}
                placeholder="Page title..."
                className="w-full p-2 text-sm border border-purple-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                autoFocus
              />
            </div>
          )}
          
          {pages.map((page) => (
            <div
              key={page.id}
              className={`flex items-center justify-between p-3 border-b border-purple-100 cursor-pointer hover:bg-purple-100 transition-colors ${
                activePage === page.id ? 'bg-purple-100 border-l-4 border-l-purple-500' : ''
              }`}
              onClick={() => setActivePage(page.id)}
            >
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {page.title}
                </h3>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deletePage(page.id);
                }}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1">
        {activePage ? (
          <InteractiveNotesArea 
            category={`${category}-${activePage}`}
            pageTitle={pages.find(p => p.id === activePage)?.title}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="text-center text-gray-500">
              <Plus className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg mb-2">No pages yet</p>
              <p className="text-sm">Create your first page to start taking notes</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
