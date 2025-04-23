import { createPortal } from 'react-dom';
import React, { useState } from 'react';
import { Requirement } from '@/types/requirement';
import { v4 as uuidv4 } from 'uuid';

import { generateNextRequirementId } from '@/app/gen_epics/utils/relatedRequirementCategory';
import { useRequirementContext } from '@/contexts/requirementcontext';

type Props = {
  onSubmit: (r: Requirement) => void;
  onCancel: () => void;
};

const ManualRequirementForm = ({ onSubmit, onCancel }: Props) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Requirement['priority']>('Medium');
  const [category, setCategory] = useState<Requirement['category']>('Funcional');
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});
  const { requirements } = useRequirementContext();

  const handleAdd = () => {
    const errs: typeof errors = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (!description.trim()) errs.description = 'Description is required';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const newId = generateNextRequirementId(requirements, category as 'Funcional' | 'No Funcional');

    onSubmit({
      id: newId,
      uuid: uuidv4(),
      idTitle: newId,
      title,
      description,
      priority,
      category,
    });
  };

  const modalContent = (
    <div className="space-y-4">
      <input
        placeholder="Requirement title"
        className="bg-white w-full border p-2 rounded-md"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}

      <textarea
        placeholder="Requirement description"
        className="bg-white w-full border p-2 rounded-md resize-none min-h-[120px]"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}

      <label htmlFor="prioritySelect" className="text-sm font-medium text-black">Priority</label>
      <select
        id="prioritySelect"
        className="bg-white w-full border p-2 rounded-md"
        value={priority}
        onChange={(e) => setPriority(e.target.value as Requirement['priority'])}
      >
        <option>High</option>
        <option>Medium</option>
        <option>Low</option>
      </select>

      <div className="space-y-1">
        <label htmlFor="categorySelect" className="text-sm font-medium text-black">Category</label>
          <select
          id="categorySelect"
          value={category}
          onChange={(e) => setCategory(e.target.value as Requirement['category'])}
          className="w-full border border-gray-300 bg-white rounded-md p-2"
          required
        >
          <option value="Funcional">Functional</option>
          <option value="No Funcional">Non Functional</option>
          </select>
      </div>

      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="px-4 py-2 border rounded-md">Cancel</button>
        <button onClick={handleAdd} className="px-4 py-2 bg-[#4A2B4A] text-white rounded-md">Add</button>
      </div>
    </div>
  );

  return modalContent
};

export default ManualRequirementForm;
