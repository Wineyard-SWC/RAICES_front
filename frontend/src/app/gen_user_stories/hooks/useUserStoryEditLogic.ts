import { useEffect, useState } from 'react';
import { UserStory } from '@/types/userstory';
import { reorderUserStoryIds } from '../utils/reorderUserStoryIds';

export const useUserStoryEditLogic = (
  userStory: UserStory,
  onSave: (updated: UserStory) => void,
  onClose: () => void,
  onDelete: (uuid: string) => void
) => {
  const [title, setTitle] = useState(userStory.title);
  const [description, setDescription] = useState(userStory.description);
  const [priority, setPriority] = useState<UserStory['priority']>(userStory.priority);
  const [acceptance_criteria, setAcceptanceCriteria] = useState(userStory.acceptance_criteria);
  const [assigned_epic, setEpicId] = useState(userStory.assigned_epic);
  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

  useEffect(() => {
    const original = userStory;
    const current = { title, description, priority, acceptance_criteria, assigned_epic };
    const changed =
      original.title !== current.title ||
      original.description !== current.description ||
      original.priority !== current.priority ||
      JSON.stringify(original.acceptance_criteria) !== JSON.stringify(current.acceptance_criteria) ||
      original.assigned_epic !== current.assigned_epic;

    setHasChanges(changed);
  }, [title, description, priority, acceptance_criteria, assigned_epic, userStory]);

  const addCriterion = () => setAcceptanceCriteria(prev => [...prev, '']);

  const removeCriterion = (index: number) => {
    const updated = [...acceptance_criteria];
    updated.splice(index, 1);
    setAcceptanceCriteria(updated);
  };

  const updateCriterion = (index: number, value: string) => {
    const updated = [...acceptance_criteria];
    updated[index] = value;
    setAcceptanceCriteria(updated);
  };

  const handleTryClose = () => {
    if (hasChanges) setShowConfirmation(true);
    else {
        resetFields();
        onClose();
    }
  };

  const handleConfirmClose = () => {
    resetFields();    
    setShowConfirmation(false);
    onClose();
  };

  const resetFields = () => {
    setTitle('');
    setDescription('');
    setPriority('Medium');
    setAcceptanceCriteria([]);
  };

  const handleCancelClose = () => setShowConfirmation(false);

  const validateForm = () => {
    const newErrors: typeof errors = {};
    let valid = true;

    if (!title.trim()) {
      newErrors.title = 'Title cannot be empty';
      valid = false;
    }

    if (!description.trim()) {
      newErrors.description = 'Description cannot be empty';
      valid = false;
    }

    if (acceptance_criteria.some(c => !c.trim())) {
      alert("Please complete or remove empty acceptance criteria");
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    onSave({
      ...userStory,
      title,
      description,
      priority,
      acceptance_criteria: acceptance_criteria.filter(c => c.trim()),
      assigned_epic,
    });
    onClose();
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this user story?")) {
      onDelete(userStory.uuid);
      onClose();
    }
  };

  return {
    title,
    setTitle,
    description,
    setDescription,
    priority,
    setPriority,
    assigned_epic,
    setEpicId,
    acceptance_criteria,
    addCriterion,
    removeCriterion,
    updateCriterion,
    handleTryClose,
    handleConfirmClose,
    handleCancelClose,
    handleSave,
    handleDelete,
    showConfirmation,
    errors
  };
};
