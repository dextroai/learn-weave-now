
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useNotesDatabase = (category: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch notes from database
  const { data: notes, isLoading } = useQuery({
    queryKey: ['notes', category, user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .eq('category', category)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
        console.error('Error fetching notes:', error);
        throw error;
      }

      return data;
    },
    enabled: !!user?.id,
  });

  // Update notes mutation
  const updateNotesMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('notes')
        .upsert({
          user_id: user.id,
          category,
          content,
        }, {
          onConflict: 'user_id,category'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', category, user?.id] });
    },
  });

  const updateNotes = (content: string) => {
    updateNotesMutation.mutate(content);
  };

  return {
    notes: notes?.content || '',
    isLoading,
    updateNotes,
    isUpdating: updateNotesMutation.isPending,
  };
};
