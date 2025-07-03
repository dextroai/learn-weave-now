import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Menu, Search, RefreshCw, Settings, Grid3X3, Plus, MoreVertical, User } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const Index = () => {
  const [selectedTab, setSelectedTab] = useState("blogs");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("Quick Notes");

  // Label categories with colors
  const labels = [
    { name: "Quick Notes", color: "bg-yellow-400" },
    { name: "CITI", color: "bg-red-400" },
    { name: "RAG", color: "bg-blue-400" },
    { name: "NLP", color: "bg-purple-400" },
    { name: "MLOPS", color: "bg-orange-400" },
    { name: "LLMs", color: "bg-violet-400" },
    { name: "Agents", color: "bg-gray-400" },
    { name: "Reinforcement", color: "bg-green-400" },
    { name: "ML", color: "bg-pink-400" },
  ];

  // Mock data for blogs with different sizes and read status
  const blogNotes = [
    {
      id: 1,
      title: "Advanced React Patterns for 2024",
      source: "React Blog",
      summary: "New patterns emerging in React development including Server Components and Concurrent Features",
      userNotes: "Key takeaways:\n- Server Components reduce bundle size\n- Concurrent features improve UX\n- Need to refactor current project",
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
    blog.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-white">
        <AppSidebar selectedTab={selectedTab} onTabChange={setSelectedTab} />
        
        <main className="flex-1 overflow-auto">
          {/* Header - Updated without Keep branding */}
          <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
            <div className="flex items-center h-16 px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-gray-600 hover:bg-gray-100 rounded-full p-3" />
              </div>
              
              <div className="flex-1 flex justify-center px-8">
                <div className="relative max-w-2xl w-full">
                  <Search className="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-100 hover:bg-white hover:shadow-md focus:bg-white focus:shadow-md rounded-lg border-0 text-base text-gray-900 placeholder:text-gray-500 focus:outline-none transition-all duration-200"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-full hover:bg-gray-100">
                  <RefreshCw className="h-5 w-5 text-gray-600" />
                </Button>
                <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-full hover:bg-gray-100">
                  <Settings className="h-5 w-5 text-gray-600" />
                </Button>
                <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-full hover:bg-gray-100">
                  <Grid3X3 className="h-5 w-5 text-gray-600" />
                </Button>
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center ml-2">
                  <span className="text-white text-sm font-medium">A</span>
                </div>
              </div>
            </div>

            {/* Labels Section */}
            <div className="px-6 pb-4">
              <div className="flex gap-2 flex-wrap">
                {labels.map((label) => (
                  <button
                    key={label.name}
                    onClick={() => setSelectedLabel(label.name)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      selectedLabel === label.name
                        ? `${label.color} text-white shadow-md`
                        : `${label.color} bg-opacity-20 text-gray-700 hover:${label.color} hover:bg-opacity-30`
                    }`}
                  >
                    {label.name}
                  </button>
                ))}
                <button className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <div className="p-6">
            {/* Masonry Grid Layout */}
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
              {filteredBlogs.map((blog) => (
                <Card 
                  key={blog.id} 
                  className={`break-inside-avoid ${blog.height} bg-white shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 ${
                    !blog.isRead ? 'ring-2 ring-orange-400' : ''
                  }`}
                >
                  <CardContent className="p-4 h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                          {blog.title}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-gray-500">
                            {blog.source}
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-400">
                            {blog.createdAt}
                          </span>
                          {!blog.isRead && (
                            <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 text-xs px-2 py-0 ml-auto">
                              New
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Blog Summary */}
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      {blog.summary}
                    </p>

                    {/* User Notes Area - removed scrollbar */}
                    <div className="flex-1 flex flex-col">
                      <Textarea
                        placeholder="Write your notes here..."
                        value={notes[blog.id] || ''}
                        onChange={(e) => handleNotesChange(blog.id, e.target.value)}
                        className="flex-1 text-xs resize-none border-0 focus-visible:ring-0 p-0 bg-transparent placeholder:text-gray-400 text-gray-700 overflow-hidden"
                        style={{ minHeight: '60px' }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredBlogs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No notes found matching your search.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
