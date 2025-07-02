import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bell, Book, Clock, TrendingUp, Save } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const Index = () => {
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [notes, setNotes] = useState("");

  // Mock data for demonstration
  const recentInsights = [
    {
      id: 1,
      title: "Advanced React Patterns for 2024",
      source: "React Blog",
      summary: "New patterns emerging in React development including Server Components and Concurrent Features",
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=200&fit=crop",
      labels: ["React", "Frontend"],
      readTime: "5 min",
      isNew: true
    },
    {
      id: 2,
      title: "Machine Learning Fundamentals",
      source: "AI Weekly",
      summary: "Understanding the basics of ML algorithms and their practical applications",
      image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=200&fit=crop",
      labels: ["AI", "Machine Learning"],
      readTime: "8 min",
      isNew: true
    },
    {
      id: 3,
      title: "Modern CSS Grid Techniques",
      source: "CSS Tricks",
      summary: "Advanced grid layouts and responsive design patterns",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop",
      labels: ["CSS", "Design"],
      readTime: "6 min",
      isNew: false
    }
  ];

  const todayRecommendations = [
    {
      id: 4,
      title: "TypeScript Best Practices",
      source: "TypeScript Handbook",
      priority: "high",
      labels: ["TypeScript", "Best Practices"]
    },
    {
      id: 5,
      title: "Node.js Performance Optimization",
      source: "Node Weekly",
      priority: "medium",
      labels: ["Node.js", "Performance"]
    }
  ];

  const handleSaveNotes = () => {
    // Here you would typically save to backend
    console.log("Saving notes:", notes);
    // You could add a toast notification here later
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-slate-50 dark:bg-slate-900">
        <AppSidebar selectedTab={selectedTab} onTabChange={setSelectedTab} />
        
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
                    Good afternoon
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400">
                    Here's what's new in your learning journey
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Bell className="h-4 w-4" />
                  <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">3</Badge>
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="p-6 space-y-6">
            {/* Today's Insights - Compact Version */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  New Insights Today
                </h2>
                <Badge variant="secondary">3 new</Badge>
              </div>
              
              <div className="space-y-3">
                {recentInsights.map((insight) => (
                  <Card key={insight.id} className="group hover:shadow-md transition-all duration-300 cursor-pointer border-0 shadow-sm bg-white dark:bg-slate-800">
                    <div className="flex gap-3 p-3">
                      <div className="relative flex-shrink-0">
                        <img 
                          src={insight.image} 
                          alt={insight.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        {insight.isNew && (
                          <Badge className="absolute -top-1 -right-1 bg-green-500 hover:bg-green-600 text-xs px-1 py-0">
                            New
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-1">
                          {insight.title}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                          {insight.source} • {insight.readTime}
                        </p>
                        <p className="text-xs text-slate-700 dark:text-slate-300 mb-2 line-clamp-2">
                          {insight.summary}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {insight.labels.map((label) => (
                            <Badge key={label} variant="outline" className="text-xs px-1 py-0">
                              {label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>

            {/* Mental Notes Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Mental Notes
                </h2>
                <Button onClick={handleSaveNotes} size="sm" className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Notes
                </Button>
              </div>
              
              <Card className="bg-white dark:bg-slate-800">
                <CardContent className="p-4">
                  <Textarea
                    placeholder="Write down your thoughts, key takeaways, or action items from the blogs you've read..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[200px] resize-none border-0 focus-visible:ring-0 text-sm"
                  />
                </CardContent>
              </Card>
            </section>

            {/* Reading Recommendations */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Book className="h-5 w-5 text-purple-600" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Recommended Reading Today
                </h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {todayRecommendations.map((rec) => (
                  <Card key={rec.id} className="hover:shadow-md transition-shadow cursor-pointer bg-white dark:bg-slate-800">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-slate-900 dark:text-white mb-1">
                            {rec.title}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                            {rec.source}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {rec.labels.map((label) => (
                              <Badge key={label} variant="outline" className="text-xs">
                                {label}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <Badge 
                            variant={rec.priority === 'high' ? 'destructive' : 'secondary'}
                            className="capitalize"
                          >
                            {rec.priority}
                          </Badge>
                          <Clock className="h-4 w-4 text-slate-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Quick Actions */}
            <section>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                Quick Actions
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Book className="h-6 w-6" />
                  View All Blogs
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <TrendingUp className="h-6 w-6" />
                  Manage Labels
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Bell className="h-6 w-6" />
                  Notifications
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Clock className="h-6 w-6" />
                  Reading List
                </Button>
              </div>
            </section>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
