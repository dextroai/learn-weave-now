
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface NoteBox {
  id: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export const useNoteBoxesDatabase = (category: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch note boxes from database
  const { data: noteBoxes = [], isLoading } = useQuery({
    queryKey: ['note-boxes', category, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('note_boxes')
        .select('*')
        .eq('user_id', user.id)
        .eq('category', category)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching note boxes:', error);
        throw error;
      }

      // Transform database format to component format
      return (data || []).map(box => ({
        id: box.box_id,
        content: box.content || '',
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
      }));
    },
    enabled: !!user?.id,
  });

  // Create note box mutation
  const createNoteBoxMutation = useMutation({
    mutationFn: async (noteBox: NoteBox) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('note_boxes')
        .insert({
          user_id: user.id,
          category,
          box_id: noteBox.id,
          content: noteBox.content,
          x: noteBox.x,
          y: noteBox.y,
          width: noteBox.width,
          height: noteBox.height,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['note-boxes', category, user?.id] });
    },
  });

  // Update note box mutation
  const updateNoteBoxMutation = useMutation({
    mutationFn: async (noteBox: NoteBox) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('note_boxes')
        .update({
          content: noteBox.content,
          x: noteBox.x,
          y: noteBox.y,
          width: noteBox.width,
          height: noteBox.height,
        })
        .eq('user_id', user.id)
        .eq('category', category)
        .eq('box_id', noteBox.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['note-boxes', category, user?.id] });
    },
  });

  // Delete note box mutation
  const deleteNoteBoxMutation = useMutation({
    mutationFn: async (boxId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('note_boxes')
        .delete()
        .eq('user_id', user.id)
        .eq('category', category)
        .eq('box_id', boxId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['note-boxes', category, user?.id] });
    },
  });

  const addNoteBox = (noteBox: NoteBox) => {
    createNoteBoxMutation.mutate(noteBox);
  };

  const updateNoteBox = (noteBox: NoteBox) => {
    updateNoteBoxMutation.mutate(noteBox);
  };

  const deleteNoteBox = (boxId: string) => {
    deleteNoteBoxMutation.mutate(boxId);
  };

  return {
    noteBoxes,
    isLoading,
    addNoteBox,
    updateNoteBox,
    deleteNoteBox,
    isUpdating: updateNoteBoxMutation.isPending || createNoteBoxMutation.isPending || deleteNoteBoxMutation.isPending,
  };
};
