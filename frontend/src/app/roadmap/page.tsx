"use client";

//React/Next imports
import { useMemo, useEffect, useState,  } from "react";
import { useRouter } from "next/navigation";
//contexts
import { useTasks } from "@/contexts/taskcontext";
import { useBugs } from "@/contexts/bugscontext";
import { useUserStories } from "@/contexts/saveduserstoriescontext";
import { useKanban } from "@/contexts/unifieddashboardcontext";
import { useRoadmapSuggestions } from "@/contexts/roadmapSuggestedContext";

import { Loader2 } from "lucide-react";
//components/subcomponents
import RoadmapTopBar from "./subcomponents/roadmaptopbar";
import RoadmapSelectorModal from "./subcomponents/roadmapselectormodal";
import NewRoadmapDialog from "./subcomponents/roadmapnewroadmapcreator";
import CustomRoadmapCanvas from "./components/roadmapcanvas";
import Navbar from "@/components/NavBar";
import SuggestedRoadmapsList from "./components/SuggestedRoadmaps/suggestedRoadmapList";
import RecentlyUsedRoadmaps from "./components/RecientlyUsedRoadmaps/recentlyUsedRoadmaps";

import { useSuggestedRoadmap } from "./hooks/useSuggestedRoadmaps";
import { useSuggestedRoadmapsList } from "./hooks/useSuggestedRoadmapsList";
import { useRoadmapManagementLogic } from "./hooks/useRoadmapManagementLogic";

import { RoadmapItem, RoadmapPhase } from "@/types/roadmap";
import { SuggestedPhase } from "./hooks/interfaces/useSuggestedRoadmapsProps";

import { roadmapPageStyles as styles } from "./styles/roadmapPageStyles";
import { isBug, isUserStory } from "@/types/taskkanban";


