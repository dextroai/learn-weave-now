import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Globe, Bell, Tag } from "lucide-react";
import { useBlogs, useAddBlog, useDeleteBlog, useUpdateBlog } from "@/hooks/useBlogs";
import { useUserTopics, useAddUserTopic } from "@/hooks/useUserTopics";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const navigate = useNavigate();
  const { data: blogs = [], isLoading: blogsLoading, error: blogsError } = useBlogs();
  const { data: userTopics = [] } = useUserTopics();
  const addBlogMutation = useAddBlog();
  const deleteBlogMutation = useDeleteBlog();
  const updateBlogMutation = useUpdateBlog();
  const addTopicMutation = useAddUserTopic();
  const { toast } = useToast();

  const [newBlog, setNewBlog] = useState({ name: "", url: "" });
  const [newTopic, setNewTopic] = useState("");
  const [notifications, setNotifications] = useState({
    dailyDigest: true,
    newInsights: true,
    weeklyReport: false,
  });

  // Debug logging
  console.log('Blogs data:', blogs);
  console.log('Blogs loading:', blogsLoading);
  console.log('Blogs error:', blogsError);

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your settings have been saved successfully.",
    });
    navigate('/');
  };

  const addBlog = async () => {
    if (!newBlog.name.trim() || !newBlog.url.trim()) {
      toast({
        title: "Error",
        description: "Please enter both blog name and URL.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Attempting to add blog:', newBlog);
      await addBlogMutation.mutateAsync({
        name: newBlog.name.trim(),
        url: newBlog.url.trim(),
      });
      setNewBlog({ name: "", url: "" });
      toast({
        title: "Blog Added",
        description: "Blog source has been added successfully.",
      });
    } catch (error) {
      console.error('Failed to add blog:', error);
      toast({
        title: "Error",
        description: "Failed to add blog source. Please try again.",
        variant: "destructive",
      });
    }
  };

  const removeBlog = async (id: string) => {
    try {
      await deleteBlogMutation.mutateAsync(id);
      toast({
        title: "Blog Removed",
        description: "Blog source has been removed successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove blog source.",
        variant: "destructive",
      });
    }
  };

  const toggleBlog = async (id: string, currentState: boolean) => {
    try {
      await updateBlogMutation.mutateAsync({
        id,
        is_active: !currentState,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update blog status.",
        variant: "destructive",
      });
    }
  };

  const addTopic = async () => {
    if (newTopic.trim()) {
      try {
        await addTopicMutation.mutateAsync({
          name: newTopic.trim(),
        });
        setNewTopic("");
        toast({
          title: "Topic Added",
          description: "New topic has been added successfully.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to add topic.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Settings
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage your blog sources, notifications, and preferences
          </p>
        </div>

        {/* Debug Info */}
        {blogsError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">Error loading blogs: {blogsError.message}</p>
          </div>
        )}

        {/* Blog Sources */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-600" />
              <CardTitle>Blog Sources</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add New Source */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div>
                <Label htmlFor="blogName">Blog Name</Label>
                <Input
                  id="blogName"
                  placeholder="e.g., React Blog"
                  value={newBlog.name}
                  onChange={(e) =>
                    setNewBlog({ ...newBlog, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="blogUrl">URL</Label>
                <Input
                  id="blogUrl"
                  placeholder="https://example.com"
                  value={newBlog.url}
                  onChange={(e) =>
                    setNewBlog({ ...newBlog, url: e.target.value })
                  }
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={addBlog} 
                  className="w-full gap-2"
                  disabled={addBlogMutation.isPending}
                >
                  <Plus className="h-4 w-4" />
                  {addBlogMutation.isPending ? "Adding..." : "Add Source"}
                </Button>
              </div>
            </div>

            {/* Existing Sources */}
            <div className="space-y-3">
              {blogsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-4 border border-slate-200 rounded-lg">
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : blogs.length > 0 ? (
                blogs.map((blog) => (
                  <div
                    key={blog.id}
                    className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <Switch
                        checked={blog.is_active}
                        onCheckedChange={() => toggleBlog(blog.id, blog.is_active)}
                      />
                      <div>
                        <h3 className="font-medium text-slate-900 dark:text-white">
                          {blog.name}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {blog.url}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={blog.is_active ? "default" : "secondary"}>
                        {blog.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBlog(blog.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={deleteBlogMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-500">No blog sources added yet</p>
                  <p className="text-sm text-slate-400 mt-1">
                    Add your first blog source above to start monitoring
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-purple-600" />
              <CardTitle>Notifications</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white">
                    Daily Digest
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Get a summary of new insights every day
                  </p>
                </div>
                <Switch
                  checked={notifications.dailyDigest}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, dailyDigest: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white">
                    New Insights
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Get notified when new insights are available
                  </p>
                </div>
                <Switch
                  checked={notifications.newInsights}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, newInsights: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white">
                    Weekly Report
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Receive a weekly summary of your learning progress
                  </p>
                </div>
                <Switch
                  checked={notifications.weeklyReport}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, weeklyReport: checked })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Topics Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-green-600" />
              <CardTitle>Topic Management</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add new topic (e.g., React, AI/ML)"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTopic()}
              />
              <Button onClick={addTopic} disabled={addTopicMutation.isPending}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {userTopics.map((topic) => (
                <div
                  key={topic.id}
                  className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg text-center hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <Badge variant="outline">{topic.name}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSaveSettings} className="gap-2">
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
