import { useState, useEffect, useRef } from "react";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";

import type { RoadmapPhase, SavedRoadmap, RoadmapItem, RoadmapConnection } from "@/types/roadmap";

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

  const handleCreateNewRoadmap = () => {
    if (!newRoadmapName.trim()) return;

    const newRoadmap: SavedRoadmap = {
      id: `roadmap-${Date.now()}`,
      name: newRoadmapName.trim(),
      description: newRoadmapDescription.trim() || undefined,
      items: [],
      connections: [],
      phases: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSavedRoadmaps(prev => [...prev, newRoadmap]);
    setCurrentRoadmap(newRoadmap);
    setNewRoadmapName('');
    setNewRoadmapDescription('');
    setShowNewRoadmapDialog(false);
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
    handleGoBackToStart
  };
}
