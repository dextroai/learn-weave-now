
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert } from '@/integrations/supabase/types';

type UserTopic = Tables<'user_topics'>;
type UserTopicInsert = TablesInsert<'user_topics'>;

export const useUserTopics = () => {
  return useQuery({
    queryKey: ['userTopics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_topics')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useAddUserTopic = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (topic: Omit<UserTopicInsert, 'id' | 'user_id' | 'created_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_topics')
        .insert([{
          ...topic,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userTopics'] });
    },
  });
};

export const useToggleTopicActive = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from('user_topics')
        .update({ is_active })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userTopics'] });
    },
  });
};
