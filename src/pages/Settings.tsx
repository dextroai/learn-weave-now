
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBlogs, useAddBlog, useUpdateBlog, useDeleteBlog } from "@/hooks/useBlogs";
import { useUserTopics, useToggleTopicActive } from "@/hooks/useUserTopics";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Switch } from "@/components/ui/switch";
import { toast } from 'sonner';
import { TopicPredictionButton } from '@/components/TopicPredictionButton';
import { AddTopicDialog } from '@/components/AddTopicDialog';

interface BlogForm {
  url: string;
}

const Settings = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [newBlogUrl, setNewBlogUrl] = useState('');
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [editedBlog, setEditedBlog] = useState<Partial<BlogForm>>({});
  const [isAddTopicDialogOpen, setIsAddTopicDialogOpen] = useState(false);
  const navigate = useNavigate();

  const { data: blogs, isLoading, refetch } = useBlogs();
  const { data: userTopics } = useUserTopics();
  const addBlogMutation = useAddBlog();
  const updateBlogMutation = useUpdateBlog();
  const deleteBlogMutation = useDeleteBlog();
  const toggleTopicActiveMutation = useToggleTopicActive();

  useEffect(() => {
    if (!isLoading) {
      refetch();
    }
  }, [isLoading, refetch]);

  const handleAddBlog = async () => {
    if (!newBlogUrl) {
      toast.error('Please enter a blog URL');
      return;
    }

    const blogData = {
      url: newBlogUrl,
    };

    addBlogMutation.mutate(blogData, {
      onSuccess: () => {
        toast.success('Blog added successfully!');
        setNewBlogUrl('');
        setIsAdding(false);
      },
      onError: (error: any) => {
        toast.error(`Failed to add blog: ${error.message}`);
      },
    });
  };

  const handleEditBlog = (blogId: string, blog: any) => {
    setEditingBlogId(blogId);
    setEditedBlog({ ...blog });
  };

  const handleUpdateBlog = async () => {
    if (!editingBlogId) return;

    updateBlogMutation.mutate({ id: editingBlogId, ...editedBlog }, {
      onSuccess: () => {
        toast.success('Blog updated successfully!');
        setEditingBlogId(null);
        setEditedBlog({});
      },
      onError: (error: any) => {
        toast.error(`Failed to update blog: ${error.message}`);
      },
    });
  };

  const handleDeleteBlog = async (id: string) => {
    deleteBlogMutation.mutate(id, {
      onSuccess: () => {
        toast.success('Blog deleted successfully!');
      },
      onError: (error: any) => {
        toast.error(`Failed to delete blog: ${error.message}`);
      },
    });
  };

  const handleCancelEdit = () => {
    setEditingBlogId(null);
    setEditedBlog({});
  };

  const handleToggleTopicActive = async (topicId: string, isActive: boolean) => {
    toggleTopicActiveMutation.mutate(
      { id: topicId, is_active: !isActive },
      {
        onSuccess: () => {
          toast.success(`Topic ${!isActive ? 'activated' : 'deactivated'} successfully!`);
        },
        onError: (error: any) => {
          toast.error(`Failed to update topic: ${error.message}`);
        },
      }
    );
  };

  const navigateToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your blog sources and topics</p>
        </div>

        <div className="space-y-8">
          {/* Topic Prediction Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Topic Prediction</h2>
                <p className="text-gray-600 text-sm mt-1">
                  Automatically predict and assign topics to your blog posts
                </p>
              </div>
              <TopicPredictionButton />
            </div>
          </div>

          {/* Blog Sources Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="md:flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Blog Sources</h2>
              <Button onClick={() => setIsAdding(true)} size="sm">
                Add Blog Source
              </Button>
            </div>

            {isAdding && (
              <div className="mb-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="url">Blog URL</Label>
                    <Input
                      type="url"
                      id="url"
                      placeholder="https://example.com"
                      value={newBlogUrl}
                      onChange={(e) => setNewBlogUrl(e.target.value)}
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => setIsAdding(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddBlog}>Add</Button>
                </div>
              </div>
            )}

            {blogs && blogs.length > 0 ? (
              <Table>
                <TableCaption>A list of your blog sources.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>URL</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blogs.map((blog) => (
                    <TableRow key={blog.id}>
                      <TableCell>{editingBlogId === blog.id ? (
                        <Input
                          type="text"
                          value={editedBlog.url || blog.url}
                          onChange={(e) => setEditedBlog({ ...editedBlog, url: e.target.value })}
                        />
                      ) : blog.url}</TableCell>
                      <TableCell className="text-right">
                        {editingBlogId === blog.id ? (
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                              Cancel
                            </Button>
                            <Button size="sm" onClick={handleUpdateBlog}>
                              Update
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditBlog(blog.id, blog)}>
                              Edit
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteBlog(blog.id)}>
                              Delete
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={2}>
                      {/* You can add pagination or additional information here */}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            ) : (
              <div className="text-gray-500">No blog sources added yet.</div>
            )}
          </div>

          {/* Topics Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Your Topics</h2>
              <Button onClick={() => setIsAddTopicDialogOpen(true)} size="sm">
                Add Topic
              </Button>
            </div>
            {userTopics && userTopics.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userTopics.map((topic) => (
                  <div key={topic.id} className="flex items-center justify-between p-3 rounded-md shadow-sm border border-gray-200">
                    <div>
                      <span className="font-medium text-gray-700">{topic.name}</span>
                      <p className="text-sm text-gray-500">Topic ID: {topic.topic_id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch 
                        id={`topic-active-${topic.id}`} 
                        checked={topic.is_active}
                        onCheckedChange={() => handleToggleTopicActive(topic.id, topic.is_active)}
                      />
                      <Label htmlFor={`topic-active-${topic.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Active
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500">No topics created yet. Click "Add Topic" to create your first topic.</div>
            )}
          </div>
        </div>
      </div>

      <AddTopicDialog 
        open={isAddTopicDialogOpen} 
        onOpenChange={setIsAddTopicDialogOpen} 
      />
    </div>
  );
};

export default Settings;
