import { useEffect, useState } from "react";
import { Requirement } from "@/types/requirement";
import { Epic } from "@/types/epic";
import { useRequirementContext } from "@/contexts/requirementcontext";
import { useEpicContext } from "@/contexts/epiccontext";
import { generateNextRequirementId } from "@/app/gen_epics/utils/relatedRequirementCategory";


export const useRequirementEditLogic = (
  requirement: Pick<Requirement, 'id' | 'idTitle' | 'title' | 'description' | 'priority'| 'category'|'uuid'>,
  onSave: (updated: Requirement) => void,
  onClose: () => void,
  onDelete: (uuid: string) => void
) => {
  const [title, setTitle] = useState(requirement.title);
  const [description, setDescription] = useState(requirement.description);
  const [priority, setPriority] = useState<Requirement['priority']>(requirement.priority);
  const [category, setCategory] = useState<Requirement['category']>(() =>
    requirement.idTitle.includes('-NF-') ? 'No Funcional' : 'Funcional'
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

  const { requirements, setRequirements } = useRequirementContext();
  const { epics, setEpics } = useEpicContext();

  useEffect(() => {
    const baseCategory = requirement.idTitle.includes('-NF-') ? 'No Funcional' : 'Funcional';
    const changed =
      requirement.title !== title ||
      requirement.description !== description ||
      requirement.priority !== priority ||
      category !== baseCategory;

    setHasChanges(changed);
  }, [title, description, priority, category, requirement]);

  const resetForm = () => {
    setTitle(requirement.title);
    setDescription(requirement.description);
    setPriority(requirement.priority);
    setCategory(requirement.idTitle.includes('-NF-') ? 'No Funcional' : 'Funcional');
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: { title?: string; description?: string } = {};
    let isValid = true;

    if (!title.trim()) {
      newErrors.title = "Title cannot be empty";
      isValid = false;
    }

    if (!description.trim()) {
      newErrors.description = "Description cannot be empty";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const baseCategory = requirement.idTitle.includes('-NF-') ? 'No Funcional' : 'Funcional';

    let updatedRequirement = {
      ...requirement,
      title,
      description,
      priority,
      category,
    };

    if (baseCategory !== category) {
      const newIdTitle = generateNextRequirementId(requirements, category as 'Funcional' | 'No Funcional');
      updatedRequirement.idTitle = newIdTitle;
    }

    setRequirements((prev) =>
      prev.map((r) => (r.uuid === updatedRequirement.uuid ? updatedRequirement : r))
    );

    const updatedEpics = epics.map((epic) => ({
      ...epic,
      relatedRequirements: epic.relatedRequirements.map((req) =>
        req.uuid === updatedRequirement.uuid
          ? {
              ...req,
              idTitle: updatedRequirement.idTitle,
              title: updatedRequirement.title,
              description: updatedRequirement.description,
              priority: updatedRequirement.priority,
            }
          : req
      ),
    }));

    setEpics(updatedEpics);
    onSave(updatedRequirement);
    onClose();
  };

  return {
    title,
    description,
    priority,
    category,
    errors,
    hasChanges,
    showConfirmation,
    setTitle,
    setDescription,
    setPriority,
    setCategory,
    setShowConfirmation,
    resetForm,
    validateForm,
    handleSave,
    handleTryClose: () => {
      if (hasChanges) setShowConfirmation(true);
      else onClose();
    },
    handleConfirmClose: () => {
      resetForm();
      setShowConfirmation(false);
      onClose();
    },
    handleCancelClose: () => setShowConfirmation(false),
    handleDelete: () => {
      if (confirm("Are you sure you want to delete this requirement?")) {
        onDelete(requirement.uuid);
        onClose();
      }
    },
  };
};
