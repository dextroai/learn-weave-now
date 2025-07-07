
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export const AddBlogPostButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    link: "",
    summary: "",
    blogName: "",
    blogUrl: ""
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to add blog posts",
          variant: "destructive",
        });
        return;
      }

      // First, check if blog exists or create it
      let blogId: string;
      const { data: existingBlog } = await supabase
        .from('blogs')
        .select('id')
        .eq('url', formData.blogUrl)
        .eq('user_id', user.id)
        .single();

      if (existingBlog) {
        blogId = existingBlog.id;
      } else {
        // Create new blog
        const { data: newBlog, error: blogError } = await supabase
          .from('blogs')
          .insert({
            name: formData.blogName,
            url: formData.blogUrl,
            category: 'manual',
            user_id: user.id
          })
          .select('id')
          .single();

        if (blogError) throw blogError;
        blogId = newBlog.id;
      }

      // Create blog post
      const { data: newPost, error: postError } = await supabase
        .from('blog_posts')
        .insert({
          title: formData.title,
          link: formData.link,
          summary: formData.summary,
          blog_id: blogId,
          is_new: true
        })
        .select(`
          *,
          blogs:blog_id (
            id,
            name,
            url
          )
        `)
        .single();

      if (postError) throw postError;

      // Add to Knowledge Bank automatically
      window.dispatchEvent(new CustomEvent('postAddedToKnowledgeBank', { 
        detail: { post: newPost } 
      }));

      // Refresh queries
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
      queryClient.invalidateQueries({ queryKey: ['blogs'] });

      toast({
        title: "Success",
        description: "Blog post added successfully and saved to Knowledge Bank!",
      });

      // Reset form and close dialog
      setFormData({
        title: "",
        link: "",
        summary: "",
        blogName: "",
        blogUrl: ""
      });
      setIsOpen(false);

    } catch (error) {
      console.error('Error adding blog post:', error);
      toast({
        title: "Error",
        description: "Failed to add blog post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <img 
            src="/lovable-uploads/80fb2239-d4ae-45d2-b83c-22b7e5b557e5.png" 
            alt="Add blog post" 
            className="w-4 h-4"
          />
          <span className="text-sm">Add Post</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Blog Post</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Post Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter post title"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="link">Post URL</Label>
            <Input
              id="link"
              type="url"
              value={formData.link}
              onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
              placeholder="https://example.com/post"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="summary">Summary (Optional)</Label>
            <Textarea
              id="summary"
              value={formData.summary}
              onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
              placeholder="Brief summary of the post"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="blogName">Blog Name</Label>
            <Input
              id="blogName"
              value={formData.blogName}
              onChange={(e) => setFormData(prev => ({ ...prev, blogName: e.target.value }))}
              placeholder="e.g., TechCrunch"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="blogUrl">Blog URL</Label>
            <Input
              id="blogUrl"
              type="url"
              value={formData.blogUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, blogUrl: e.target.value }))}
              placeholder="https://techcrunch.com"
              required
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Post"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
