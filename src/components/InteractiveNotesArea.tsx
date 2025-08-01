
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
  const [isDragging, setIsDragging] = useState(false);
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
    // Don't create new notes if we're dragging
    if (isDragging || e.target !== e.currentTarget || !containerRef.current) {
      return;
    }
    
    const rect = containerRef.current.getBoundingClientRect();
    const newBox: NoteBox = {
      id: Date.now().toString(),
      content: '',
      x: Math.max(20, e.clientX - rect.left - 20),
      y: Math.max(20, e.clientY - rect.top - 20),
      width: 600,
      height: 120,
    };
    addNoteBox(newBox);
    // Auto-focus the new note
    setTimeout(() => {
      const textarea = document.querySelector(`[data-note-id="${newBox.id}"] textarea`) as HTMLTextAreaElement;
      if (textarea) {
        textarea.focus();
      }
    }, 100);
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
      setIsDragging(true);
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
    if (draggedBox && isDragging && containerRef.current) {
      e.preventDefault();
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
    // Add a small delay before allowing new notes to be created
    setTimeout(() => {
      setIsDragging(false);
    }, 100);
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
      
      {/* Blank lined writing area like OneNote */}
      <div 
        ref={containerRef}
        className="relative w-full min-h-screen bg-white cursor-text"
        onClick={createNewNoteBox}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ 
          minHeight: 'calc(100vh - 140px)',
          backgroundImage: 'repeating-linear-gradient(transparent, transparent 29px, #e5e7eb 29px, #e5e7eb 30px)',
          backgroundSize: '100% 30px'
        }}
      >
        {noteBoxes.map((box) => (
          <div
            key={box.id}
            data-note-id={box.id}
            className={`absolute bg-white border rounded-sm shadow-sm transition-all duration-200 ${
              selectedBox === box.id ? 'border-gray-400' : 'border-gray-200'
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
            {/* Simple header bar like OneNote */}
            <div className={`flex items-center justify-end p-1 bg-gray-50 border-b ${
              selectedBox === box.id ? 'border-gray-300' : 'border-gray-200'
            } opacity-0 hover:opacity-100 transition-opacity`}>
              <div className="drag-handle flex items-center gap-2 cursor-move flex-1">
                <span className="text-xs text-gray-400 ml-2">···</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNoteBox(box.id);
                }}
                className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            
            {/* Simple textarea like pic2 */}
            <textarea
              value={box.content}
              onChange={(e) => updateNoteContent(box.id, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onFocus={() => setSelectedBox(box.id)}
              placeholder=""
              className="w-full min-h-[100px] p-3 bg-white border-none resize-none focus:outline-none text-gray-900 leading-relaxed"
              style={{ 
                fontSize: '16px', 
                lineHeight: '1.5',
                minHeight: `${box.height - 20}px`,
                fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif'
              }}
            />
          </div>
        ))}
        
      </div>
    </div>
  );
}
