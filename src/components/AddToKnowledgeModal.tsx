import { useState } from "react";
import { X, ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tables } from "@/integrations/supabase/types";
import { AddNewTopicModal } from "@/components/AddNewTopicModal";

type UserTopic = Tables<'user_topics'>;

interface AddToKnowledgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToKnowledgeBank: (topicId: string) => void;
  userTopics: UserTopic[];
  isLoading?: boolean;
  onAddNewTopic?: (name: string, topicId: number) => void;
  isAddingTopic?: boolean;
}

export function AddToKnowledgeModal({ 
  isOpen, 
  onClose, 
  onAddToKnowledgeBank, 
  userTopics,
  isLoading = false,
  onAddNewTopic,
  isAddingTopic = false
}: AddToKnowledgeModalProps) {
  const [selectedTopicId, setSelectedTopicId] = useState<string>("");
  const [isNewTopicModalOpen, setIsNewTopicModalOpen] = useState(false);

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

  const handleAddNewTopic = (name: string, topicId: number) => {
    if (onAddNewTopic) {
      onAddNewTopic(name, topicId);
    }
    setIsNewTopicModalOpen(false);
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
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Choose a topic label for this post <span className="text-red-500">*</span>
                </label>
                {onAddNewTopic && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsNewTopicModalOpen(true)}
                    className="text-blue-600 hover:text-blue-700 p-1 h-auto"
                    disabled={isLoading || isAddingTopic}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <Select value={selectedTopicId} onValueChange={setSelectedTopicId} disabled={isLoading || isAddingTopic}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={
                    isLoading 
                      ? "Loading topics..." 
                      : userTopics.length === 0 
                        ? "No topics available" 
                        : "Select a topic label"
                  } />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg z-[70]">
                  {isLoading ? (
                    <SelectItem value="loading" disabled>Loading topics...</SelectItem>
                  ) : userTopics.length === 0 ? (
                    <SelectItem value="empty" disabled>No topics available. Please create a topic first.</SelectItem>
                  ) : (
                    userTopics.map((topic) => (
                      <SelectItem 
                        key={topic.id} 
                        value={topic.topic_id.toString()}
                        className="hover:bg-gray-100"
                      >
                        {topic.name}
                      </SelectItem>
                    ))
                  )}
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

      {/* Add New Topic Modal */}
      <AddNewTopicModal
        isOpen={isNewTopicModalOpen}
        onClose={() => setIsNewTopicModalOpen(false)}
        onAddTopic={handleAddNewTopic}
        isLoading={isAddingTopic}
      />
    </>
  );
}