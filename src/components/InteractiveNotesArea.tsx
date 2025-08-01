
import { useState, useRef } from 'react';
import { Plus, X, Move } from 'lucide-react';
import { useNoteBoxesDatabase } from '@/hooks/useNoteBoxesDatabase';
import { useAuth } from '@/contexts/AuthContext';

interface NoteBox {
  id: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface InteractiveNotesAreaProps {
  category: string;
  pageTitle?: string;
}

export function InteractiveNotesArea({ category, pageTitle }: InteractiveNotesAreaProps) {
  const { user } = useAuth();
  const { noteBoxes, addNoteBox, updateNoteBox, deleteNoteBox, isLoading } = useNoteBoxesDatabase(category);
  const [draggedBox, setDraggedBox] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedBox, setSelectedBox] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const getCurrentDateTime = () => {
    const now = new Date();
    const date = now.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const time = now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    return { date, time };
  };

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

  const createNewNoteBox = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const newBox: NoteBox = {
        id: Date.now().toString(),
        content: '',
        x: Math.max(0, e.clientX - rect.left - 150),
        y: Math.max(0, e.clientY - rect.top - 50),
        width: 300,
        height: 100,
      };
      addNoteBox(newBox);
    }
  };

  const updateNoteContent = (id: string, content: string) => {
    const existingBox = noteBoxes.find(box => box.id === id);
    if (existingBox) {
      updateNoteBox({ ...existingBox, content });
    }
  };

  const handleMouseDown = (e: React.MouseEvent, boxId: string) => {
    if ((e.target as HTMLElement).closest('.drag-handle')) {
      e.preventDefault();
      e.stopPropagation();
      setDraggedBox(boxId);
      const box = noteBoxes.find(b => b.id === boxId);
      if (box && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDragOffset({
          x: e.clientX - rect.left - box.x,
          y: e.clientY - rect.top - box.y,
        });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedBox && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const box = noteBoxes.find(b => b.id === draggedBox);
      if (box) {
        const newX = Math.max(0, e.clientX - rect.left - dragOffset.x);
        const newY = Math.max(0, e.clientY - rect.top - dragOffset.y);
        updateNoteBox({ ...box, x: newX, y: newY });
      }
    }
  };

  const handleMouseUp = () => {
    setDraggedBox(null);
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading your notes...</p>
        </div>
      </div>
    );
  }

  const { date, time } = getCurrentDateTime();

  return (
    <div className="w-full min-h-screen bg-white">
      {/* OneNote-style Header */}
      <div className="px-8 py-6 border-b border-gray-200 bg-white">
        <div className="max-w-4xl">
          <h1 className="text-3xl font-normal text-gray-900 mb-3 border-b border-gray-300 pb-2">
            {pageTitle || category.charAt(0).toUpperCase() + category.slice(1)}
          </h1>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{date}</span>
            <span>{time}</span>
          </div>
        </div>
      </div>
      
      {/* OneNote-style Writing Area */}
      <div 
        ref={containerRef}
        className="relative w-full min-h-screen bg-white p-8"
        onClick={createNewNoteBox}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ 
          minHeight: 'calc(100vh - 140px)',
          background: 'linear-gradient(to bottom, #ffffff 0%, #fafafa 100%)',
          backgroundSize: '100% 30px',
          backgroundImage: 'repeating-linear-gradient(transparent, transparent 29px, #e5e7eb 29px, #e5e7eb 30px)'
        }}
      >
        {noteBoxes.map((box) => (
          <div
            key={box.id}
            className={`absolute bg-white border-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 ${
              selectedBox === box.id ? 'border-blue-500 shadow-blue-200' : 'border-gray-200'
            }`}
            style={{
              left: box.x,
              top: box.y,
              width: box.width,
              minHeight: box.height,
            }}
            onMouseDown={(e) => handleMouseDown(e, box.id)}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedBox(box.id);
            }}
          >
            {/* OneNote-style note header */}
            <div className={`flex items-center justify-between p-2 bg-gray-50 rounded-t-lg border-b ${
              selectedBox === box.id ? 'border-blue-200' : 'border-gray-200'
            }`}>
              <div className="drag-handle flex items-center gap-2 cursor-move flex-1 opacity-60 hover:opacity-100 transition-opacity">
                <Move className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-500 font-medium">Note</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNoteBox(box.id);
                }}
                className="opacity-60 hover:opacity-100 text-gray-500 hover:text-red-500 transition-all p-1 rounded hover:bg-red-50"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            
            {/* OneNote-style textarea */}
            <textarea
              value={box.content}
              onChange={(e) => updateNoteContent(box.id, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onFocus={() => setSelectedBox(box.id)}
              placeholder="Start typing..."
              className="w-full min-h-[80px] p-4 bg-white border-none resize-none focus:outline-none text-gray-800 leading-relaxed"
              style={{ 
                fontSize: '15px', 
                lineHeight: '1.6',
                minHeight: `${box.height - 40}px`,
                fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif'
              }}
            />
          </div>
        ))}
        
        {/* Welcome message when no notes exist */}
        {noteBoxes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-gray-400 bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center">
                <Plus className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">Start writing your notes</h3>
              <p className="text-sm text-gray-500 mb-1">Click anywhere on the page to create a note</p>
              <p className="text-xs text-gray-400">Drag notes around to organize your thoughts</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
