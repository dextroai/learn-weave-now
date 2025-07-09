
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface NotePage {
  id: string;
  title: string;
  createdAt: string;
}

export const useNotePagesDatabase = (category: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch note pages from database
  const { data: pages = [], isLoading } = useQuery({
    queryKey: ['note-pages', category, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('note_pages')
        .select('*')
        .eq('user_id', user.id)
        .eq('category', category)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching note pages:', error);
        throw error;
      }

      // Transform database format to component format
      return (data || []).map(page => ({
        id: page.page_id,
        title: page.title,
        createdAt: page.created_at,
      }));
    },
    enabled: !!user?.id,
  });

  // Create note page mutation
  const createPageMutation = useMutation({
    mutationFn: async (page: { id: string; title: string }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('note_pages')
        .insert({
          user_id: user.id,
          category,
          page_id: page.id,
          title: page.title,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['note-pages', category, user?.id] });
    },
  });

  // Delete note page mutation
  const deletePageMutation = useMutation({
    mutationFn: async (pageId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Also delete all note boxes for this page
      await supabase
        .from('note_boxes')
        .delete()
        .eq('user_id', user.id)
        .eq('category', `${category}-${pageId}`);

      const { error } = await supabase
        .from('note_pages')
        .delete()
        .eq('user_id', user.id)
        .eq('category', category)
        .eq('page_id', pageId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['note-pages', category, user?.id] });
    },
  });

  const addPage = (page: { id: string; title: string }) => {
    createPageMutation.mutate(page);
  };

  const deletePage = (pageId: string) => {
    deletePageMutation.mutate(pageId);
  };

  return {
    pages,
    isLoading,
    addPage,
    deletePage,
    isUpdating: createPageMutation.isPending || deletePageMutation.isPending,
  };
};
