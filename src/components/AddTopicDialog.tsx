
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAddUserTopic } from "@/hooks/useUserTopics";
import { useToast } from "@/hooks/use-toast";

interface AddTopicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTopicDialog({ open, onOpenChange }: AddTopicDialogProps) {
  const [topicName, setTopicName] = useState("");
  const [topicId, setTopicId] = useState("");
  const addTopicMutation = useAddUserTopic();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!topicName.trim() || !topicId.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both topic name and ID",
        variant: "destructive",
      });
      return;
    }

    try {
      await addTopicMutation.mutateAsync({
        name: topicName.trim(),
        topic_id: parseInt(topicId),
        is_active: true,
      });

      toast({
        title: "Success",
        description: "Topic added successfully!",
      });

      setTopicName("");
      setTopicId("");
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add topic. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Topic</DialogTitle>
          <DialogDescription>
            Create a new topic to organize your blog posts.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={topicName}
                onChange={(e) => setTopicName(e.target.value)}
                className="col-span-3"
                placeholder="e.g., Technology, Health"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="topicId" className="text-right">
                Topic ID
              </Label>
              <Input
                id="topicId"
                type="number"
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                className="col-span-3"
                placeholder="e.g., 1, 2, 3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={addTopicMutation.isPending}
            >
              {addTopicMutation.isPending ? "Adding..." : "Add Topic"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
