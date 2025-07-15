
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Blog = Tables<'blogs'>;
type UserTopic = Tables<'user_topics'>;

export class TopicPredictionService {
  // Dummy prediction logic - in reality this would use ML/AI
  static predictTopicLabelForBlog(blog: Blog, userTopics: UserTopic[]): number | null {
    if (userTopics.length === 0) return null;

    const blogText = `${blog.url}`.toLowerCase();
    
    // Simple keyword-based prediction (dummy logic)
    const predictions = [
      { keywords: ['nlp', 'language', 'text', 'natural', 'processing', 'bert', 'gpt', 'transformer'] },
      { keywords: ['mlops', 'deployment', 'pipeline', 'kubernetes', 'docker', 'monitoring', 'production'] },
      { keywords: ['machine learning', 'regression', 'classification', 'scikit', 'pandas', 'numpy'] },
      { keywords: ['vision', 'image', 'opencv', 'cnn', 'detection', 'segmentation', 'yolo'] }
    ];

    // Check for keyword matches and return corresponding topic_id from userTopics
    for (let i = 0; i < predictions.length && i < userTopics.length; i++) {
      const hasKeyword = predictions[i].keywords.some(keyword => blogText.includes(keyword));
      if (hasKeyword) {
        return userTopics[i].topic_id; // Return the actual topic_id from user_topics
      }
    }

    // If no specific match, return a random topic_id from available topics
    const randomIndex = Math.floor(Math.random() * userTopics.length);
    return userTopics[randomIndex].topic_id;
  }

  static async predictAndAssignTopics() {
    try {
      console.log('Starting topic prediction for blog posts...');

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Get user topics ordered by topic_id for consistent labeling
      const { data: userTopics, error: topicsError } = await supabase
        .from('user_topics')
        .select('*')
        .eq('user_id', user.id)
        .order('topic_id', { ascending: true });

      if (topicsError) {
        console.error('Error fetching user topics:', topicsError);
        return { success: false, error: topicsError.message };
      }

      if (!userTopics || userTopics.length === 0) {
        console.log('No user topics found');
        return { success: true, message: 'No user topics available for prediction' };
      }

      // Get all user's blogs
      const { data: blogs, error: blogsError } = await supabase
        .from('blogs')
        .select('*')
        .eq('user_id', user.id);

      if (blogsError) {
        console.error('Error fetching blogs:', blogsError);
        return { success: false, error: blogsError.message };
      }

      if (!blogs || blogs.length === 0) {
        console.log('No blogs found');
        return { success: true, message: 'No blogs to process' };
      }

      let predictionsCount = 0;

      // Process each blog's posts
      for (const blog of blogs) {
        const predictedTopicId = this.predictTopicLabelForBlog(blog, userTopics);
        
        if (predictedTopicId) {
          // Get posts from this blog that don't have a label_id yet
          const { data: posts, error: postsError } = await supabase
            .from('blog_posts')
            .select('id')
            .eq('blog_id', blog.id)
            .is('label_id', null);

          if (postsError) {
            console.error(`Error fetching posts for blog ${blog.id}:`, postsError);
            continue;
          }

          if (posts && posts.length > 0) {
            // Update posts with the predicted topic_id as label_id
            const { error: updateError } = await supabase
              .from('blog_posts')
              .update({ label_id: predictedTopicId })
              .eq('blog_id', blog.id)
              .is('label_id', null);

            if (updateError) {
              console.error(`Error updating posts for blog ${blog.id}:`, updateError);
            } else {
              predictionsCount += posts.length;
              const topicName = userTopics.find(t => t.topic_id === predictedTopicId)?.name || 'Unknown';
              const blogName = (() => {
                try {
                  const url = new URL(blog.url);
                  return url.hostname.replace('www.', '');
                } catch {
                  return blog.url;
                }
              })();
              console.log(`Assigned label ${predictedTopicId} (${topicName}) to ${posts.length} posts from blog "${blogName}"`);
            }
          }
        }
      }

      return { 
        success: true, 
        message: `Successfully processed ${blogs.length} blogs and assigned labels to ${predictionsCount} posts` 
      };

    } catch (error) {
      console.error('Error in topic prediction:', error);
      return { success: false, error: error.message };
    }
  }
}
