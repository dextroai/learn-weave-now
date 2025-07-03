
import { useState } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { BlogPostCard } from "@/components/BlogPostCard";
import { NotesEditor } from "@/components/NotesEditor";
import { useBlogPosts, useMarkPostAsRead } from "@/hooks/useBlogPosts";

const Index = () => {
  const [selectedTab, setSelectedTab] = useState("blogs");
  
  // Extract category from selectedTab for filtering
  const category = selectedTab === "blogs" ? undefined : selectedTab.replace("-", "-");
  
  const { data: blogPosts = [], isLoading } = useBlogPosts(category);
  const markPostAsReadMutation = useMarkPostAsRead();

  const handleMarkAsRead = (postId: string) => {
    markPostAsReadMutation.mutate(postId);
  };

  const renderContent = () => {
    // Show notes editor for category tabs (not "blogs" and not individual posts)
    if (selectedTab !== "blogs" && !selectedTab.startsWith("post-") && selectedTab !== "archive") {
      return <NotesEditor category={selectedTab} />;
    }

    // Show individual blog post content
    if (selectedTab.startsWith("post-")) {
      const postId = selectedTab.replace("post-", "");
      const post = blogPosts.find(p => p.id === postId);
      
      if (post) {
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          </div>
        );
      }
      
      return (
        <div className="p-6">
          <div className="text-center text-gray-500">
            Post not found
          </div>
        </div>
      );
    }

    // Show blog posts grid for "blogs" tab or archive
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {selectedTab === "archive" ? "Archive" : "All Posts"}
          </h1>
          <p className="text-gray-600">
            {selectedTab === "archive" 
              ? "Previously read articles" 
              : "Latest blog posts from your sources"
            }
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-4 border border-gray-200 rounded-lg">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3 mb-2"></div>
                <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2"></div>
              </div>
            ))}
          </div>
        ) : blogPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {blogPosts.map((post) => (
              <BlogPostCard
                key={post.id}
                post={post}
                onMarkAsRead={handleMarkAsRead}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-2">No posts found</div>
            <div className="text-sm text-gray-400">
              {selectedTab === "archive" 
                ? "No archived posts yet" 
                : "No blog posts available. Try adding some blog sources in Settings."
              }
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar selectedTab={selectedTab} onTabChange={setSelectedTab} />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b border-gray-200">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>LearnWeave</span>
              <span>/</span>
              <span className="capitalize">
                {selectedTab.startsWith("post-") 
                  ? "Post" 
                  : selectedTab === "blogs" 
                    ? "All Posts" 
                    : selectedTab.replace("-", " ")
                }
              </span>
            </div>
          </header>
          <main className="flex-1">
            {renderContent()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
