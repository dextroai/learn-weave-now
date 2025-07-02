import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Globe, Bell, Tag } from "lucide-react";

const Settings = () => {
  const [blogSources, setBlogSources] = useState([
    { id: 1, name: "React Blog", url: "https://react.dev/blog", active: true },
    { id: 2, name: "CSS Tricks", url: "https://css-tricks.com", active: true },
    { id: 3, name: "Smashing Magazine", url: "https://smashingmagazine.com", active: false },
  ]);

  const [newSource, setNewSource] = useState({ name: "", url: "" });
  const [notifications, setNotifications] = useState({
    dailyDigest: true,
    newInsights: true,
    weeklyReport: false,
  });

  const addBlogSource = () => {
    if (newSource.name && newSource.url) {
      setBlogSources([
        ...blogSources,
        {
          id: Date.now(),
          name: newSource.name,
          url: newSource.url,
          active: true,
        },
      ]);
      setNewSource({ name: "", url: "" });
    }
  };

  const removeBlogSource = (id: number) => {
    setBlogSources(blogSources.filter((source) => source.id !== id));
  };

  const toggleSource = (id: number) => {
    setBlogSources(
      blogSources.map((source) =>
        source.id === id ? { ...source, active: !source.active } : source
      )
    );
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
                <Label htmlFor="sourceName">Blog Name</Label>
                <Input
                  id="sourceName"
                  placeholder="e.g., React Blog"
                  value={newSource.name}
                  onChange={(e) =>
                    setNewSource({ ...newSource, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="sourceUrl">URL</Label>
                <Input
                  id="sourceUrl"
                  placeholder="https://example.com"
                  value={newSource.url}
                  onChange={(e) =>
                    setNewSource({ ...newSource, url: e.target.value })
                  }
                />
              </div>
              <div className="flex items-end">
                <Button onClick={addBlogSource} className="w-full gap-2">
                  <Plus className="h-4 w-4" />
                  Add Source
                </Button>
              </div>
            </div>

            {/* Existing Sources */}
            <div className="space-y-3">
              {blogSources.map((source) => (
                <div
                  key={source.id}
                  className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <Switch
                      checked={source.active}
                      onCheckedChange={() => toggleSource(source.id)}
                    />
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white">
                        {source.name}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {source.url}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={source.active ? "default" : "secondary"}>
                      {source.active ? "Active" : "Inactive"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBlogSource(source.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
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

        {/* Labels Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-green-600" />
              <CardTitle>Label Management</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {["React", "AI/ML", "Design", "Backend", "DevOps", "Mobile"].map((label) => (
                <div
                  key={label}
                  className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg text-center hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <Badge variant="outline">{label}</Badge>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4 gap-2">
              <Plus className="h-4 w-4" />
              Add New Label
            </Button>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button className="gap-2">
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
