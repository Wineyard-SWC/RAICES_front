import React, { useState } from 'react';
import { Epic } from '@/types/epic';
import { createPortal } from 'react-dom';
import { v4 as uuidv4} from 'uuid'

type Requirement = {
  idTitle: string;
  title: string;
  description: string;
  uuid: string;
};

type Props = {
  onSubmit: (e: Epic) => void;
  onCancel: () => void;
  nextId: number;
  availableRequirements: Requirement[];
};

const ManualEpicForm = ({ onSubmit, onCancel, nextId, availableRequirements }: Props) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedReqs, setSelectedReqs] = useState<Requirement[]>([]);
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});


  const handleAdd = () => {
    const errs: typeof errors = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (!description.trim()) errs.description = 'Description is required';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    
    onSubmit({
      uuid: uuidv4(),
      id: `EPIC-${nextId.toString().padStart(3, '0')}`,
      idTitle: `EPIC-${nextId.toString().padStart(3, '0')}`,
      title,
      description,
      relatedRequirements: selectedReqs,
    });
  };

  const handleAddRequirement = (uuid: string) => {
    const req = availableRequirements.find(r => r.uuid === uuid);
    if (req && !selectedReqs.some(r => r.uuid === uuid)) {
      setSelectedReqs(prev => [...prev, req]);
    }
  };

  const handleRemoveRequirement = (uuid: string) => {
    setSelectedReqs(prev => prev.filter(r => r.uuid !== uuid));
  };

  const modalContent = (
    <div className="space-y-4">
      <input
        placeholder="Epic title"
        className="bg-white w-full border p-2 rounded-md"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}

      <textarea
        placeholder="Epic description"
        className="bg-white w-full border p-2 rounded-md resize-none min-h-[120px]"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}

      <label htmlFor="requirementSelect" className="block text-sm font-medium">Related Requirements</label>
      <div className="space-y-2">
        {selectedReqs.map((req) => (
          <div key={req.uuid} className="flex items-center gap-2">
            <span className="flex-1 bg-gray-100 px-2 py-1 rounded-md text-sm">
              {req.idTitle} - {req.title}
            </span>
            <button
              className="text-red-500 hover:underline text-sm"
              onClick={() => handleRemoveRequirement(req.uuid)}
            >
              ✕
            </button>
          </div>
        ))}

        <select
          aria-label="Select a requirement to add"
          className="bg-white border p-2 rounded-md w-full"
          onChange={(e) => {
            handleAddRequirement(e.target.value);
            e.target.value = '';
          }}
        >
          <option value="">+ Add another requirement</option>
          {availableRequirements
            .filter(req => !selectedReqs.some(s => s.uuid === req.uuid))
            .map((req) => (
              <option key={req.uuid} value={req.uuid}>
                {req.idTitle} - {req.title}
              </option>
            ))}
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

export default ManualEpicForm;
