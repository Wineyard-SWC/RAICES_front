import { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";
import { SuggestedPhase } from "./interfaces/useSuggestedRoadmapsProps";
import type { RoadmapPhase, SavedRoadmap, RoadmapItem, RoadmapConnection } from "@/types/roadmap";
import type { UserStory } from "@/types/userstory";
import { isBug, isTask, isUserStory } from "@/types/taskkanban";
import { Task } from "@/types/task";
import { Bug } from "@/types/bug";

export function useRoadmapManagementLogic({ tasks, bugs, userStories }: {
  tasks: RoadmapItem[],
  bugs: RoadmapItem[],
  userStories: RoadmapItem[]
}) {
  const [loading, setLoading] = useState(true);
  const [availableData, setAvailableData] = useState<RoadmapItem[]>([]);
  const [savedRoadmaps, setSavedRoadmaps] = useState<SavedRoadmap[]>([]);
  const [currentRoadmap, setCurrentRoadmap] = useState<SavedRoadmap | null>(null);
  const [saving, setSaving] = useState(false);

  const [showRoadmapSelector, setShowRoadmapSelector] = useState(false);
  const [showNewRoadmapDialog, setShowNewRoadmapDialog] = useState(false);
  const [newRoadmapName, setNewRoadmapName] = useState('');
  const [newRoadmapDescription, setNewRoadmapDescription] = useState('');
  const [showTopBar, setShowTopBar] = useState(true);

  const canvasRef = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    const allAvailableData = [
        ...tasks.map(t => ({ ...t })),
        ...bugs.map(b => ({ ...b })),
        ...userStories.map(u => ({ ...u })),
    ];

    const newData = JSON.stringify(allAvailableData);
    const prevData = JSON.stringify(availableData);

    if (newData !== prevData) {
        setAvailableData(allAvailableData);
    }

    setLoading(false);
  }, [tasks, bugs, userStories]);

  const loadSavedRoadmaps = () => {
    const SavedRoadmaps: SavedRoadmap[] = [ ];
    setSavedRoadmaps(SavedRoadmaps);
  };

  const handleCreateNewRoadmap = (
    initialItems: {id:string,title:string}[] = [],
    initialPhases: RoadmapPhase[] = []
  ) => {
    
    let fullItems: RoadmapItem[] = []

    if (initialItems && initialItems.length > 0) {
      
      const baseItems: RoadmapItem[] = initialItems.map(item => {
        const foundItem = availableData.find(availableItem => availableItem.id === item.id);
        if (!foundItem) {
          const stub: UserStory = { 
            id: item.id,
            uuid: item.id, 
            assigned_epic: '',
            idTitle: '',
            title: item.title, 
            description: '',
            status_khanban: 'To Do',
            priority: 'Medium',
            acceptanceCriteria: [],
            points: 0,
            task_list: [],
            assigned_sprint: '',
            assignee: [],
            comments: [],
          };
          return stub as RoadmapItem;
        }
        return foundItem;
      });

      const allItems: RoadmapItem[] = [...baseItems];
      
      baseItems.forEach(item => {
        
        if (isUserStory(item) && 
            item.task_list && 
            Array.isArray(item.task_list) && 
            item.task_list.length > 0) {
          
          
          item.task_list.forEach(taskId => {
            const relatedTask = availableData.find(dataItem => dataItem.id === taskId);
            if (relatedTask && !allItems.find(existing => existing.id === relatedTask.id)) {
              allItems.push(relatedTask);
            } 
          });
        
                
          const relatedBugs = availableData.filter((dataItem: RoadmapItem) => {
            if (!isBug(dataItem)) return false;
            
            const hasStoryRelation = dataItem.userStoryRelated;
            if (!hasStoryRelation) return false;
            
            const isRelated = (
              hasStoryRelation === item.id || 
              hasStoryRelation === item.uuid ||
              hasStoryRelation === item.idTitle
            );
          
            return isRelated;
          });
          
          relatedBugs.forEach(bug => {
            if (!allItems.find(existing => existing.id === bug.id)) {
              allItems.push(bug);
            }
          });
        }

      });

      const uniqueItems = allItems.filter((item, index, self) =>
        index === self.findIndex(t => t.id === item.id)
      );

      fullItems = uniqueItems;
    
    }

    let fullPhases: RoadmapPhase[] = [];

    if (initialPhases && initialPhases.length > 0) {
      
      fullPhases = initialPhases.map((phase, index) => {
        const originalItems = phase.items || [];
        const allPhaseItemIds: string[] = [];
        
        
        allPhaseItemIds.push(...originalItems);
        
        originalItems.forEach(itemId => {

          const userStoryItem = fullItems.find(item => {
            if (!isUserStory(item)) return false;
            
            const userStory = item as UserStory;
            const foundByUUID = userStory.uuid === itemId;
            const foundById = userStory.id === itemId;
          
            return foundByUUID || foundById;
          }) as UserStory;

          if (userStoryItem) {
            const relatedTasks = fullItems.filter(item => {
              if (!isTask(item)) return false;
              
              const task = item as Task; 
              const isRelated = task.user_story_id === userStoryItem.uuid;
            
              return isRelated;
            });

            const relatedBugs = fullItems.filter(item => {
                if (!isBug(item)) return false;
                
                const bug = item as Bug;
                const isRelated = (
                  bug.userStoryRelated === userStoryItem.id ||
                  bug.userStoryRelated === userStoryItem.uuid ||
                  bug.userStoryRelated === userStoryItem.idTitle
                );
                
                return isRelated;
            }); 
            
            relatedTasks.forEach(task => {
              if (!allPhaseItemIds.includes(task.id)) {
                allPhaseItemIds.push(task.id);
              }
            });

            relatedBugs.forEach(bug => {
              if (!allPhaseItemIds.includes(bug.id)) {
                allPhaseItemIds.push(bug.id);
              }
            });
          }

        });
        
        const updatedPhase = {
          ...phase,
          position: { x: 0, y: 0 },
          items: allPhaseItemIds,
          itemCount: allPhaseItemIds.length,
        };
      
        return updatedPhase;
      });
      
    }

    const roadmapName = newRoadmapName.trim() || `Roadmap ${Date.now()}`;

    const newRoadmap: SavedRoadmap = {
      id: `roadmap-${Date.now()}`,
      name: roadmapName,
      description: newRoadmapDescription.trim() || undefined,
      items: fullItems,
      connections: [],
      phases: fullPhases,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSavedRoadmaps(prev => [...prev, newRoadmap]);
    setCurrentRoadmap(newRoadmap);
    setNewRoadmapName('');
    setNewRoadmapDescription('');
    setShowNewRoadmapDialog(false);
    
  };

  useEffect(() => {
    console.log('🔍 Current roadmap changed:', currentRoadmap);
  }, [currentRoadmap]);
  

  const handleUpdateExistingRoadmap = (
    additionalItems: RoadmapItem[],
    additionalPhases: RoadmapPhase[]
  ) => {
    if (!currentRoadmap) return;

    const existingItemIds = currentRoadmap.items.map(item => item.id);
    const uniqueNewItems = additionalItems.filter(item => !existingItemIds.includes(item.id));

    const updatedRoadmap: SavedRoadmap = {
      ...currentRoadmap,
      items: [...currentRoadmap.items, ...uniqueNewItems],
      phases: [...currentRoadmap.phases, ...additionalPhases],
      updatedAt: new Date().toISOString(),
    };

    setSavedRoadmaps(prev =>
      prev.map(r => r.id === updatedRoadmap.id ? updatedRoadmap : r)
    );
    setCurrentRoadmap(updatedRoadmap);
  };

  const handleLoadRoadmap = (roadmap: SavedRoadmap) => {
    setCurrentRoadmap(roadmap);
    setShowRoadmapSelector(false);
  };

  const handleSaveRoadmap = async (
    items: RoadmapItem[],
    connections: RoadmapConnection[],
    phases: RoadmapPhase[]
  ) => {
    if (!currentRoadmap) return;

    setSaving(true);
    try {
      const updatedRoadmap: SavedRoadmap = {
        ...currentRoadmap,
        items,
        connections,
        phases,
        updatedAt: new Date().toISOString(),
      };

      setSavedRoadmaps(prev =>
        prev.map(r => r.id === updatedRoadmap.id ? updatedRoadmap : r)
      );
      setCurrentRoadmap(updatedRoadmap);
    } catch (err) {
      console.error("Error saving roadmap:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleExportRoadmap = async () => {
    if (!canvasRef.current) return;

    try {
      const bounds = canvasRef.current.getBoundingClientRect();
      const dataUrl = await toPng(canvasRef.current, { pixelRatio: 2, cacheBust: true });
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [bounds.width, bounds.height],
      });
      pdf.addImage(dataUrl, 'PNG', 0, 0, bounds.width, bounds.height);
      pdf.save(`${currentRoadmap?.name || 'roadmap'}.pdf`);
    } catch (err) {
      console.error("Error exporting roadmap:", err);
    }
  };

  const handleDuplicateRoadmap = () => {
    if (!currentRoadmap) return;

    const duplicated = {
      ...currentRoadmap,
      id: `roadmap-${Date.now()}`,
      name: `${currentRoadmap.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSavedRoadmaps(prev => [...prev, duplicated]);
    setCurrentRoadmap(duplicated);
  };

  const handleGoBackToStart = () => {
    setCurrentRoadmap(null);
  };

  return {
    loading,
    canvasRef,
    availableData,
    savedRoadmaps,
    currentRoadmap,
    saving,
    showRoadmapSelector,
    showNewRoadmapDialog,
    newRoadmapName,
    newRoadmapDescription,
    showTopBar,
    setShowTopBar,
    setShowRoadmapSelector,
    setShowNewRoadmapDialog,
    setNewRoadmapName,
    setNewRoadmapDescription,
    handleCreateNewRoadmap,
    handleLoadRoadmap,
    handleSaveRoadmap,
    handleExportRoadmap,
    handleDuplicateRoadmap,
    loadSavedRoadmaps,
    handleGoBackToStart,
    handleUpdateExistingRoadmap,
  };
}