export default function CustomRoadmapPage() {
  const router = useRouter();
  const projectId = typeof window !== "undefined" ? localStorage.getItem("currentProjectId") || "" : "";
  const [currentTasks,setCurrentTasks] = useState<RoadmapItem[]>([])
  const [currentBugs,setCurrentBugs] = useState<RoadmapItem[]>([])
  const [currentUserStories,setCurrentUserStories] = useState<RoadmapItem[]>([])
  const [hasRefreshed,setHasRefreshed] = useState(false)
  const [addingToExisting, setAddingToExisting] = useState(false);
  const { getTasksForProject } = useTasks();
  const { getBugsForProject } = useBugs();
  const { getUserStoriesForProject } = useUserStories();
  const { refreshKanban } = useKanban();
  

  const {
    loading,
    canvasRef,
    availableData,
    currentRoadmap,
    savedRoadmaps,
    showRoadmapSelector,
    showNewRoadmapDialog,
    showTopBar,
    newRoadmapName,
    newRoadmapDescription,
    setShowTopBar,
    setShowRoadmapSelector,
    setShowNewRoadmapDialog,
    setNewRoadmapName,
    setNewRoadmapDescription,
    handleCreateNewRoadmap,
    handleLoadRoadmap,
    handleExportRoadmap,
    handleDuplicateRoadmap,
    handleSaveRoadmap,
    loadSavedRoadmaps,
    handleGoBackToStart,
    handleEditRoadmap,
    handleDeleteRoadmap
  } = useRoadmapManagementLogic({
    tasks: currentTasks,
    bugs: currentBugs,
    userStories: currentUserStories,
    projectId
  });

  const { 
    generateSuggestedRoadmap,
    suggestedRoadmaps,
    loading: loadingGenerativeError,
    error: generativeRoadmapError 
  } = useSuggestedRoadmap();
  
  const { 
    showSuggestions,
    isMinimized,
    showSuggestedRoadmaps,
    hideSuggestedRoadmaps,
    minimizeSuggestions,
    maximizeSuggestions,
  } = useSuggestedRoadmapsList();

  const {suggestions, setSuggestions} = useRoadmapSuggestions();
  const hasSuggestions = suggestions && suggestions.length > 0;
 
  useEffect(() => {
      const initialTasks = getTasksForProject(projectId);
      const initialBugs = getBugsForProject(projectId);
      const initialUserStories = getUserStoriesForProject(projectId);

      setCurrentTasks(initialTasks);
      setCurrentBugs(initialBugs);
      setCurrentUserStories(initialUserStories);
    }, [projectId]);

  useEffect(() => {
    const isEmpty = 
      (!currentTasks || currentTasks.length === 0) ||
      (!currentBugs || currentBugs.length === 0) ||
      (!currentUserStories || currentUserStories.length === 0);

    if (isEmpty && !hasRefreshed) {
      refreshKanban();

      setCurrentTasks(getTasksForProject(projectId));
      setCurrentBugs(getBugsForProject(projectId));
      setCurrentUserStories(getUserStoriesForProject(projectId));
      setHasRefreshed(true);
    }
  }, [currentTasks, currentBugs, currentUserStories, projectId, hasRefreshed]);

  const handleGenerateSuggestions  = async () => {
    const inputStories = currentUserStories.map(us => ({ id: us.id, title: us.title }));
    const phases = await generateSuggestedRoadmap(inputStories);
    setSuggestions(phases);
    showSuggestedRoadmaps();
  };

  const handleUseSelectedPhases = (
    selectedPhases: SuggestedPhase[], 
    selectedItems: { id: string; title: string }[]
  ) => {


    const convertToRoadmapPhase = (phase: SuggestedPhase, index: number): RoadmapPhase => {
     
      const phaseItemUUIDs = phase.user_stories.map(us => {
        const foundUserStory = currentUserStories.find(userStory => userStory.id === us.id);
        
        if (foundUserStory && isUserStory(foundUserStory)) {
          return foundUserStory.uuid;
        }  

        return us.id; 
      
      });


      return {
        id: crypto.randomUUID(),
        name: phase.name,
        description: phase.description || '',
        color: "#FFFFFF", 
        position: { x: 0, y: 0 },
        items: phaseItemUUIDs, 
        itemCount: phaseItemUUIDs.length,
      };
    };

    const selectedItemsWithUUIDs = selectedItems.map(item => {
      const foundUserStory = currentUserStories.find(us => us.id === item.id);
      
      if (foundUserStory && isUserStory(foundUserStory)) {
        return {
          id: foundUserStory.uuid, 
          title: item.title
        };
      }
      return item;
    });

    const selectedRoadmapItems: RoadmapItem[] = [];
  
    selectedItemsWithUUIDs.forEach(item => {
      
      const foundItem = currentUserStories.find(us => us.id === item.id || us.id === item.id) ||
                      currentTasks.find(task => task.id === item.id) ||
                      currentBugs.find(bug => bug.id === item.id);
      
      if (foundItem) {
        selectedRoadmapItems.push(foundItem);
        
        if (
          isUserStory(foundItem) && 
          foundItem.task_list && 
          Array.isArray(foundItem.task_list)
        ) 
        {
          
          foundItem.task_list.forEach(taskId => {
            const relatedTask = currentTasks.find(task => task.id === taskId);
            if (relatedTask) {
              selectedRoadmapItems.push(relatedTask);
            } 
          });

          const relatedBugs = currentBugs.filter((bug: RoadmapItem) => {
              if (isBug(bug))
              {
                const storyRelated = bug.userStoryRelated;
                return storyRelated === foundItem.id || 
                       storyRelated === foundItem.uuid;
              }
              else{
                return false;
              }
          });      

          if (relatedBugs.length > 0){
            relatedBugs.forEach(bug => {
              selectedRoadmapItems.push(bug);
             
            });
          }
        }
      }
    });

    const convertedPhases: RoadmapPhase[] = selectedPhases.map((phase, index) => 
      convertToRoadmapPhase(phase, index)
    );


    if (addingToExisting && currentRoadmap) {
      
      const updatedItems = [...currentRoadmap.items, ...selectedRoadmapItems];
      const updatedPhases = [...currentRoadmap.phases, ...convertedPhases];

      handleSaveRoadmap(updatedItems, currentRoadmap.connections, updatedPhases);
    } 
    else 
    {
      const roadmapName = `AI Suggested Dependency Map - ${new Date().toLocaleDateString()}`;
      const roadmapDescription = `Dependency Map generated from ${selectedPhases.length} AI-suggested phases`;

      setNewRoadmapName(roadmapName);
      setNewRoadmapDescription(roadmapDescription);

      setTimeout(() => {
        handleCreateNewRoadmap(selectedItems, convertedPhases);
      }, 0);
    }

    
    setAddingToExisting(false); 
  };

  useEffect(()=>{
    if (suggestedRoadmaps && !suggestions){
      setSuggestions(suggestedRoadmaps)
    }
  },[suggestions])

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      router.push("/login");
    } 

    if (availableData.length > 0 && projectId) {
      loadSavedRoadmaps();
    }
  }, [router]);


  useEffect(() => {
    if (availableData.length > 0 && projectId && !loading) {
      loadSavedRoadmaps();
    }
  }, [availableData.length, projectId]);
    

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading available data...</p>
        </div>
      </div>
    );
  }

  return (
  <>
    <Navbar projectSelected={true} />
    
    <div className={styles.container}>
      
      {/* Roadmap Selector Modal */}
      {showRoadmapSelector && (
        <RoadmapSelectorModal
          savedRoadmaps={savedRoadmaps}
          onClose={() => setShowRoadmapSelector(false)}
          onSelect={handleLoadRoadmap}
          onEdit={handleEditRoadmap}
          onDelete={handleDeleteRoadmap}
        />
      )}

      {/* New Roadmap Dialog */}
      {showNewRoadmapDialog && (
        <NewRoadmapDialog
          name={newRoadmapName}
          description={newRoadmapDescription}
          onNameChange={setNewRoadmapName}
          onDescriptionChange={setNewRoadmapDescription}
          onClose={() => setShowNewRoadmapDialog(false)}
          onCreate={handleCreateNewRoadmap}
        />
      )}

      {/* Collapsible Top Bar */}
      {showTopBar && currentRoadmap && (
        <RoadmapTopBar
          roadmap={currentRoadmap}
          onNew={() => setShowNewRoadmapDialog(true)}
          onLoad={() => setShowRoadmapSelector(true)}
          onExport={handleExportRoadmap}
          onDuplicate={handleDuplicateRoadmap}
          onHide={() => setShowTopBar(false)}
          onGoBack={handleGoBackToStart}
        />
      )}

      {/* Restore Top Bar Button */}
      {!showTopBar && (
        <button
          onClick={() => setShowTopBar(true)}
          className={styles.TopBarWrapper}
        >
          Show Header
        </button>
      )}

      {/* Canvas Section */}
      <div className={styles.canvasWrapper}>
        {currentRoadmap ? (
          <CustomRoadmapCanvas 
            ref={canvasRef}
            availableData={availableData}
            onSave={handleSaveRoadmap}
            currentRoadmap={currentRoadmap}
            key={currentRoadmap.id}
          />
        ) : (
          <div className={styles.emptyStateWrapper}>
            <div className="w-full min-h-screen mx-auto pt-6 pb-6">
              {/* Título y botones arriba */}
              <div className="flex flex-col items-center mb-12">
                <div className={styles.icon}>🗺️</div>
                <h3 className={styles.title}>Start Your Custom Dependency Map</h3>
                <p className={styles.subtitle}>
                  Create a new Dependency Map or load an existing one to start visualizing 
                  and planning your project in a structured way.
                </p>
                <div className={styles.buttonRow}>
                  <button 
                    onClick={() => setShowNewRoadmapDialog(true)}
                    className={styles.button}
                  >
                    Create New Dependency Map
                  </button>
                  <button 
                    onClick={() => setShowRoadmapSelector(true)}
                    className={styles.button}                
                  >
                    Load Existing
                  </button>
                  <button
                    onClick={handleGenerateSuggestions}
                    disabled={loadingGenerativeError || currentUserStories.length === 0}
                    className={`${styles.suggestButton} ${
                      loadingGenerativeError || currentUserStories.length === 0
                        ? styles.suggestButtonDisabled
                        : styles.suggestButtonEnabled
                    }`}
                  >
                    {loadingGenerativeError ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>Suggest Dependency Map</>
                    )}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="col-span-1 ">
                    <RecentlyUsedRoadmaps
                      roadmaps={savedRoadmaps}
                      onSelect={handleLoadRoadmap}
                      maxToShow={5}
                    />
                </div>
                <div className="shadow-lg col-span-1 md:col-span-2">
                    {(showSuggestions || hasSuggestions) ? (
                      <SuggestedRoadmapsList
                        suggestedRoadmaps={
                          (suggestions && suggestions.length > 0)
                            ? suggestions
                            : (suggestedRoadmaps && suggestedRoadmaps.length > 0)
                              ? suggestedRoadmaps
                              : []
                        }
                        onClose={hideSuggestedRoadmaps}
                        onSelectPhases={handleUseSelectedPhases}
                        loading={loadingGenerativeError}
                        error={generativeRoadmapError}
                        isMinimized={isMinimized}
                        onMinimize={minimizeSuggestions}
                        onMaximize={maximizeSuggestions}
                      />
                    ) : (
                      <div className="text-gray-500 text-center py-8">
                        No AI suggestions yet. Click "Suggest Dependency Map" to generate.
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </>
);
}