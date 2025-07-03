
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TopicPredictionService } from '@/services/topicPrediction';
import { toast } from 'sonner';

export const useTopicPrediction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      return await TopicPredictionService.predictAndAssignTopics();
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message || 'Topic prediction completed successfully!');
        // Invalidate relevant queries to refresh the UI
        queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
        queryClient.invalidateQueries({ queryKey: ['userTopics'] });
      } else {
        toast.error(result.error || 'Failed to predict topics');
      }
    },
    onError: (error) => {
      console.error('Topic prediction error:', error);
      toast.error('Failed to predict topics');
    },
  });
};
