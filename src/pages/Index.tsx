import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Search, Settings, Grid3X3, RefreshCw, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Index = () => {
  const { user, signOut } = useAuth();
  const [selectedTab, setSelectedTab] = useState("blogs");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSignOut = async () => {
    await signOut();
  };

  const topics = [
    { name: "Quick Notes", active: true, color: "bg-yellow-400" },
    { name: "CITI", active: false, color: "bg-red-100" },
    { name: "RAG", active: false, color: "bg-blue-100" },
    { name: "NLP", active: false, color: "bg-purple-100" },
    { name: "MLOPS", active: false, color: "bg-orange-100" },
    { name: "LLMs", active: false, color: "bg-gray-100" },
    { name: "Agents", active: false, color: "bg-green-100" },
    { name: "Reinforcement", active: false, color: "bg-teal-100" },
    { name: "ML", active: false, color: "bg-indigo-100" },
  ];

  const blogPosts = [
    {
      id: 1,
      title: "Advanced React Patterns for 2024",
      category: "React Blog",
      timeAgo: "2 hours ago",
      isNew: true,
      content: "New patterns emerging in React development including Server...",
      keyTakeaways: [
        "Server Components reduce bundle size",
        "Concurrent features improve UX",
        "Need to refactor current project"
      ]
    },
    {
      id: 2,
      title: "Machine Learning Fundamentals",
      category: "AI Weekly",
      timeAgo: "4 hours ago",
      isNew: true,
      content: "Understanding the basics of ML algorithms and their practical...",
      keyTakeaways: [
        "Supervised vs Unsupervised learning",
        "Feature engineering is crucial",
        "Start with simple models first"
      ],
      nextSteps: "Practice with scikit-learn"
    },
    {
      id: 3,
      title: "Node.js Performance Optimization",
      category: "Node Weekly",
      timeAgo: "6 hours ago",
      isNew: true,
      content: "Techniques to improve Node.js application performance...",
      keyTakeaways: [
        "Use clustering",
        "Implement caching",
        "Optimize database queries"
      ]
    }
  ];

  const sidebarItems = [
    {
      id: 4,
      title: "TypeScript Best Practices",
      category: "TypeScript Handbook",
      timeAgo: "2 days ago",
      content: "Essential TypeScript patterns for better code quality",
      keyTakeaways: [
        "Use strict mode",
        "Leverage union types",
        "Avoid 'any' type",
        "Use utility types effectively"
      ],
      todo: "Apply these to current project"
    },
    {
      id: 5,
      title: "Docker Container Security",
      category: "DevOps Weekly",
      timeAgo: "3 days ago",
      content: "Security best practices for containerized applications",
      keyTakeaways: [
        "Use minimal base images",
        "Scan for vulnerabilities",
        "Implement proper secrets management"
      ]
    }
  ];

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
                      placeholder="Search"
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
                {topics.map((topic) => (
                  <Badge
                    key={topic.name}
                    variant={topic.active ? "default" : "secondary"}
                    className={`px-4 py-2 text-sm font-medium cursor-pointer transition-colors ${
                      topic.active 
                        ? "bg-yellow-400 text-black hover:bg-yellow-500" 
                        : `${topic.color} text-gray-700 hover:bg-gray-200`
                    }`}
                  >
                    {topic.name}
                  </Badge>
                ))}
                <Button variant="ghost" size="sm" className="rounded-full w-8 h-8 p-0">
                  +
                </Button>
              </div>

              {/* Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Content Area */}
                <div className="lg:col-span-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {blogPosts.map((post) => (
                      <Card key={post.id} className="border-2 border-orange-200 hover:border-orange-300 transition-colors cursor-pointer">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                                {post.title}
                              </CardTitle>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span>{post.category}</span>
                                <span>•</span>
                                <span>{post.timeAgo}</span>
                                {post.isNew && (
                                  <Badge variant="destructive" className="bg-orange-500 hover:bg-orange-600 text-xs px-2 py-1">
                                    New
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-gray-600 text-sm mb-3">{post.content}</p>
                          
                          {post.keyTakeaways && (
                            <div className="mb-3">
                              <p className="text-sm font-medium text-gray-700 mb-2">Key takeaways:</p>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {post.keyTakeaways.map((takeaway, index) => (
                                  <li key={index} className="flex items-start">
                                    <span className="mr-2">-</span>
                                    <span>{takeaway}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {post.nextSteps && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Next steps:</span> {post.nextSteps}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Sidebar Content */}
                <div className="lg:col-span-1 space-y-4">
                  {sidebarItems.map((item) => (
                    <div key={item.id} className="bg-white p-4 rounded-lg border border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                      <div className="text-xs text-gray-500 mb-2">
                        {item.category} • {item.timeAgo}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{item.content}</p>
                      
                      {item.keyTakeaways && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-gray-700 mb-1">Best practices noted:</p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {item.keyTakeaways.map((takeaway, index) => (
                              <li key={index} className="flex items-start">
                                <span className="mr-1">-</span>
                                <span>{takeaway}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {item.todo && (
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">TODO:</span> {item.todo}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
};

export default Index;
