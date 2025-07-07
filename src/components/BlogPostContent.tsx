
import { Tables } from "@/integrations/supabase/types";

type BlogPost = Tables<'blog_posts'> & {
  blogs: {
    id: string;
    name: string;
    url: string;
  } | null;
};

interface BlogPostContentProps {
  post: BlogPost;
}

export const BlogPostContent = ({ post }: BlogPostContentProps) => {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{post.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{post.blogs?.name}</span>
            <span>•</span>
            <span>{new Date(post.detected_at).toLocaleDateString()}</span>
          </div>
        </div>
        
        {post.summary && (
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h2 className="font-semibold text-gray-900 mb-2">Summary</h2>
            <p className="text-gray-700">{post.summary}</p>
          </div>
        )}
        
        {post.content && (
          <div className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>
        )}
        
        {post.link && (
          <div className="mt-6 pt-6 border-t">
            <a 
              href={post.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              Read full article
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
