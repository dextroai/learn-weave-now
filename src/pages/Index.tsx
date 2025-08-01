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

  console.log('useNotePagesDatabase called with:', { category, userId: user?.id });

  // Fetch note pages from database
  const { data: pages = [], isLoading, error } = useQuery({
    queryKey: ['note-pages', category, user?.id],
    queryFn: async () => {
      if (!user?.id || !category) {
        console.log('Skipping query - no user or category:', { userId: user?.id, category });
        return [];
      }

      console.log('Fetching note pages for:', { userId: user.id, category });

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

      console.log('Fetched note pages data:', data);

      // Transform database format to component format
      const transformedPages = (data || []).map(page => ({
        id: page.page_id,
        title: page.title,
        createdAt: page.created_at,
      }));

      console.log('Transformed pages:', transformedPages);
      return transformedPages;
    },
    enabled: !!user?.id && !!category,
  });

  // Create note page mutation
  const createPageMutation = useMutation({
    mutationFn: async (page: { id: string; title: string }) => {
      if (!user?.id) throw new Error('User not authenticated');

      console.log('Creating page:', { userId: user.id, category, page });

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

      if (error) {
        console.error('Error creating page:', error);
        throw error;
      }
      
      console.log('Created page successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Page creation successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['note-pages', category, user?.id] });
    },
    onError: (error) => {
      console.error('Page creation failed:', error);
    },
  });

  // Delete note page mutation
  const deletePageMutation = useMutation({
    mutationFn: async (pageId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      console.log('Deleting page:', { userId: user.id, category, pageId });

      // Also delete all note boxes for this page (if you have note_boxes table)
      const pageCategory = `${category}-${pageId}`;
      try {
        await supabase
          .from('note_boxes')
          .delete()
          .eq('user_id', user.id)
          .eq('category', pageCategory);
      } catch (error) {
        console.log('No note_boxes to delete or table doesn\'t exist:', error);
      }

      const { error } = await supabase
        .from('note_pages')
        .delete()
        .eq('user_id', user.id)
        .eq('category', category)
        .eq('page_id', pageId);

      if (error) {
        console.error('Error deleting page:', error);
        throw error;
      }
      
      console.log('Deleted page successfully');
    },
    onSuccess: () => {
      console.log('Page deletion successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['note-pages', category, user?.id] });
    },
    onError: (error) => {
      console.error('Page deletion failed:', error);
    },
  });

  const addPage = (page: { id: string; title: string }) => {
    console.log('addPage called with:', page);
    createPageMutation.mutate(page);
  };

  const deletePage = (pageId: string) => {
    console.log('deletePage called with:', pageId);
    deletePageMutation.mutate(pageId);
  };

  // Log the current state
  console.log('Hook state:', {
    category,
    pagesCount: pages.length,
    isLoading,
    error: error?.message,
    isCreating: createPageMutation.isPending,
    isDeleting: deletePageMutation.isPending,
  });

  return {
    pages,
    isLoading,
    addPage,
    deletePage,
    isUpdating: createPageMutation.isPending || deletePageMutation.isPending,
    error,
  };
};