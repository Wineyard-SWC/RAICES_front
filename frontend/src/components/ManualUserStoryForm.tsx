import React, { useState } from 'react';
import { UserStory } from '@/types/userstory';

type Props = {
  onSubmit: (s: UserStory) => void;
  onCancel: () => void;
  nextId: number;
  availableEpics: string[];
};

const ManualUserStoryForm = ({ onSubmit, onCancel, nextId, availableEpics }: Props) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<UserStory['priority']>('Medium');
  const [epic, setEpic] = useState(availableEpics[0] ?? '');
  const [criteria, setCriteria] = useState<string[]>(['']);
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

  const handleAdd = () => {
    const errs: typeof errors = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (!description.trim()) errs.description = 'Description is required';
    if (criteria.some(c => !c.trim())) {
      alert('Please complete or remove empty acceptance criteria');
      return;
    }
    setErrors(errs);
    if (Object.keys(errs).length) return;

    onSubmit({
      id: `US-${nextId.toString().padStart(3, '0')}`,
      idTitle: `US-${nextId.toString().padStart(3, '0')}`,
      title,
      description,
      priority,
      acceptance_criteria: criteria,
      assigned_epic: epic,
      points: 0,
    });
  };

  return (
    <div className="space-y-4">
      <input
        placeholder="User Story title"
        className="bg-white w-full border p-2 rounded-md"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}

      <textarea
        placeholder="User Story description"
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
        onChange={(e) => setPriority(e.target.value as UserStory['priority'])}
      >
        <option>High</option>
        <option>Medium</option>
        <option>Low</option>
      </select>

      <label className="text-sm font-medium text-black">Epic</label>
      <select
        aria-label="Edit epic relationship"
        className="bg-white w-full border p-2 rounded-md"
        value={epic}
        onChange={(e) => setEpic(e.target.value)}
      >
        {availableEpics.map((e) => (
          <option key={e} value={e}>
            {e}
          </option>
        ))}
      </select>

      <label className="block text-sm font-medium">Acceptance Criteria</label>
      <div className="space-y-2">
        {criteria.map((c, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              aria-label="Add acceptance criteria"
              className="bg-white flex-1 border p-2 rounded-md"
              value={c}
              onChange={(e) => {
                const copy = [...criteria];
                copy[i] = e.target.value;
                setCriteria(copy);
              }}
            />
            <button
              className="text-red-500 hover:underline"
              onClick={() => setCriteria(criteria.filter((_, idx) => idx !== i))}
            >
              ✕
            </button>
          </div>
        ))}
        <button
          className="text-sm text-[#4A2B4A] underline"
          onClick={() => setCriteria([...criteria, ''])}
        >
          + Add another criterion
        </button>
      </div>

      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="px-4 py-2 border rounded-md">Cancel</button>
        <button onClick={handleAdd} className="px-4 py-2 bg-[#4A2B4A] text-white rounded-md">Add</button>
      </div>
    </div>
  );
};

export default ManualUserStoryForm;