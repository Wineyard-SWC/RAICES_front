'use client'

import { useEffect, useState } from 'react';
import { UserStory, AcceptanceCriteriaData } from '@/types/userstory';
import { reorderUserStoryIds } from '../utils/reorderUserStoryIds';
import { v4 as uuidv4 } from 'uuid';
import { useUser } from '@/contexts/usercontext';



export const useUserStoryEditLogic = (
  userStory: UserStory,
  onSave: (updated: UserStory) => void,
  onClose: () => void,
  onDelete: (uuid: string) => void
) => {
  const [title, setTitle] = useState(userStory.title);
  const [description, setDescription] = useState(userStory.description);
  const [priority, setPriority] = useState<UserStory['priority']>(userStory.priority);
  const [acceptanceCriteria, setAcceptanceCriteria] = useState<AcceptanceCriteriaData[]>(
    userStory.acceptanceCriteria || []
  );
  const [assigned_epic, setEpicId] = useState(userStory.assigned_epic);
  const [points, setPoints] = useState(userStory.points || 0);
  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errors, setErrors] = useState<{ 
    title?: string;
    description?: string;
    acceptanceCriteria?: string 
    points?: string;
  }>({});
  
  const {userData} = useUser()
    

  const getUserInfo = (): [string, string] => {
    const userId = typeof window !== 'undefined' 
      ? localStorage.getItem("userId") || "RAICES_IA" 
      : "RAICES_IA";
    const userName = userData?.name || "RAICES_IA";
    return [userId, userName];
  };

  useEffect(() => {
    const original = userStory;
    const current = { 
      title, 
      description, 
      priority, 
      acceptanceCriteria, 
      assigned_epic,
      points 
    };
    
    const criteriaChanged = original.acceptanceCriteria?.length !== current.acceptanceCriteria.length ||
      original.acceptanceCriteria?.some((criteria, index) => {
        return !current.acceptanceCriteria[index] || 
               criteria.description !== current.acceptanceCriteria[index].description;
      });

    const changed =
      original.title !== current.title ||
      original.description !== current.description ||
      original.priority !== current.priority ||
      criteriaChanged ||
      original.assigned_epic !== current.assigned_epic ||
      original.points !== current.points;

    setHasChanges(changed);
  }, [
    title, 
    description, 
    priority, 
    acceptanceCriteria, 
    assigned_epic, 
    points,
    userStory
  ]);

  const addCriterion = () => {
    const userInfo = getUserInfo();
    const now = new Date().toISOString();
    const newCriterion: AcceptanceCriteriaData = {
      id: uuidv4(),
      description: '',
      date_completed: '',
      date_created: now,
      date_modified: now,
      finished_by: ['', ''],
      created_by: userInfo,
      modified_by: userInfo
    };
    
    setAcceptanceCriteria(prev => [...prev, newCriterion]);
  };

  const removeCriterion = (index: number) => {
    const updated = [...acceptanceCriteria];
    updated.splice(index, 1);
    setAcceptanceCriteria(updated);
  };

  const updateCriterion = (index: number, value: string) => {
    const userInfo = getUserInfo();
    const now = new Date().toISOString();
    
    const updated = [...acceptanceCriteria];
    updated[index] = {
      ...updated[index],
      description: value,
      date_modified: now,
      modified_by: userInfo
    };
    
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
    setTitle(userStory.title);
    setDescription(userStory.description);
    setPriority(userStory.priority);
    setAcceptanceCriteria(userStory.acceptanceCriteria || []);
    setPoints(userStory.points || 0);
    setErrors({})
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

    if (acceptanceCriteria.some(c => !c.description.trim())) {
      newErrors.acceptanceCriteria = 'Acceptance criteria cannot be empty';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    
    const filteredCriteria = acceptanceCriteria.filter(c => c.description.trim());
    
    onSave({
      ...userStory,
      title,
      description,
      priority,
      acceptanceCriteria: filteredCriteria,
      assigned_epic,
      points,
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
    points,
    setPoints,
    assigned_epic,
    setEpicId,
    acceptanceCriteria,
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
