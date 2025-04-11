import React, { useState } from 'react';
import { Requirement } from '@/types/requirement';

type Props = {
  onSubmit: (r: Requirement) => void;
  onCancel: () => void;
  nextId: number;
};

const ManualRequirementForm = ({ onSubmit, onCancel, nextId }: Props) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Requirement['priority']>('Medium');
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

  const handleAdd = () => {
    const errs: typeof errors = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (!description.trim()) errs.description = 'Description is required';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    onSubmit({
      id: `REQ-${nextId.toString().padStart(3, '0')}`,
      idTitle: `REQ-${nextId.toString().padStart(3, '0')}`,
      title,
      description,
      priority,
    });
  };

  return (
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

      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="px-4 py-2 border rounded-md">Cancel</button>
        <button onClick={handleAdd} className="px-4 py-2 bg-[#4A2B4A] text-white rounded-md">Add</button>
      </div>
    </div>
  );
};

export default ManualRequirementForm;
