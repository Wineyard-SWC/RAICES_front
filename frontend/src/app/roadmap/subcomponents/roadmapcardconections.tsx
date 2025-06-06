import { Handle, Position } from '@xyflow/react';
import { getItemId, getItemType, RoadmapItem } from '@/types/roadmap';
import { UserStory } from '@/types/userstory';
import { Bug } from '@/types/bug';
import { Task } from '@/types/task';

type ConnectionHandlesProps = {
  isConnectable: boolean;
  hasConnections?: boolean;
  nodeType?: 'user-story' | 'task' | 'bug';
};

const baseHandleStyle = (position: Partial<React.CSSProperties>): React.CSSProperties => ({
  background: 'transparent',
  border: 'none',
  width: '12px',
  height: '12px',
  ...position,
});

export const renderConnectionHandles = ({
  isConnectable,
  hasConnections = false,
  nodeType = 'task',
}: ConnectionHandlesProps) => {
  return (
    <>
      {/* Top handles */}
      <Handle
        id="top-target"
        type="target"
        position={Position.Top}
        style={baseHandleStyle({ left: '50%' })}
        isConnectable={isConnectable}
        className={`handle-dot ${hasConnections ? 'always-visible' : ''}`}

      />
      <Handle
        id="top-source"
        type="source"
        position={Position.Top}
        style={baseHandleStyle({ left: '50%' })}
        isConnectable={isConnectable}
        className={`handle-dot ${hasConnections ? 'always-visible' : ''}`}

      />

      {/* Left handles */}
      <Handle
        id="left-target"
        type="target"
        position={Position.Left}
        style={baseHandleStyle({ top: '50%' })}
        isConnectable={isConnectable}
        className={`handle-dot ${hasConnections ? 'always-visible' : ''}`}

      />
      <Handle
        id="left-source"
        type="source"
        position={Position.Left}
        style={baseHandleStyle({ top: '50%' })}
        isConnectable={isConnectable}
        className={`handle-dot ${hasConnections ? 'always-visible' : ''}`}

      />

      {/* Right handles */}
      <Handle
        id="right-target"
        type="target"
        position={Position.Right}
        style={baseHandleStyle({ top: '50%' })}
        isConnectable={isConnectable}
        className={`handle-dot ${hasConnections ? 'always-visible' : ''}`}

      />
      <Handle
        id="right-source"
        type="source"
        position={Position.Right}
        style={baseHandleStyle({ top: '50%' })}
        isConnectable={isConnectable}
        className={`handle-dot ${hasConnections ? 'always-visible' : ''}`}
      />

      {/* Bottom handles */}
      <Handle
        id="bottom-target"
        type="target"
        position={Position.Bottom}
        style={baseHandleStyle({ left: '50%' })}
        isConnectable={isConnectable}
        className={`handle-dot ${hasConnections ? 'always-visible' : ''}`}
      />
      <Handle
        id="bottom-source"
        type="source"
        position={Position.Bottom}
        style={baseHandleStyle({ left: '50%' })}
        isConnectable={isConnectable}
        className={`handle-dot ${hasConnections ? 'always-visible' : ''}`}
      />
    </>
  );
};

const getHandlesForConnection = (
  sourceType: string,
  targetType: string,
  connectionType: 'parent-child' | 'relation',
  sourceIndex: number,
  targetIndex: number
): { sourceHandle: string; targetHandle: string } => {
  
  if (connectionType === 'parent-child') {
    if (sourceType === 'user-story') {
      return {
        sourceHandle: 'bottom-source',
        targetHandle: 'top-target'
      };
    }
    if (sourceType === 'task' && targetType === 'bug') {
      return {
        sourceHandle: 'bottom-source',
        targetHandle: 'top-target'
      };
    }
    if (sourceType === 'bug' && targetType === 'task') {
      return {
        sourceHandle: 'top-source',
        targetHandle: 'bottom-target'
      };
    }
  }
  
  if (connectionType === 'relation') {
    if (sourceIndex < targetIndex) {
      return {
        sourceHandle: 'right-source',
        targetHandle: 'left-target'
      };
    } else {
      return {
        sourceHandle: 'left-source',
        targetHandle: 'right-target'
      };
    }
  }
  
  return {
    sourceHandle: 'bottom-source',
    targetHandle: 'top-target'
  };
};


export const generateTreeConnectionsWithHandles = (
  items: RoadmapItem[]
): Array<{
  id: string;
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
  type: 'parent-child' | 'relation';
}> => {
  const connections: Array<{
    id: string;
    source: string;
    target: string;
    sourceHandle: string;
    targetHandle: string;
    type: 'parent-child' | 'relation';
  }> = [];
  
  let connectionIndex = 0;
  
  items.forEach((item, itemIndex) => {
    const itemType = getItemType(item);
    const itemId = getItemId(item);
    
    if (itemType === 'user-story') {
      const userStory = item as UserStory;
      
      if (userStory.task_list) {
        userStory.task_list.forEach((taskId, taskIndex) => {
          const targetItem = items.find(i => getItemId(i) === taskId);
          if (targetItem) {
            const targetIndex = items.indexOf(targetItem);
            
            const handles = getHandlesForConnection(
              itemType,
              getItemType(targetItem),
              'parent-child',
              itemIndex,
              targetIndex
            );
            
            connections.push({
              id: `${itemId}-${taskId}`,
              source: itemId,
              target: taskId,
              sourceHandle: handles.sourceHandle,
              targetHandle: handles.targetHandle,
              type: 'parent-child'
            });
            
            connectionIndex++;
          }
        });
      }
      
      items.forEach((otherItem, otherIndex) => {
        if (getItemType(otherItem) === 'bug') {
          const bug = otherItem as Bug;
          if (bug.userStoryRelated === itemId && !bug.taskRelated) {
            const handles = getHandlesForConnection(
              itemType,
              'bug',
              'parent-child',
              itemIndex,
              otherIndex
            );
            
            connections.push({
              id: `${itemId}-${getItemId(bug)}`,
              source: itemId,
              target: getItemId(bug),
              sourceHandle: handles.sourceHandle,
              targetHandle: handles.targetHandle,
              type: 'parent-child'
            });
            
            connectionIndex++;
          }
        }
      });
    }
    
    if (itemType === 'task') {
      items.forEach((otherItem, otherIndex) => {
        if (getItemType(otherItem) === 'bug') {
          const bug = otherItem as Bug;
          if (bug.taskRelated === itemId) {
            const handles = getHandlesForConnection(
              itemType,
              'bug',
              'parent-child',
              itemIndex,
              otherIndex
            );
            
            connections.push({
              id: `${itemId}-${getItemId(bug)}`,
              source: itemId,
              target: getItemId(bug),
              sourceHandle: handles.sourceHandle,
              targetHandle: handles.targetHandle,
              type: 'parent-child'
            });
            
            connectionIndex++;
          }
        }
      });
    }
  });
  
  return connections;
};