
import { useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { useNotesDatabase } from '@/hooks/useNotesDatabase';
import { useAuth } from '@/contexts/AuthContext';

interface NotesEditorProps {
  category: string;
}

export function NotesEditor({ category }: NotesEditorProps) {
  const { user } = useAuth();
  const { notes, updateNotes, isLoading } = useNotesDatabase(category);

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
      </div>
      
      <div className="w-full">
        <Textarea
          value={notes}
          onChange={(e) => updateNotes(e.target.value)}
          placeholder={isLoading ? "Loading your notes..." : "Start writing your notes here..."}
          disabled={isLoading}
          className="w-full min-h-screen border-none resize-none focus:ring-0 focus:outline-none text-base leading-relaxed bg-white rounded-none p-6"
          style={{ fontSize: '16px', lineHeight: '1.6' }}
        />
      </div>
    </div>
  );
}
