"use client";

//React/Next imports
import { useMemo, useEffect, useState,  } from "react";
import { useRouter } from "next/navigation";
//contexts
import { useTasks } from "@/contexts/taskcontext";
import { useBugs } from "@/contexts/bugscontext";
import { useUserStories } from "@/contexts/saveduserstoriescontext";
import { useKanban } from "@/contexts/unifieddashboardcontext";
import { Loader2 } from "lucide-react";
//components/subcomponents
import RoadmapTopBar from "./subcomponents/roadmaptopbar";
import RoadmapSelectorModal from "./subcomponents/roadmapselectormodal";
import NewRoadmapDialog from "./subcomponents/roadmapnewroadmapcreator";
import CustomRoadmapCanvas from "./components/roadmapcanvas";
import Navbar from "@/components/NavBar";
import SuggestedRoadmapsList from "./components/SuggestedRoadmaps/suggestedRoadmapList";

import { useSuggestedRoadmap } from "./hooks/useSuggestedRoadmaps";
import { useSuggestedRoadmapsList } from "./hooks/useSuggestedRoadmapsList";
import { useRoadmapManagementLogic } from "./hooks/useRoadmapManagementLogic";

import { RoadmapItem } from "@/types/roadmap";
import { SuggestedPhase } from "./hooks/interfaces/useSuggestedRoadmapsProps";

export default function CustomRoadmapPage() {
  const router = useRouter();
  const projectId = typeof window !== "undefined" ? localStorage.getItem("currentProjectId") || "" : "";
  const [currentTasks,setCurrentTasks] = useState<RoadmapItem[]>([])
  const [currentBugs,setCurrentBugs] = useState<RoadmapItem[]>([])
  const [currentUserStories,setCurrentUserStories] = useState<RoadmapItem[]>([])
  const [hasRefreshed,setHasRefreshed] = useState(false)
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
    handleGoBackToStart
  } = useRoadmapManagementLogic({
    tasks: currentTasks,
    bugs: currentBugs,
    userStories: currentUserStories
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
    toggleMinimized,
    handlePhaseSelection
  } = useSuggestedRoadmapsList();

  
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

  const handleGenerateSuggestions  = () => {
    const inputStories = currentUserStories.map(us => ({ id: us.id, title: us.title }));
    generateSuggestedRoadmap(inputStories);
    showSuggestedRoadmaps();
  };

  const handleUseSelectedPhases = (selectedPhases: SuggestedPhase[]) => {
    console.log('Creating roadmap with selected phases:', selectedPhases);
    
    const roadmapName = `AI Suggested Roadmap - ${new Date().toLocaleDateString()}`;
    const roadmapDescription = `Roadmap generated from ${selectedPhases.length} AI-suggested phases`;
    
    setNewRoadmapName(roadmapName);
    setNewRoadmapDescription(roadmapDescription);
    handleCreateNewRoadmap();
    
  };

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      router.push("/login");
    } else {
      loadSavedRoadmaps();
    }
  }, [router]);

  

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
      
      <div className="min-h-screen bg-[#f5f0f1]">
        
        {/* Roadmap Selector Modal */}
        {showRoadmapSelector && (
          <RoadmapSelectorModal
            savedRoadmaps={savedRoadmaps}
            onClose={() => setShowRoadmapSelector(false)}
            onSelect={handleLoadRoadmap}
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
            className="absolute top-20 right-4 z-10 bg-white shadow-lg border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Show Header
          </button>
        )}

        {/* Canvas Section */}
        <div className="w-full mx-auto p-4">
          {currentRoadmap ? (
            <CustomRoadmapCanvas 
              ref={canvasRef}
              availableData={availableData}
              onSave={handleSaveRoadmap}
            />
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="text-6xl mb-4">🗺️</div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                  Start Your Custom Roadmap
                </h3>
                <p className="text-gray-600 mb-6">
                  Create a new roadmap or load an existing one to start visualizing 
                  and planning your project in a structured way.
                </p>
                <div className="flex gap-3 justify-center">
                  <button 
                    onClick={() => setShowNewRoadmapDialog(true)}
                    className="px-4 py-2 text-[#694969] rounded-lg border border-black shadow shadow-mb hover:bg-[#694969] hover:text-white transition-colors"
                  >
                    Create New Roadmap
                  </button>
                  <button 
                    onClick={() => setShowRoadmapSelector(true)}
                    className="px-4 py-2 text-[#694969] rounded-lg border border-black shadow shadow-mb hover:bg-[#694969] hover:text-white transition-colors"
                  >
                    Load Existing
                  </button>
                  {/* Generate Suggested Roadmap Button */}
                  <button
                    onClick={handleGenerateSuggestions }
                    disabled={loadingGenerativeError || currentUserStories.length === 0}
                    className={`px-4 py-2 rounded-lg border transition-colors font-medium flex items-center gap-2 shadow-sm ${
                      loadingGenerativeError || currentUserStories.length === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-300'
                        : 'text-[#694969] border-black hover:bg-[#694969] hover:text-white'
                    }`}
                  >
                    {loadingGenerativeError ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        Suggest Roadmap
                      </>
                    )}
                  </button>
                </div>
              </div>
              {showSuggestions && (
                 <SuggestedRoadmapsList
                  suggestedRoadmaps={suggestedRoadmaps}
                  onClose={hideSuggestedRoadmaps}
                  onSelectPhases={handleUseSelectedPhases}
                  loading={loadingGenerativeError}
                  error={generativeRoadmapError}
                  isMinimized={isMinimized}
                  onMinimize={minimizeSuggestions}
                  onMaximize={maximizeSuggestions}/>
              )}
      
            </div>
          )}
        </div>
      </div>
    </>
  );
}