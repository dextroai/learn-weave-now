
import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';

interface NotesEditorProps {
  category: string;
}

export function NotesEditor({ category }: NotesEditorProps) {
  const [notes, setNotes] = useState('');

  // Load saved notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem(`notes-${category}`);
    if (savedNotes) {
      setNotes(savedNotes);
    }
  }, [category]);

  // Save notes to localStorage
  const handleNotesChange = (value: string) => {
    setNotes(value);
    localStorage.setItem(`notes-${category}`, value);
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
        return category;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-gray-200 p-4">
        <h1 className="text-2xl font-bold text-gray-900">{getCategoryTitle(category)}</h1>
        <p className="text-gray-600 text-sm mt-1">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>
      
      <div className="flex-1 p-4">
        <Textarea
          value={notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder="Start writing your notes here..."
          className="h-full min-h-[400px] border-none resize-none focus:ring-0 focus:outline-none text-base leading-relaxed"
          style={{ fontSize: '16px', lineHeight: '1.6' }}
        />
      </div>
    </div>
  );
}
