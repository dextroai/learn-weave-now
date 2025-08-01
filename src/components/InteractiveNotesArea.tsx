import { useState, useRef, useEffect } from 'react';
import { useNotesDatabase } from '@/hooks/useNotesDatabase';
import { useAuth } from '@/contexts/AuthContext';

interface InteractiveNotesAreaProps {
  category: string;
  pageTitle?: string;
}

export function InteractiveNotesArea({ category, pageTitle }: InteractiveNotesAreaProps) {
  const { user } = useAuth();
  const { notes, updateNotes, isLoading } = useNotesDatabase(category);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // Focus textarea when component mounts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // If user is not authenticated, show login message
  if (!user) {
    return (
      <div className="w-full min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Authentication Required</h2>
          <p className="text-gray-300">Please sign in to access your notes.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
          <p className="text-gray-300">Loading your notes...</p>
        </div>
      </div>
    );
  }

  const { date, time } = getCurrentDateTime();

  return (
    <div className="w-full min-h-screen bg-slate-900">
      {/* OneNote-style Header */}
      <div className="px-8 py-6 bg-slate-900">
        <div className="max-w-4xl">
          <h1 className="text-3xl font-normal text-white mb-3 pb-2 border-b border-slate-600">
            {pageTitle || category.charAt(0).toUpperCase() + category.slice(1)}
          </h1>
          <div className="flex items-center justify-between text-sm text-gray-300">
            <span>{date}</span>
            <span>{time}</span>
          </div>
        </div>
      </div>

      {/* Simple notepad-like writing area - no background lines */}
      <div 
        className="w-full bg-slate-900"
        onClick={() => textareaRef.current?.focus()}
        style={{ minHeight: 'calc(100vh - 140px)' }}
      >
        <textarea
          ref={textareaRef}
          value={notes}
          onChange={(e) => updateNotes(e.target.value)}
          placeholder="Start typing..."
          className="w-full h-full p-8 bg-slate-900 border-none resize-none focus:outline-none text-white leading-relaxed placeholder-gray-400"
          style={{ 
            fontSize: '16px', 
            lineHeight: '1.6',
            minHeight: 'calc(100vh - 140px)',
            fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif'
          }}
        />
      </div>
    </div>
  );
}