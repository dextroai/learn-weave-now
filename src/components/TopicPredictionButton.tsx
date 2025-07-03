
import { Button } from '@/components/ui/button';
import { Brain, Loader2 } from 'lucide-react';
import { useTopicPrediction } from '@/hooks/useTopicPrediction';

export function TopicPredictionButton() {
  const topicPrediction = useTopicPrediction();

  const handlePredict = () => {
    topicPrediction.mutate();
  };

  return (
    <Button
      onClick={handlePredict}
      disabled={topicPrediction.isPending}
      className="flex items-center gap-2"
    >
      {topicPrediction.isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Brain className="h-4 w-4" />
      )}
      {topicPrediction.isPending ? 'Predicting...' : 'Predict Topics'}
    </Button>
  );
}
