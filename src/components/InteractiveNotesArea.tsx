
import { useState, useEffect, useRef } from 'react';
import { Plus, X, Move } from 'lucide-react';

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
}

export function InteractiveNotesArea({ category }: InteractiveNotesAreaProps) {
  const [noteBoxes, setNoteBoxes] = useState<NoteBox[]>([]);
  const [draggedBox, setDraggedBox] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Load saved notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem(`interactive-notes-${category}`);
    if (savedNotes) {
      setNoteBoxes(JSON.parse(savedNotes));
    }
  }, [category]);

  // Save notes to localStorage
  const saveNotes = (boxes: NoteBox[]) => {
    localStorage.setItem(`interactive-notes-${category}`, JSON.stringify(boxes));
  };

  const createNewNoteBox = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only create note if clicking directly on the container (not on child elements)
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
      const updatedBoxes = [...noteBoxes, newBox];
      setNoteBoxes(updatedBoxes);
      saveNotes(updatedBoxes);
    }
  };

  const updateNoteContent = (id: string, content: string) => {
    const updatedBoxes = noteBoxes.map(box =>
      box.id === id ? { ...box, content } : box
    );
    setNoteBoxes(updatedBoxes);
    saveNotes(updatedBoxes);
  };

  const deleteNoteBox = (id: string) => {
    const updatedBoxes = noteBoxes.filter(box => box.id !== id);
    setNoteBoxes(updatedBoxes);
    saveNotes(updatedBoxes);
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
      const updatedBoxes = noteBoxes.map(box =>
        box.id === draggedBox
          ? {
              ...box,
              x: Math.max(0, e.clientX - rect.left - dragOffset.x),
              y: Math.max(0, e.clientY - rect.top - dragOffset.y),
            }
          : box
      );
      setNoteBoxes(updatedBoxes);
    }
  };

  const handleMouseUp = () => {
    if (draggedBox) {
      saveNotes(noteBoxes);
      setDraggedBox(null);
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'nlp':
        return 'NLP';
      case 'mlops':
        return 'MLOps';
      case 'traditional-ml':
        return 'Traditional ML';
      case 'computer-vision':
        return 'Computer Vision';
      default:
        return category.charAt(0).toUpperCase() + category.slice(1);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="px-6 py-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">{getCategoryTitle(category)}</h1>
        <p className="text-gray-600 text-sm mt-1">
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
