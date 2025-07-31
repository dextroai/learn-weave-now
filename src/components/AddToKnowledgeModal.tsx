import { useState } from "react";
import { X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tables } from "@/integrations/supabase/types";

type UserTopic = Tables<'user_topics'>;

interface AddToKnowledgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToKnowledgeBank: (topicId: string) => void;
  userTopics: UserTopic[];
}

export function AddToKnowledgeModal({ 
  isOpen, 
  onClose, 
  onAddToKnowledgeBank, 
  userTopics 
}: AddToKnowledgeModalProps) {
  const [selectedTopicId, setSelectedTopicId] = useState<string>("");

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleAddToKnowledge = () => {
    if (selectedTopicId) {
      onAddToKnowledgeBank(selectedTopicId);
      onClose();
      setSelectedTopicId("");
    }
  };

  const handleCancel = () => {
    onClose();
    setSelectedTopicId("");
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-[60]"
        onClick={handleOverlayClick}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-[61]">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Select Topic Label
            </h2>
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
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Choose a topic label for this post <span className="text-red-500">*</span>
              </label>
              
              <Select value={selectedTopicId} onValueChange={setSelectedTopicId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a topic label" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg z-[70]">
                  {userTopics.map((topic) => (
                    <SelectItem 
                      key={topic.id} 
                      value={topic.topic_id.toString()}
                      className="hover:bg-gray-100"
                    >
                      {topic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddToKnowledge}
              disabled={!selectedTopicId}
              className="px-6 bg-gray-600 hover:bg-gray-700 text-white disabled:opacity-50"
            >
              Add to Knowledge Bank
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}