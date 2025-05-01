import { useCallback, useEffect, useState } from 'react';
import { v4 as uuid4 } from 'uuid';
import { Epic } from '@/types/epic';
import { Requirement } from '@/types/requirement';
import { useRequirementContext } from '@/contexts/requirementcontext';
import { normalizeRequirementsCategory, generateNextRequirementId } from '../utils/relatedRequirementCategory';
import { reorderRequirementIds } from '../utils/reorderRequirements';

type EditableRequirement = Requirement & {
  originalIdTitleByCategory?: Partial<Record<'Funcional' | 'No Funcional', string>>;
};

export const useEpicEditLogic = (
  epic: Pick<Epic, 'uuid' | 'id' | 'idTitle' | 'title' | 'description' | 'relatedRequirements'>,
  allRequirements?: Requirement[],
  onAddNewRequirement?: (r: Requirement) => void
) => {
  const [title, setTitle] = useState(epic.title);
  const [description, setDescription] = useState(epic.description);
  const [relatedRequirements, setRelatedRequirements] = useState<EditableRequirement[]>([]);
  const [deletedRequirementIds, setDeletedRequirementIds] = useState<string[]>([]);
  const [newRequirementUuids, setNewRequirementUuids] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Requirement[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    relatedRequirements?: string[];
  }>({});

  const { setRequirements } = useRequirementContext();

  const areRequirementsEqual = useCallback((req1: any[], req2: any[]) => {
    if (req1.length !== req2.length) return false;
    for (let i = 0; i < req1.length; i++) {
      if (req1[i].title !== req2[i].title || req1[i].description !== req2[i].description || req1[i].category !== req2[i].category) {
        return false;
      }
    }
    return true;
  }, []);

  useEffect(() => {
    const cleaned = relatedRequirements.filter(
      r => r.title.trim() !== '' && r.description.trim() !== '' && !deletedRequirementIds.includes(r.uuid)
    );
    const originalNormalized = normalizeRequirementsCategory(epic.relatedRequirements);
    const changed = epic.title !== title || epic.description !== description || !areRequirementsEqual(originalNormalized, cleaned);
    setHasChanges(changed);
  }, [title, description, relatedRequirements, deletedRequirementIds, epic, areRequirementsEqual]);

  useEffect(() => {
    setTitle(epic.title);
    setDescription(epic.description);
    setRelatedRequirements(normalizeRequirementsCategory(epic.relatedRequirements) as EditableRequirement[]);
  }, [epic]);

  useEffect(() => {
    if (!searchTerm || !allRequirements) {
      setSearchResults([]);
      return;
    }
    const results = allRequirements.filter(req =>
      req.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !relatedRequirements.some(r => r.uuid === req.uuid) &&
      !deletedRequirementIds.includes(req.uuid)
    );
    setSearchResults(results);
  }, [searchTerm, allRequirements, relatedRequirements, deletedRequirementIds]);

  const handleRequirementChange = (index: number, field: keyof Requirement, value: string) => {
    const original = relatedRequirements[index];
    const updatedReq = { ...original } as EditableRequirement;

    if (field === 'category') {
      const newCat = value as 'Funcional' | 'No Funcional';
      const prevCat = original.category as 'Funcional' | 'No Funcional';
      updatedReq.originalIdTitleByCategory ??= {};
      updatedReq.originalIdTitleByCategory[prevCat] ??= updatedReq.idTitle;
      const existingId = updatedReq.originalIdTitleByCategory[newCat];
      const newId = existingId || generateNextRequirementId(allRequirements || [], newCat);
      updatedReq.category = newCat;
      updatedReq.id = newId;
      updatedReq.idTitle = newId;
      updatedReq.originalIdTitleByCategory[newCat] = newId;
    } else {
      (updatedReq as any)[field] = value;
    }

    const updatedList = [...relatedRequirements];
    updatedList[index] = updatedReq;
    setRelatedRequirements(updatedList);
  };

  const handleAddRequirement = () => {
    const category: Requirement['category'] = 'Funcional';
    const newUuid = uuid4();
    const newId = generateNextRequirementId(allRequirements || [], category);

    const newReq: EditableRequirement = {
      id: newId,
      idTitle: newId,
      title: '',
      description: '',
      priority: 'Medium',
      category,
      uuid: newUuid,
      epicRef: epic.idTitle,
      originalIdTitleByCategory: { [category]: newId }
    };

    setRelatedRequirements(prev => [...prev, newReq]);
    setNewRequirementUuids(prev => [...prev, newUuid]);
  };

  const handleAddExistingRequirement = (req: Requirement) => {
    const editableReq: EditableRequirement = {
      ...req,
      id: req.id || req.idTitle,
      priority: req.priority || 'Medium',
      originalIdTitleByCategory: { [req.category as 'Funcional' | 'No Funcional']: req.idTitle }
    };

    setRelatedRequirements(prev => [...prev, editableReq]);
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleRemoveRequirement = (index: number) => {
    const req = relatedRequirements[index];
    const updated = [...relatedRequirements];
    updated.splice(index, 1);
    setRelatedRequirements(updated);
    if (req.uuid) setDeletedRequirementIds(prev => [...prev, req.uuid]);
  };

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

    const reqErrors: string[] = [];
    relatedRequirements.forEach((req, i) => {
      if (!req.title.trim() || !req.description.trim()) {
        reqErrors[i] = 'Title and description cannot be empty';
        valid = false;
      }
    });

    if (reqErrors.length) newErrors.relatedRequirements = reqErrors;
    setErrors(newErrors);
    return valid;
  };

  const handleSave = (onSave: (epic: Epic) => void, onClose: () => void) => {
    if (!validateForm()) return;

    const validNewRequirements = relatedRequirements.filter(
      r => newRequirementUuids.includes(r.uuid) && r.title && r.description
    );

    if (onAddNewRequirement) {
      validNewRequirements.forEach(req =>
        onAddNewRequirement({
          id: req.idTitle,
          idTitle: req.idTitle,
          title: req.title,
          description: req.description,
          priority: 'Medium',
          category: req.category,
          uuid: req.uuid,
          epicRef: epic.idTitle
        })
      );
    }

    setRequirements(prev => reorderRequirementIds(prev));

    const filtered = relatedRequirements.filter(
      r => r.title && r.description && !deletedRequirementIds.includes(r.uuid)
    );

    onSave({
      uuid: epic.uuid,
      id: epic.id,
      idTitle: epic.idTitle,
      title,
      description,
      relatedRequirements: filtered
    });

    onClose();
  };

  const resetForm = () => {
    setTitle(epic.title);
    setDescription(epic.description);
    setRelatedRequirements(
      normalizeRequirementsCategory(epic.relatedRequirements).map((req) => ({
        ...req,
        id: req.idTitle,
        priority: 'Medium',
        originalIdTitleByCategory: { [req.category]: req.idTitle }
      }))
    );
    setNewRequirementUuids([]);
    setDeletedRequirementIds([]);
    setErrors({});
  };

  return {
    title,
    description,
    relatedRequirements,
    searchResults,
    searchTerm,
    errors,
    hasChanges,
    showConfirmation,
    setTitle,
    setDescription,
    setSearchTerm,
    setShowConfirmation,
    handleRequirementChange,
    handleAddRequirement,
    handleAddExistingRequirement,
    handleRemoveRequirement,
    handleSave,
    resetForm
  };
};
