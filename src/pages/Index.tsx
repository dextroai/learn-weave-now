import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Search, Settings, Grid3X3, RefreshCw, User, Brain, BookOpen, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useBlogPosts, useNewBlogPosts, useMarkPostAsRead } from "@/hooks/useBlogPosts";
import { useUserTopics, useToggleTopicActive } from "@/hooks/useUserTopics";
import { BlogPostCard } from "@/components/BlogPostCard";

const Index = () => {
  const { user, signOut } = useAuth();
  const [selectedTab, setSelectedTab] = useState("blogs");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch real data from Supabase
  const { data: blogPosts = [], isLoading: postsLoading } = useBlogPosts();
  const { data: userTopics = [] } = useUserTopics();
  const markAsReadMutation = useMarkPostAsRead();
  const toggleTopicMutation = useToggleTopicActive();

  const handleSignOut = async () => {
    await signOut();
  };

  const handleMarkAsRead = (postId: string) => {
    markAsReadMutation.mutate(postId);
  };

  const handleToggleTopic = (topicId: string, currentState: boolean) => {
    toggleTopicMutation.mutate({ 
      id: topicId, 
      is_active: !currentState 
    });
  };

  // Filter and separate unread/read posts
  const filteredPosts = blogPosts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.blogs?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Separate unread and read posts, then sort each group by date
  const unreadPosts = filteredPosts
    .filter(post => post.is_new)
    .sort((a, b) => new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime());
  
  const readPosts = filteredPosts
    .filter(post => !post.is_new)
    .sort((a, b) => new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime());

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-2">
                <Brain className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">Dextro</span>
              </div>
              <Link to="/auth">
                <Button className="gap-2">
                  <User className="h-4 w-4" />
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Transform Your Learning
              <span className="text-blue-600 block">with AI Insights</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Discover personalized insights from your favorite blogs, stay updated with the latest trends, 
              and accelerate your learning journey with intelligent recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="gap-2">
                  <Brain className="h-5 w-5" />
                  Get Started Free
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="gap-2">
                <BookOpen className="h-5 w-5" />
                Learn More
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Brain className="h-6 w-6 text-blue-600" />
                  <CardTitle>AI-Powered Insights</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get intelligent summaries and key takeaways from your favorite blogs and articles automatically.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                  <CardTitle>Trend Analysis</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Stay ahead of the curve with real-time analysis of emerging trends in your field of interest.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                  <CardTitle>Personalized Learning</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Receive customized content recommendations based on your learning goals and preferences.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Stats Section */}
          <div className="bg-white rounded-lg shadow-sm border p-8 mb-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">10K+</div>
                <div className="text-gray-600">Articles Analyzed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">500+</div>
                <div className="text-gray-600">Active Users</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">95%</div>
                <div className="text-gray-600">Accuracy Rate</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
                <div className="text-gray-600">Learning Support</div>
              </div>
            </div>
          </div>

          {/* Popular Topics */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Popular Topics</h2>
            <p className="text-gray-600 mb-8">Explore the most trending topics in technology and innovation</p>
            <div className="flex flex-wrap justify-center gap-2">
              {["AI & Machine Learning", "Web Development", "Data Science", "Cloud Computing", "Cybersecurity", "DevOps", "Mobile Development", "Blockchain"].map((topic) => (
                <Badge key={topic} variant="secondary" className="px-3 py-1">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gray-50">
          <AppSidebar selectedTab={selectedTab} onTabChange={setSelectedTab} />
          
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <SidebarTrigger />
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">L</span>
                    </div>
                    <span className="font-semibold text-gray-800">LearnWeave</span>
                  </div>
                  
                  <div className="relative flex-1 max-w-md ml-8">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search posts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-gray-50 border-gray-200"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Avatar className="h-8 w-8 bg-green-500">
                    <AvatarFallback className="bg-green-500 text-white text-sm">
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-6">
              {/* Topic Tags */}
              <div className="flex items-center gap-2 mb-6 flex-wrap">
                <Badge
                  variant="default"
                  className="px-4 py-2 text-sm font-medium cursor-pointer bg-yellow-400 text-black hover:bg-yellow-500"
                >
                  All Posts
                </Badge>
                {userTopics.map((topic) => (
                  <Badge
                    key={topic.id}
                    variant={topic.is_active ? "default" : "secondary"}
                    className={`px-4 py-2 text-sm font-medium cursor-pointer transition-colors ${
                      topic.is_active 
                        ? "bg-blue-500 text-white hover:bg-blue-600" 
                        : `${topic.color} text-gray-700 hover:bg-gray-200`
                    }`}
                    onClick={() => handleToggleTopic(topic.id, topic.is_active)}
                  >
                    {topic.name}
                  </Badge>
                ))}
                <Button variant="ghost" size="sm" className="rounded-full w-8 h-8 p-0">
                  +
                </Button>
              </div>

              {/* Blog Posts Grid */}
              {postsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <Card key={i} className="border-2 border-gray-200 h-48">
                      <CardHeader className="pb-3">
                        <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                        <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3"></div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="h-3 bg-gray-100 rounded animate-pulse mb-2"></div>
                        <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (unreadPosts.length > 0 || readPosts.length > 0) ? (
                <div className="space-y-8">
                  {/* Unread Posts Section */}
                  {unreadPosts.length > 0 && (
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                        Unread Posts ({unreadPosts.length})
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {unreadPosts.map((post) => (
                          <BlogPostCard
                            key={post.id}
                            post={post}
                            onMarkAsRead={handleMarkAsRead}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Read Posts Section */}
                  {readPosts.length > 0 && (
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                        Read Posts ({readPosts.length})
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {readPosts.map((post) => (
                          <BlogPostCard
                            key={post.id}
                            post={post}
                            onMarkAsRead={handleMarkAsRead}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">No blog posts found</p>
                  <p className="text-sm text-gray-400">
                    Add some blogs to monitor in the Settings page to see posts here.
                  </p>
                </div>
              )}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
};

export default Index;
