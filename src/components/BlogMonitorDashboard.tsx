
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Play, Plus, TestTube, Globe, Clock, TrendingUp } from 'lucide-react'
import { useBlogMonitor } from '@/hooks/useBlogMonitor'
import { useBlogs } from '@/hooks/useBlogs'

export const BlogMonitorDashboard = () => {
  const [newBlogUrl, setNewBlogUrl] = useState('')
  const [newBlogName, setNewBlogName] = useState('')
  
  const { addBlog, triggerBlogCheck, testBlogMonitor, isLoading } = useBlogMonitor()
  const { data: blogs, isLoading: blogsLoading } = useBlogs()

  const handleAddBlog = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBlogUrl.trim()) return

    try {
      await addBlog(newBlogUrl, newBlogName || undefined)
      setNewBlogUrl('')
      setNewBlogName('')
    } catch (error) {
      // Error handled in hook
    }
  }

  const activeBlogs = blogs?.filter(blog => blog.is_active) || []
  const recentlyChecked = blogs?.filter(blog => blog.last_checked)
    .sort((a, b) => new Date(b.last_checked!).getTime() - new Date(a.last_checked!).getTime())
    .slice(0, 5) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blog Monitor Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your favorite blogs for new posts automatically
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={testBlogMonitor}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <TestTube className="w-4 h-4 mr-2" />
            Test Service
          </Button>
          <Button 
            onClick={triggerBlogCheck}
            disabled={isLoading}
          >
            <Play className="w-4 h-4 mr-2" />
            Check Now
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Blogs</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBlogs.length}</div>
            <p className="text-xs text-muted-foreground">
              blogs being monitored
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recently Checked</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentlyChecked.length}</div>
            <p className="text-xs text-muted-foreground">
              blogs checked recently
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              posts detected
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="add-blog" className="space-y-4">
        <TabsList>
          <TabsTrigger value="add-blog">Add Blog</TabsTrigger>
          <TabsTrigger value="active-blogs">Active Blogs</TabsTrigger>
          <TabsTrigger value="recent-activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="add-blog">
          <Card>
            <CardHeader>
              <CardTitle>Add New Blog</CardTitle>
              <CardDescription>
                Add a blog URL to start monitoring for new posts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddBlog} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="blog-url">Blog URL *</Label>
                  <Input
                    id="blog-url"
                    type="url"
                    placeholder="https://example.com"
                    value={newBlogUrl}
                    onChange={(e) => setNewBlogUrl(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="blog-name">Blog Name (optional)</Label>
                  <Input
                    id="blog-name"
                    placeholder="My Favorite Blog"
                    value={newBlogName}
                    onChange={(e) => setNewBlogName(e.target.value)}
                  />
                </div>
                
                <Button type="submit" disabled={isLoading || !newBlogUrl.trim()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Blog
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active-blogs">
          <Card>
            <CardHeader>
              <CardTitle>Active Blogs</CardTitle>
              <CardDescription>
                Blogs currently being monitored
              </CardDescription>
            </CardHeader>
            <CardContent>
              {blogsLoading ? (
                <p>Loading blogs...</p>
              ) : activeBlogs.length === 0 ? (
                <p className="text-muted-foreground">No active blogs. Add one to get started!</p>
              ) : (
                <div className="space-y-3">
                  {activeBlogs.map((blog) => (
                    <div key={blog.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{blog.name}</h3>
                        <p className="text-sm text-muted-foreground">{blog.url}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {blog.last_checked && (
                            <span className="text-xs text-muted-foreground">
                              Last checked: {new Date(blog.last_checked).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent-activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Recently checked blogs and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentlyChecked.length === 0 ? (
                <p className="text-muted-foreground">No recent activity. Trigger a check to see results here.</p>
              ) : (
                <div className="space-y-3">
                  {recentlyChecked.map((blog) => (
                    <div key={blog.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{blog.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Checked: {new Date(blog.last_checked!).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant="outline">Checked</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
