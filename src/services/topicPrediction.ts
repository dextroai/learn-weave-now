
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Blog = Tables<'blogs'>;
type UserTopic = Tables<'user_topics'>;

export class TopicPredictionService {
  // Dummy prediction logic - in reality this would use ML/AI
  static predictTopicForBlog(blog: Blog, userTopics: UserTopic[]): string | null {
    if (userTopics.length === 0) return null;

    const blogText = `${blog.name} ${blog.url}`.toLowerCase();
    
    // Simple keyword-based prediction (dummy logic)
    const predictions = [
      { topic: 'nlp', keywords: ['nlp', 'language', 'text', 'natural', 'processing', 'bert', 'gpt', 'transformer'] },
      { topic: 'mlops', keywords: ['mlops', 'deployment', 'pipeline', 'kubernetes', 'docker', 'monitoring', 'production'] },
      { topic: 'traditional-ml', keywords: ['machine learning', 'regression', 'classification', 'scikit', 'pandas', 'numpy'] },
      { topic: 'computer-vision', keywords: ['vision', 'image', 'opencv', 'cnn', 'detection', 'segmentation', 'yolo'] }
    ];

    // Find matching user topics
    for (const prediction of predictions) {
      const hasKeyword = prediction.keywords.some(keyword => blogText.includes(keyword));
      if (hasKeyword) {
        const matchingTopic = userTopics.find(topic => 
          topic.name.toLowerCase().replace(/\s+/g, '-') === prediction.topic
        );
        if (matchingTopic) {
          return matchingTopic.id;
        }
      }
    }

    // If no specific match, return a random topic (dummy behavior)
    const randomIndex = Math.floor(Math.random() * userTopics.length);
    return userTopics[randomIndex].id;
  }

  static async predictAndAssignTopics() {
    try {
      console.log('Starting topic prediction for blogs...');

      // Get all blogs
      const { data: blogs, error: blogsError } = await supabase
        .from('blogs')
        .select('*');

      if (blogsError) {
        console.error('Error fetching blogs:', blogsError);
        return { success: false, error: blogsError.message };
      }

      // Get all user topics
      const { data: userTopics, error: topicsError } = await supabase
        .from('user_topics')
        .select('*');

      if (topicsError) {
        console.error('Error fetching user topics:', topicsError);
        return { success: false, error: topicsError.message };
      }

      if (!blogs || blogs.length === 0) {
        console.log('No blogs found');
        return { success: true, message: 'No blogs to process' };
      }

      if (!userTopics || userTopics.length === 0) {
        console.log('No user topics found');
        return { success: true, message: 'No user topics available for prediction' };
      }

      let predictionsCount = 0;

      // Process each blog
      for (const blog of blogs) {
        const predictedTopicId = this.predictTopicForBlog(blog, userTopics);
        
        if (predictedTopicId) {
          // Check if this blog already has posts with topic assignments
          const { data: existingPosts } = await supabase
            .from('blog_posts')
            .select(`
              id,
              post_topics (
                topic_id
              )
            `)
            .eq('blog_id', blog.id)
            .limit(1);

          // If blog has posts but no topic assignments, assign the predicted topic
          if (existingPosts && existingPosts.length > 0) {
            for (const post of existingPosts) {
              if (!post.post_topics || post.post_topics.length === 0) {
                // Assign predicted topic to this post
                const { error: assignError } = await supabase
                  .from('post_topics')
                  .insert({
                    post_id: post.id,
                    topic_id: predictedTopicId
                  });

                if (assignError) {
                  console.error(`Error assigning topic to post ${post.id}:`, assignError);
                } else {
                  predictionsCount++;
                }
              }
            }
          }

          console.log(`Predicted topic for blog "${blog.name}": ${predictedTopicId}`);
        }
      }

      return { 
        success: true, 
        message: `Successfully processed ${blogs.length} blogs and made ${predictionsCount} topic assignments` 
      };

    } catch (error) {
      console.error('Error in topic prediction:', error);
      return { success: false, error: error.message };
    }
  }
}
