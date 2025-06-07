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

import { Loader2, Map, Plus, FolderOpen, Sparkles, Bot } from "lucide-react";
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
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Loading available data...</p>
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
            {/* Header Section */}
            <div className={styles.headerSection}>
              <div className={styles.iconWrapper}>
                <Map className="w-8 h-8 text-[#4A2B4A]" />
              </div>
              <h1 className={styles.title}>Dependency Map</h1>
              <p className={styles.subtitle}>
                Create visual dependency maps to understand project relationships and plan your development workflow. 
                Start by creating a new map, loading an existing one, or generate AI-powered suggestions.
              </p>
              
              {/* Action Buttons */}
              <div className={styles.buttonRow}>
                <button 
                  onClick={() => setShowNewRoadmapDialog(true)}
                  className={styles.button}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create New Map
                </button>
                <button 
                  onClick={() => setShowRoadmapSelector(true)}
                  className={styles.secondaryButton}                
                >
                  <FolderOpen className="w-5 h-5 mr-2" />
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
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Bot className="w-5 h-5 mr-2" />
                      AI Generate
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className={styles.divider}></div>

            {/* Content Grid */}
            <div className={styles.contentGrid}>
              {/* Recent Maps */}
              <div className={styles.recentMapsSection}>
                <div className={styles.sectionCard}>
                  <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionHeaderTitle}>
                      Recent Maps
                      <span className={styles.badge}>
                        {savedRoadmaps.length}
                      </span>
                    </h3>
                  </div>
                  <div className={styles.sectionContent}>
                    <RecentlyUsedRoadmaps
                      roadmaps={savedRoadmaps}
                      onSelect={handleLoadRoadmap}
                      maxToShow={5}
                    />
                  </div>
                </div>
              </div>

              {/* AI Suggestions */}
              <div className={styles.suggestionsSection}>
                <div className={styles.sectionCard}>
                  <div className={styles.sectionHeaderAI}>
                    <h3 className={styles.sectionHeaderTitleAI}>
                      <Bot className="w-5 h-5" />
                      AI-Generated Suggestions
                      {hasSuggestions && (
                        <span className={styles.badgeAI}>
                          {suggestions.length} phases
                        </span>
                      )}
                    </h3>
                  </div>
                  <div className={styles.sectionContent}>
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
                      <div className={styles.emptyAIState}>
                        <Bot className={styles.emptyAIIcon} />
                        <p className={styles.emptyAITitle}>No AI suggestions available</p>
                        <p className={styles.emptyAISubtitle}>
                          Click "AI Generate" to create intelligent dependency map suggestions based on your user stories
                        </p>
                      </div>
                    )}
                  </div>
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