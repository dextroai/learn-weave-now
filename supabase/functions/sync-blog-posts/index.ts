
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BlogPost {
  title: string;
  link?: string;
  published?: string;
  summary?: string;
  content?: string;
}

interface BlogChangeRecord {
  blog_name: string;
  blog_url: string;
  new_posts: BlogPost[];
  timestamp: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (req.method === 'POST') {
      const changeRecord: BlogChangeRecord = await req.json();
      
      console.log(`Processing ${changeRecord.new_posts.length} new posts for ${changeRecord.blog_name}`);

      // Find or create the blog entry
      let { data: blog, error: blogError } = await supabase
        .from('blogs')
        .select('*')
        .eq('url', changeRecord.blog_url)
        .single();

      if (blogError && blogError.code === 'PGRST116') {
        // Blog doesn't exist, we'll need a user_id to create it
        // For now, skip creating blog if it doesn't exist
        console.log(`Blog ${changeRecord.blog_name} not found in database, skipping...`);
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'Blog not found in database. Please add it through the UI first.' 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        );
      }

      if (blogError) {
        throw blogError;
      }

      // Insert new blog posts
      const blogPosts = changeRecord.new_posts.map(post => ({
        blog_id: blog.id,
        title: post.title,
        link: post.link || null,
        published_date: post.published ? new Date(post.published).toISOString() : null,
        summary: post.summary || null,
        content: post.content || null,
        is_new: true,
        detected_at: new Date(changeRecord.timestamp).toISOString(),
      }));

      const { data: insertedPosts, error: insertError } = await supabase
        .from('blog_posts')
        .insert(blogPosts)
        .select();

      if (insertError) {
        throw insertError;
      }

      // Auto-predict topics for new posts
      if (insertedPosts && insertedPosts.length > 0) {
        console.log('Starting topic prediction for new posts...');
        
        // Get user topics for the blog owner
        const { data: userTopics, error: topicsError } = await supabase
          .from('user_topics')
          .select('*')
          .eq('user_id', blog.user_id);

        if (!topicsError && userTopics && userTopics.length > 0) {
          // Simple dummy prediction logic
          const predictTopic = (postTitle: string) => {
            const title = postTitle.toLowerCase();
            
            if (title.includes('nlp') || title.includes('language') || title.includes('text')) {
              return userTopics.find(t => t.name.toLowerCase().includes('nlp'));
            }
            if (title.includes('mlops') || title.includes('deployment') || title.includes('pipeline')) {
              return userTopics.find(t => t.name.toLowerCase().includes('mlops'));
            }
            if (title.includes('vision') || title.includes('image') || title.includes('cnn')) {
              return userTopics.find(t => t.name.toLowerCase().includes('vision'));
            }
            if (title.includes('machine learning') || title.includes('ml') || title.includes('regression')) {
              return userTopics.find(t => t.name.toLowerCase().includes('traditional') || t.name.toLowerCase().includes('ml'));
            }
            
            // Default to first available topic
            return userTopics[0];
          };

          // Assign predicted topics to posts
          for (const post of insertedPosts) {
            const predictedTopic = predictTopic(post.title);
            if (predictedTopic) {
              const { error: assignError } = await supabase
                .from('post_topics')
                .insert({
                  post_id: post.id,
                  topic_id: predictedTopic.id
                });

              if (assignError) {
                console.error(`Error assigning topic to post ${post.id}:`, assignError);
              } else {
                console.log(`Assigned topic "${predictedTopic.name}" to post "${post.title}"`);
              }
            }
          }
        }
      }

      // Update blog's last_checked timestamp
      const { error: updateError } = await supabase
        .from('blogs')
        .update({ 
          last_checked: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', blog.id);

      if (updateError) {
        throw updateError;
      }

      console.log(`Successfully inserted ${insertedPosts?.length} posts for ${changeRecord.blog_name}`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          inserted_posts: insertedPosts?.length || 0,
          blog_name: changeRecord.blog_name
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // GET request - return API documentation
    return new Response(
      JSON.stringify({
        message: 'Blog Posts Sync API',
        usage: 'POST to this endpoint with blog change records from your Python script',
        example_payload: {
          blog_name: 'Example Blog',
          blog_url: 'https://example.com',
          new_posts: [
            {
              title: 'Sample Post',
              link: 'https://example.com/post',
              published: '2025-01-01T00:00:00Z',
              summary: 'This is a sample post',
              content: 'Full content here...'
            }
          ],
          timestamp: '2025-01-01T00:00:00Z'
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in sync-blog-posts function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
