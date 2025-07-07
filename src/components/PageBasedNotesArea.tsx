
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
    <div className="flex h-screen">
      {/* Left Sidebar - Made smaller */}
      <div className="w-60 bg-purple-50 border-r border-purple-200 flex flex-col">
        {/* Add Page Section - Reduced padding and size */}
        <div className="p-4 bg-purple-100">
          <h2 className="text-lg font-semibold text-purple-900 mb-3">Add Page</h2>
          {!isAddingPage ? (
            <button
              onClick={() => setIsAddingPage(true)}
              className="w-full flex items-center justify-center gap-2 p-3 bg-purple-600 text-white hover:bg-purple-700 rounded-lg transition-colors font-medium text-sm"
            >
              <Plus className="w-4 h-4" />
              New Page
            </button>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                value={newPageTitle}
                onChange={(e) => setNewPageTitle(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Enter page title..."
                className="w-full p-2 border border-purple-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent text-sm"
                autoFocus
              />
              <div className="flex gap-1">
                <button
                  onClick={addNewPage}
                  disabled={!newPageTitle.trim()}
                  className="flex-1 px-3 py-1.5 bg-purple-600 text-white hover:bg-purple-700 disabled:bg-purple-300 rounded-md transition-colors font-medium text-sm"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setIsAddingPage(false);
                    setNewPageTitle('');
                  }}
                  className="flex-1 px-3 py-1.5 bg-gray-300 text-gray-700 hover:bg-gray-400 rounded-md transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Pages Section - Reduced padding */}
        <div className="flex-1 p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Pages</h2>
          
          {pages.length > 0 ? (
            <div className="space-y-2">
              {pages.map((page) => (
                <div
                  key={page.id}
                  className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors ${
                    activePage === page.id 
                      ? 'bg-white border-2 border-purple-300 shadow-sm' 
                      : 'bg-white/60 border border-purple-100 hover:bg-white hover:border-purple-200'
                  }`}
                  onClick={() => setActivePage(page.id)}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate text-sm">
                      {page.title}
                    </h3>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePage(page.id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-gray-500">
                <div className="text-base font-medium mb-1">No pages yet</div>
                <div className="text-xs">Create your first page above</div>
              </div>
            </div>
          )}
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
