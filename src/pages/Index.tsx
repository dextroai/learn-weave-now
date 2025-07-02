
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bell, Search, Plus, MoreVertical } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const Index = () => {
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for blogs with different sizes and read status
  const blogNotes = [
    {
      id: 1,
      title: "Advanced React Patterns for 2024",
      source: "React Blog",
      summary: "New patterns emerging in React development including Server Components and Concurrent Features",
      userNotes: "Key takeaways:\n- Server Components reduce bundle size\n- Concurrent features improve UX\n- Need to refactor current project",
      labels: ["React", "Frontend"],
      isNew: true,
      isRead: false,
      height: "h-64",
      createdAt: "2 hours ago"
    },
    {
      id: 2,
      title: "Machine Learning Fundamentals",
      source: "AI Weekly",
      summary: "Understanding the basics of ML algorithms and their practical applications",
      userNotes: "Important concepts:\n- Supervised vs Unsupervised learning\n- Feature engineering is crucial\n- Start with simple models first\n\nNext steps: Practice with scikit-learn",
      labels: ["AI", "Machine Learning"],
      isNew: true,
      isRead: false,
      height: "h-80",
      createdAt: "4 hours ago"
    },
    {
      id: 3,
      title: "Modern CSS Grid Techniques",
      source: "CSS Tricks",
      summary: "Advanced grid layouts and responsive design patterns",
      userNotes: "Grid vs Flexbox:\n- Grid for 2D layouts\n- Flexbox for 1D layouts\n- Use grid-template-areas for complex layouts",
      labels: ["CSS", "Design"],
      isNew: false,
      isRead: true,
      height: "h-48",
      createdAt: "1 day ago"
    },
    {
      id: 4,
      title: "TypeScript Best Practices",
      source: "TypeScript Handbook",
      summary: "Essential TypeScript patterns for better code quality",
      userNotes: "Best practices noted:\n- Use strict mode\n- Leverage union types\n- Avoid 'any' type\n- Use utility types effectively\n\nTODO: Apply these to current project",
      labels: ["TypeScript", "Best Practices"],
      isNew: false,
      isRead: true,
      height: "h-72",
      createdAt: "2 days ago"
    },
    {
      id: 5,
      title: "Node.js Performance Optimization",
      source: "Node Weekly",
      summary: "Techniques to improve Node.js application performance",
      userNotes: "Performance tips:\n- Use clustering\n- Implement caching\n- Optimize database queries\n- Monitor memory usage",
      labels: ["Node.js", "Performance"],
      isNew: true,
      isRead: false,
      height: "h-56",
      createdAt: "6 hours ago"
    },
    {
      id: 6,
      title: "Docker Container Security",
      source: "DevOps Weekly",
      summary: "Security best practices for containerized applications",
      userNotes: "Security checklist:\n- Use minimal base images\n- Don't run as root\n- Scan for vulnerabilities\n- Implement proper secrets management",
      labels: ["Docker", "Security"],
      isNew: false,
      isRead: true,
      height: "h-60",
      createdAt: "3 days ago"
    }
  ];

  const [notes, setNotes] = useState(
    blogNotes.reduce((acc, blog) => {
      acc[blog.id] = blog.userNotes;
      return acc;
    }, {} as Record<number, string>)
  );

  const handleNotesChange = (blogId: number, value: string) => {
    setNotes(prev => ({
      ...prev,
      [blogId]: value
    }));
  };

  // Sort blogs: unread first, then by creation time
  const sortedBlogs = [...blogNotes].sort((a, b) => {
    if (a.isRead !== b.isRead) {
      return a.isRead ? 1 : -1; // Unread first
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const filteredBlogs = sortedBlogs.filter(blog =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.labels.some(label => label.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-slate-50 dark:bg-slate-900">
        <AppSidebar selectedTab={selectedTab} onTabChange={setSelectedTab} />
        
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <header className="sticky top-0 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-yellow-400 rounded flex items-center justify-center">
                    <span className="text-sm font-bold">📝</span>
                  </div>
                  <h1 className="text-xl font-medium text-slate-900 dark:text-white">
                    Learning Notes
                  </h1>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search your notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-80 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Bell className="h-4 w-4" />
                  <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
                    {filteredBlogs.filter(blog => !blog.isRead).length}
                  </Badge>
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="p-6">
            {/* Quick Add Note */}
            <div className="mb-6">
              <Card className="bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow cursor-text">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Plus className="h-5 w-5 text-slate-400" />
                    <span className="text-slate-500 dark:text-slate-400">Take a note...</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Masonry Grid Layout */}
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
              {filteredBlogs.map((blog) => (
                <Card 
                  key={blog.id} 
                  className={`break-inside-avoid ${blog.height} bg-white dark:bg-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border-0 ${
                    !blog.isRead ? 'ring-2 ring-blue-200 dark:ring-blue-800' : ''
                  }`}
                >
                  <CardContent className="p-4 h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-slate-900 dark:text-white text-sm line-clamp-2 mb-1">
                          {blog.title}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {blog.source}
                          </span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-400">
                            {blog.createdAt}
                          </span>
                          {!blog.isRead && (
                            <Badge className="bg-blue-500 hover:bg-blue-600 text-xs px-1 py-0 ml-auto">
                              New
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Blog Summary */}
                    <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 line-clamp-2">
                      {blog.summary}
                    </p>

                    {/* User Notes Area */}
                    <div className="flex-1 flex flex-col">
                      <Textarea
                        placeholder="Write your notes here..."
                        value={notes[blog.id] || ''}
                        onChange={(e) => handleNotesChange(blog.id, e.target.value)}
                        className="flex-1 text-xs resize-none border-0 focus-visible:ring-0 p-0 bg-transparent placeholder:text-slate-400"
                        style={{ minHeight: '60px' }}
                      />
                    </div>

                    {/* Labels */}
                    <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                      {blog.labels.map((label) => (
                        <Badge 
                          key={label} 
                          variant="outline" 
                          className="text-xs px-1 py-0 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                        >
                          {label}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredBlogs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-500 dark:text-slate-400">No notes found matching your search.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
