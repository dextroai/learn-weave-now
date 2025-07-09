
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useUserTopics } from "@/hooks/useUserTopics";
import { useKnowledgeBank } from "@/hooks/useKnowledgeBank";

export const AddBlogPostButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    link: "",
    labelId: ""
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: userTopics = [] } = useUserTopics();
  const { addToKnowledgeBank } = useKnowledgeBank();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that a label is selected
    if (!formData.labelId) {
      toast({
        title: "Error",
        description: "Please select a topic label",
        variant: "destructive",
      });
      return;
    }
    
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
        .maybeSingle();

      if (existingBlog) {
        blogId = existingBlog.id;
      } else {
        // Create new blog - using 'nlp' as category (one of the allowed values)
        const { data: newBlog, error: blogError } = await supabase
          .from('blogs')
          .insert({
            name: blogName,
            url: blogUrl,
            category: 'nlp',
            user_id: user.id
          })
          .select('id')
          .single();

        if (blogError) throw blogError;
        blogId = newBlog.id;
      }

      // Create blog post with selected label_id and set is_new to false
      const { data: newPost, error: postError } = await supabase
        .from('blog_posts')
        .insert({
          title: formData.title,
          link: formData.link,
          blog_id: blogId,
          label_id: parseInt(formData.labelId),
          is_new: false // Set to false since it's manually added
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

      // Add to Knowledge Bank using the hook
      if (addToKnowledgeBank) {
        addToKnowledgeBank(newPost);
      }

      // Refresh queries to update the UI
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.invalidateQueries({ queryKey: ['knowledge-bank-posts'] });

      // Switch to Knowledge Bank view
      window.dispatchEvent(new CustomEvent('switchToKnowledgeBank'));

      toast({
        title: "Success",
        description: "Blog post added successfully and saved to Knowledge Bank!",
      });

      // Reset form and close dialog
      setFormData({
        title: "",
        link: "",
        labelId: ""
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

          <div className="space-y-2">
            <Label htmlFor="labelId">Label Topic *</Label>
            <Select 
              value={formData.labelId} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, labelId: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a topic label" />
              </SelectTrigger>
              <SelectContent>
                {userTopics.map((topic) => (
                  <SelectItem key={topic.topic_id} value={topic.topic_id.toString()}>
                    {topic.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
