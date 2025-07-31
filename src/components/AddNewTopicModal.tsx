import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddNewTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTopic: (name: string, topicId: number) => void;
  isLoading?: boolean;
}

export function AddNewTopicModal({ 
  isOpen, 
  onClose, 
  onAddTopic,
  isLoading = false 
}: AddNewTopicModalProps) {
  const [name, setName] = useState("");
  const [topicId, setTopicId] = useState("");

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = () => {
    if (name.trim() && topicId.trim() && !isNaN(Number(topicId))) {
      onAddTopic(name.trim(), parseInt(topicId));
      handleCancel();
    }
  };

  const handleCancel = () => {
    onClose();
    setName("");
    setTopicId("");
  };

  const isValid = name.trim() && topicId.trim() && !isNaN(Number(topicId)) && Number(topicId) > 0;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-[70]"
        onClick={handleOverlayClick}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-[71]">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Add New Topic
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Create a new topic to organize your blog posts.
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic-name" className="text-sm font-medium text-gray-700">
                Name
              </Label>
              <Input
                id="topic-name"
                type="text"
                placeholder="e.g., Technology, Health"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic-id" className="text-sm font-medium text-gray-700">
                Topic ID
              </Label>
              <Input
                id="topic-id"
                type="number"
                placeholder="e.g., 1, 2, 3"
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                className="w-full"
                disabled={isLoading}
                min="1"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="px-6"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isValid || isLoading}
              className="px-6 bg-slate-800 hover:bg-slate-900 text-white disabled:opacity-50"
            >
              {isLoading ? "Adding..." : "Add Topic"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}