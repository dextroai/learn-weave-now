
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export const AddBlogPostButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    link: ""
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

      // Extract domain from URL to create blog name and URL
      let blogName = "";
      let blogUrl = "";
      try {
        const url = new URL(formData.link);
        blogName = url.hostname.replace('www.', '');
        blogUrl = `${url.protocol}//${url.hostname}`;
      } catch {
        blogName = "Manual Entry";
        blogUrl = formData.link;
      }

      // First, check if blog exists or create it
      let blogId: string;
      const { data: existingBlog } = await supabase
        .from('blogs')
        .select('id')
        .eq('url', blogUrl)
        .eq('user_id', user.id)
        .single();

      if (existingBlog) {
        blogId = existingBlog.id;
      } else {
        // Create new blog
        const { data: newBlog, error: blogError } = await supabase
          .from('blogs')
          .insert({
            name: blogName,
            url: blogUrl,
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
        link: ""
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
      <DialogContent className="sm:max-w-[400px]">
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
