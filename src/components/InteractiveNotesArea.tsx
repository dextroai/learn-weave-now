
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
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="px-6 py-2 pb-1 border-b border-gray-200">
        {pageTitle && (
          <h1 className="text-xl font-semibold text-gray-900 mb-1">{pageTitle}</h1>
        )}
        <p className="text-gray-600 text-sm">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
          <Plus className="w-4 h-4" />
          <span>Click anywhere to create a new note</span>
        </div>
      </div>
      
      <div 
        ref={containerRef}
        className="relative w-full min-h-screen p-6 cursor-crosshair"
        onClick={createNewNoteBox}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ minHeight: 'calc(100vh - 120px)' }}
      >
        {noteBoxes.map((box) => (
          <div
            key={box.id}
            className="absolute bg-yellow-50 border border-yellow-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            style={{
              left: box.x,
              top: box.y,
              width: box.width,
              minHeight: box.height,
            }}
            onMouseDown={(e) => handleMouseDown(e, box.id)}
          >
            <div className="flex items-center justify-between p-2 border-b border-yellow-200 bg-yellow-100 rounded-t-lg">
              <div className="drag-handle flex items-center gap-1 cursor-move flex-1">
                <Move className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-600">Drag to move</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNoteBox(box.id);
                }}
                className="text-gray-500 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              value={box.content}
              onChange={(e) => updateNoteContent(box.id, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              placeholder="Type your notes here..."
              className="w-full min-h-[60px] p-3 bg-transparent border-none resize-none focus:outline-none text-sm leading-relaxed"
              style={{ 
                fontSize: '14px', 
                lineHeight: '1.5',
                minHeight: `${box.height - 40}px`
              }}
            />
          </div>
        ))}
        
        {noteBoxes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-gray-400">
              <Plus className="w-12 h-12 mx-auto mb-2" />
              <p className="text-lg">Click anywhere to create your first note</p>
              <p className="text-sm">Create multiple notes and drag them around</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
