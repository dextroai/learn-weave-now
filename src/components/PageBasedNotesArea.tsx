
import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { InteractiveNotesArea } from './InteractiveNotesArea';
import { useNotePagesDatabase } from '@/hooks/useNotePagesDatabase';
import { useAuth } from '@/contexts/AuthContext';

interface PageBasedNotesAreaProps {
  category: string;
  searchQuery?: string;
}

export function PageBasedNotesArea({ category, searchQuery = "" }: PageBasedNotesAreaProps) {
  const { user } = useAuth();
  const { pages, addPage, deletePage, isLoading } = useNotePagesDatabase(category);
  const [activePage, setActivePage] = useState<string | null>(null);
  const [isAddingPage, setIsAddingPage] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');

  // Set active page when pages are loaded
  if (pages.length > 0 && !activePage && !isLoading) {
    setActivePage(pages[0].id);
  }

  // If user is not authenticated, show login message
  if (!user) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to access your notes.</p>
        </div>
      </div>
    );
  }

  const addNewPage = () => {
    if (newPageTitle.trim()) {
      const newPage = {
        id: Date.now().toString(),
        title: newPageTitle.trim(),
      };
      addPage(newPage);
      setActivePage(newPage.id);
      setNewPageTitle('');
      setIsAddingPage(false);
    }
  };

  const handleDeletePage = (pageId: string) => {
    deletePage(pageId);
    
    // If we deleted the active page, switch to another page or none
    if (activePage === pageId) {
      const remainingPages = pages.filter(page => page.id !== pageId);
      setActivePage(remainingPages.length > 0 ? remainingPages[0].id : null);
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

  // Filter pages based on search query
  const filteredPages = searchQuery
    ? pages.filter(page => 
        page.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : pages;

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading your pages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-1">
        {/* Left Sidebar - Made smaller and reaches to top */}
        <div className="w-60 bg-purple-50 border-r border-purple-200 flex flex-col">
          {/* Add Page Section */}
          <div className="px-4 py-4 bg-purple-100">
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
          
          {/* Pages Section */}
          <div className="flex-1 p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Pages</h2>
            
            {filteredPages.length > 0 ? (
              <div className="space-y-2">
                {filteredPages.map((page) => (
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
                        handleDeletePage(page.id);
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
                  <div className="text-base font-medium mb-1">
                    {searchQuery ? 'No matching pages' : 'No pages yet'}
                  </div>
                  <div className="text-xs">
                    {searchQuery ? `No pages match "${searchQuery}"` : 'Create your first page above'}
                  </div>
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
    </div>
  );
}
