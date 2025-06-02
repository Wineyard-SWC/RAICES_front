import React, {useMemo} from "react";
import { RoadmapItem } from "@/types/roadmap";
import { Bug } from "@/types/bug";
import { UserStory } from "@/types/userstory";
import { TreeLayoutManager } from "../class/TreeLayoutManager";
import { getItemType,getItemId } from "@/types/roadmap";

import PreviewCard from "./roadmappreviewcard";


interface Props {
  userStory: UserStory;
  allAvailableItems?: RoadmapItem[]; 
}

export default function RoadmapTreePreview({ userStory, allAvailableItems=[] }: Props) {
  const previewData = useMemo(() => {
    const relatedItems = {
      userStory: null as RoadmapItem | null,
      tasks: [] as RoadmapItem[],
      bugs: [] as RoadmapItem[]
    };

    try {
      relatedItems.userStory = allAvailableItems.find(
        item => {
          try {
            return getItemType(item) === 'user-story' && getItemId(item) === userStory.id;
          } catch (e) {
            return false;
          }
        }
      ) || null;
    } catch (e) {
      console.warn("Error finding original user story");
    }

    if (!relatedItems.userStory) {
      relatedItems.userStory = userStory as any;
    }

    if (userStory.task_list && Array.isArray(userStory.task_list)) {
      try {
        relatedItems.tasks = allAvailableItems.filter(item => {
          try {
            return getItemType(item) === "task" && userStory.task_list?.includes(getItemId(item));
          } catch (e) {
            return false;
          }
        });
      } catch (e) {
        console.warn("Error finding related tasks");
      }

      relatedItems.tasks.forEach(task => {
        try {
          const taskBugs = allAvailableItems.filter(item => {
            try {
              return getItemType(item) === "bug" && (item as Bug).taskRelated === getItemId(task);
            } catch (e) {
              return false;
            }
          });
          relatedItems.bugs.push(...taskBugs);
        } catch (e) {
          console.warn("Error finding task bugs");
        }
      });

      try {
        const directBugs = allAvailableItems.filter(item => {
          try {
            return getItemType(item) === "bug" && 
                   (item as Bug).userStoryRelated === userStory.id && 
                   !(item as Bug).taskRelated;
          } catch (e) {
            return false;
          }
        });
        relatedItems.bugs.push(...directBugs);
      } catch (e) {
        console.warn("Error finding direct bugs");
      }
    }

    return relatedItems;
  }, [userStory, allAvailableItems]);

  const layoutPositions = useMemo(() => {
    const allItems = [
      ...(previewData.userStory ? [previewData.userStory] : []),
      ...previewData.tasks,
      ...previewData.bugs
    ];

    const treeLayout = new TreeLayoutManager("preview-phase", { x: 0, y: 0 });
    treeLayout.setAdaptiveSpacing(true); 

    return treeLayout.calculateTreePositions(
      allItems,
      new Set(), 
      new Map()  
    );
  }, [previewData]);

  const containerDimensions = useMemo(() => {
    const allPositions = Array.from(layoutPositions.values());
    if (allPositions.length === 0) return { width: 400, height: 300, offsetX: 0, offsetY: 0 };
    
    const maxX = Math.max(...allPositions.map(p => p.x)) + 140; 
    const maxY = Math.max(...allPositions.map(p => p.y)) + 120; 
    const minX = Math.min(...allPositions.map(p => p.x)) - 140;
    const minY = Math.min(...allPositions.map(p => p.y));
    
    return {
      width: maxX - minX,
      height: maxY - minY,
      offsetX: -minX,
      offsetY: -minY
    };
  }, [layoutPositions]);

  const scale = 0.7;
  const allItems = [
    ...(previewData.userStory ? [previewData.userStory] : []),
    ...previewData.tasks,
    ...previewData.bugs
  ];

  if (allItems.length === 0) {
    return (
      <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
        <div className="text-center py-8 text-gray-500">
          <p>No related items found for preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center p-4 bg-gray-50 rounded-lg overflow-hidden">
      <div 
        className="relative bg-white rounded-lg shadow-sm border border-gray-200"
        style={{
          width: Math.max(1000, containerDimensions.width * scale + 40),
          height: Math.max(400, containerDimensions.height * scale + 40),
          overflow: 'hidden'
        }}
      >
        {/* Contenedor escalado */}
        <div 
          className="absolute"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            left: `calc(70% - ${(containerDimensions.width * scale) / 2}px)`,
            top: 30 + containerDimensions.offsetY * scale,
          }}
        >
          {/* Líneas de conexión simples */}
          <svg 
            className="absolute pointer-events-none"
            style={{
              width: `${containerDimensions.width}px`,
              height: `${containerDimensions.height}px`,
              left: 0,
              top: 0,
              overflow: 'visible'
            }}
          >
            {/* Líneas de user story a tasks */}
            {previewData.userStory && previewData.tasks.map(task => {
              const userStoryPos = layoutPositions.get(getItemId(previewData.userStory!));
              const taskPos = layoutPositions.get(getItemId(task));
              if (!userStoryPos || !taskPos) return null;
              
              return (
                <line
                  key={`us-${getItemId(task)}`}
                  x1={userStoryPos.x + 120}
                  y1={userStoryPos.y + 120}
                  x2={taskPos.x + 120}
                  y2={taskPos.y}
                  stroke="#c7a0b8"
                  strokeWidth={2}
                />
              );
            })}
            
            {/* Líneas de tasks a bugs */}
            {previewData.tasks.map(task => {
              const taskPos = layoutPositions.get(getItemId(task));
              if (!taskPos) return null;
              
              return previewData.bugs
                .filter(bug => (bug as Bug).taskRelated === getItemId(task))
                .map(bug => {
                  const bugPos = layoutPositions.get(getItemId(bug));
                  if (!bugPos) return null;
                  
                  return (
                    <line
                      key={`task-${getItemId(bug)}`}
                      x1={taskPos.x + 120}
                      y1={taskPos.y + 120}
                      x2={bugPos.x + 120}
                      y2={bugPos.y}
                      stroke="#e57373"
                      strokeWidth={1.5}
                      strokeDasharray="4,2"
                    />
                  );
                });
            })}
          </svg>

          {allItems.map(item => {
            const position = layoutPositions.get(getItemId(item));
            if (!position) return null;

            let itemType = 'unknown';
            try {
              itemType = getItemType(item);
            } catch (e) {
              if ('task_list' in item) itemType = 'user-story';
              else if ('user_story_id' in item) itemType = 'task';
              else if ('severity' in item) itemType = 'bug';
            }

            try {
              return (
                <div
                  key={getItemId(item)}
                  className="absolute"
                  style={{
                    left: position.x,
                    top: position.y,
                    pointerEvents: 'none' 
                  }}
                >
                  <PreviewCard item={item} itemType={itemType} />
                </div>
              );
            } catch (error) {
              console.warn("Error rendering card");
              return null;
            }
          })}

          
        </div>
        
        {/* Información estadística */}
        <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
          {previewData.tasks.length} tasks, {previewData.bugs.length} bugs
        </div>
      </div>
    </div>
  );
}