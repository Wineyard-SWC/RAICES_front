import { useState, useEffect, useRef} from 'react';
import { Epic } from '@/types/epic';
import { UserStory } from '@/types/userstory';
import { useGenerateUserStories } from '@/hooks/useGenerateUserStories';
import { parseUserStoriesFromAPI } from '@/utils/parseUserStoriesFromApi';
import { groupUserStoriesByEpic } from '@/utils/groupUserStoriesByEpic';
import { useUserStoryContext } from '@/contexts/userstorycontext';
import { useEpicContext } from '@/contexts/epiccontext';
import { useSelectedEpicsContext } from '@/contexts/selectedepics';
import { useSelectedUserStoriesContext } from '@/contexts/selecteduserstories';
import { postUserStories } from '@/utils/postUserStories';
import { getProjectEpics } from '@/utils/getProjectEpics';
import { reorderUserStoryIds } from '../utils/reorderUserStoryIds';

export const useGenerateUserStoriesLogic = () => {
  const [epicDescription, setEpicDescription] = useState('');
  const [editMode, setEditMode] = useState(false);
  const { userStories, setUserStories } = useUserStoryContext();
  const { epics, setEpics } = useEpicContext();
  const { selectedEpicIds, setSelectedEpicIds } = useSelectedEpicsContext();
  const { selectedUserStoriesIds, setSelectedUserStoriesIds } = useSelectedUserStoriesContext();
  const selectedProject = localStorage.getItem("currentProjectId");
  
  const shouldRestoreAssignments = useRef(false);
  const previousAssignmentsRef = useRef<Record<string, string>>({});
  const selectedEpics = epics.filter(epic => selectedEpicIds.includes(epic.uuid));

  const {
    generate,
    isLoading,
    generatedOutput,
    error
  } = useGenerateUserStories();

  useEffect(() => {
    if (generatedOutput && generatedOutput?.content && userStories.length === 0) {
      const parsed = parseUserStoriesFromAPI(generatedOutput);
      setUserStories(parsed);
    }
  }, [generatedOutput]);

  const groupEpicsForAPI = (epics: Epic[]) => ({
    content: epics.map((epic) => ({
      uuid: epic.uuid || '',
      id: epic.idTitle || epic.id,
      title: epic.title,
      description: epic.description,
      related_requirements: (epic.relatedRequirements || []).map(req => ({
        id: req.idTitle|| '',
        description: req.description || ''
      }))
    }))
  });

  const handleGenerate = () => {
    setUserStories([]);
    setSelectedUserStoriesIds([]);
    const grouped = groupEpicsForAPI(selectedEpics);
    if (selectedEpics.length === 0) return;
    generate(grouped);
  };

  const handleUpdateStory = (updated: UserStory) => {
    setUserStories(prev => {
      const withoutOld = prev.filter(s => s.uuid !== updated.uuid);
      return [...withoutOld, updated];
    });
  };

  const handleSelectAll = () => {
    const allUserStoryIds = userStories.map(story => story.uuid);
    setSelectedUserStoriesIds(allUserStoryIds);
  };

  const handleClear = () => {
    setEpics([]);
    setUserStories([]);
    setSelectedEpicIds([]);
    setSelectedUserStoriesIds([]);
  };

  const handleSave = async () => {
    try {

      const selected = userStories.filter(
        (story) => 
          selectedUserStoriesIds.includes(story.uuid) && 
          story.assigned_epic !== 'UNASSIGNED' 
      );
      
      const cleaned = selected.map(s => ({
        uuid: s.uuid,
        idTitle: s.idTitle,
        title: s.title,
        description: s.description,
        priority: s.priority,
        points: s.points,
        acceptance_criteria: s.acceptance_criteria,
        assigned_epic: s.assigned_epic
      }));
      await postUserStories(cleaned, selectedProject!);
    } catch (err) {
      console.error('Error while saving user stories:');
    }
  };

  const handleImportEpics = async () => {
    try {
      const importedEpics = await getProjectEpics(selectedProject!);
      const epicsWithReqs = importedEpics.map(epic => ({
        ...epic,
        relatedRequirements: epic.relatedRequirements.map(r => ({
          idTitle: r.idTitle,
          title: r.title,
          description: r.description,
          uuid: r.uuid
        }))
      }));
      setEpics(epicsWithReqs);
      setSelectedEpicIds(epicsWithReqs.map(e => e.uuid));
      shouldRestoreAssignments.current = true;
    } catch (err) {
      console.error("Error while importing epics and requirements:");
    }
  };

  useEffect(() => {
    if (!shouldRestoreAssignments.current) return;
  
    const updatedStories: UserStory[] = [];
  
    userStories.forEach((story) => {
      if (
        story.assigned_epic === 'UNASSIGNED' &&
        previousAssignmentsRef.current[story.uuid] &&
        epics.some(epic => epic.idTitle === previousAssignmentsRef.current[story.uuid])
      ) {
        updatedStories.push({
          ...story,
          assigned_epic: previousAssignmentsRef.current[story.uuid]
        });
      } else {
        updatedStories.push(story);
      }
    });
  
    if (updatedStories.length !== userStories.length) {
      setUserStories(updatedStories);
    }
  
    shouldRestoreAssignments.current = false;
  }, [epics, selectedEpicIds]);
  

  const handleDeleteStory = (storyUuid: string) => {
    const updated = userStories.filter(story => story.uuid !== storyUuid);
    const reordered = reorderUserStoryIds(updated);
    setUserStories(reordered);
    setSelectedUserStoriesIds(prev => prev.filter(uuid => uuid !== storyUuid));
  };

  return {
    epicDescription,
    setEpicDescription,
    editMode,
    setEditMode,
    handleGenerate,
    handleUpdateStory,
    handleSelectAll,
    handleSave,
    handleImportEpics,
    handleDeleteStory,
    handleClear,
    selectedEpics,
    selectedEpicIds,
    userStories,
    groupedByEpic: groupUserStoriesByEpic([...userStories]),
    error,
    isLoading,
    allEpicOptions: epics.map(e => ({ uuid: e.uuid, id: e.idTitle, title: e.title }))
  };
};
