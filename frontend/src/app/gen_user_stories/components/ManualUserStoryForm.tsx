import React, { useState, useEffect } from 'react';
import { UserStory, AcceptanceCriteriaData } from '@/types/userstory';
import { createPortal } from 'react-dom';
import { v4 as uuid4} from 'uuid';
import { useUser } from '@/contexts/usercontext';


type Props = {
  onSubmit: (s: UserStory) => void;
  onCancel: () => void;
  nextId: number;
  availableEpics: { uuid: string; title: string; idTitle: string }[];
};

const ManualUserStoryForm = ({ onSubmit, onCancel, nextId, availableEpics }: Props) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<UserStory['priority']>('Medium');
  const [epic, setEpic] = useState(availableEpics[0]?.idTitle ?? '');
  const [criteria, setCriteria] = useState<string[]>(['']);
  const [points, setPoints] = useState<number>(0);
  const [errors, setErrors] = useState<{ 
    criteria?: string; 
    title?: string; 
    description?: string;
    points?: string;
  }>({});
  const {userData} = useUser()

  useEffect(() => {
    if (!epic && availableEpics.length > 0) {
      setEpic(availableEpics[0].uuid);
    }
  }, [availableEpics]);

  const getUserInfo = (): [string, string] => {
    const userId = localStorage.getItem("userId") || "RAICES_IA";
    const userName = userData?.name || "RAICES_IA";
    return [userId, userName];
  };

  const handleAdd = () => {
    const errs: typeof errors = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (!description.trim()) errs.description = 'Description is required';
    if (criteria.some(c => !c.trim())) errs.criteria = 'All criteria fields must be filled';
    if (isNaN(points) || points < 0) errs.points = 'Points must be a positive number';
    
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const userInfo = getUserInfo();
    const now = new Date().toISOString();
    
    const acceptanceCriteria: AcceptanceCriteriaData[] = criteria
      .filter(c => c.trim())
      .map(description => ({
        id: uuid4(),
        description,
        date_completed: '',
        date_created: now,
        date_modified: now,
        finished_by: ['', ''],
        created_by: userInfo,
        modified_by: userInfo
      }));

    onSubmit({
      uuid: uuid4(),
      id: `US-${nextId.toString().padStart(3, '0')}`,
      idTitle: `US-${nextId.toString().padStart(3, '0')}`,
      title,
      description,
      priority,
      acceptanceCriteria,
      assigned_epic: epic,
      points,
      completed_acceptanceCriteria: 0,
      total_acceptanceCriteria: acceptanceCriteria.length
    });
  };

  const modalContent = (
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

      <div>
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
      </div>

      <div>
        <label htmlFor="pointsInput" className="text-sm font-medium text-black">Story Points</label>
        <input
          id="pointsInput"
          type="number"
          min="0"
          className="bg-white w-full border p-2 rounded-md"
          value={points}
          onChange={(e) => setPoints(Number(e.target.value))}
        />
        {errors.points && <p className="text-sm text-red-500">{errors.points}</p>}
      </div>

      <div>
        <label className="text-sm font-medium text-black">Epic</label>
        <select
          aria-label="Edit epic relationship"
          className="bg-white w-full border p-2 rounded-md"
          value={epic}
          onChange={(e) => setEpic(e.target.value)}
        >
          {availableEpics.map((e) => (
            <option key={e.uuid} value={e.idTitle}>
              {e.idTitle} - {e.title}
            </option>
          ))}
        </select>
      </div>

      <div>
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
                placeholder="Enter acceptance criteria"
              />
              <button
                type="button"
                className="text-red-500 hover:underline"
                onClick={() => {
                  if (criteria.length > 1) {
                    setCriteria(criteria.filter((_, idx) => idx !== i));
                  }
                }}
                disabled={criteria.length <= 1}
              >
                ✕
              </button>
            </div>
          ))}
          {errors.criteria && <p className="text-sm text-red-500">{errors.criteria}</p>}
          <button
            type="button"
            className="text-sm text-[#4A2B4A] underline"
            onClick={() => setCriteria([...criteria, ''])}
          >
            + Add another criterion
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button 
          onClick={onCancel} 
          className="px-4 py-2 border rounded-md"
          type="button"
        >
          Cancel
        </button>
        <button 
          onClick={handleAdd} 
          className="px-4 py-2 bg-[#4A2B4A] text-white rounded-md"
          type="button"
        >
          Add
        </button>
      </div>
    </div>
  );


  return modalContent

};

export default ManualUserStoryForm;