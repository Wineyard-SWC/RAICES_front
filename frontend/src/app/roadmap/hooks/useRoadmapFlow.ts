import { useCallback, useState, useMemo, useRef, useEffect } from 'react';
import { 
useNodesState, 
useEdgesState, 
addEdge, 
Connection, 
Edge, 
Node,
XYPosition 
} from '@xyflow/react';
import { getItemType } from '@/types/roadmap';
import { NodeData, RoadmapConnection, getItemId } from '@/types/roadmap';
import { 
convertToNodes, 
convertConnectionsToEdges, 
extractAllConnections,  
} from '../utils/roadmapConverters';
import { getEdgeStyle } from '../styles/edge';
import { generateTreeConnections } from '../class/TreeLayoutManager';
import { UseRoadmapFlowProps } from './interfaces/useRoadmapFlowProps';
import { RoadmapItem } from '@/types/roadmap';

interface ExtendedUseRoadmapFlowProps extends UseRoadmapFlowProps {
  createUnifiedLayout?: (items: RoadmapItem[]) => Map<string, XYPosition>;
  isUnifiedLayout?: boolean;
}

export const useRoadmapFlow = ({
  roadmapItems,
  roadmapPhases,
  collapsedItems,
  phaseLayoutManagers,
  savedPositionsRef,
  setRoadmapItems,
  setCollapsedItems,
  createUnifiedLayout,
  isUnifiedLayout = false,
}: ExtendedUseRoadmapFlowProps) => {

  const [manualConnections, setManualConnections] = useState<Edge[]>([]);
  const [hiddenAutoEdgeIds, setHiddenAutoEdgeIds] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);

  const roadmapItemsKey = useMemo(() => 
    roadmapItems.map(item => getItemId(item)).join('-'), 
    [roadmapItems]
  );

  const roadmapPhasesKey = useMemo(() => 
    roadmapPhases.map(phase => `${phase.id}-${phase.items.length}`).join('-'), 
    [roadmapPhases]
  );

  const collapsedItemsKey = useMemo(() => 
    Array.from(collapsedItems).sort().join('-'), 
    [collapsedItems]
  );

  const unifiedPositions = useMemo(() => {
    if (isUnifiedLayout && createUnifiedLayout) {
      return createUnifiedLayout(roadmapItems);
    }
    return new Map<string, XYPosition>();
  }, [isUnifiedLayout, createUnifiedLayout, roadmapItemsKey]);

  const automaticConnections = useMemo(() => {
    const allConnections: RoadmapConnection[] = [];
    
    if (isUnifiedLayout) {
      const treeConnections = generateTreeConnections(roadmapItems);
      treeConnections.forEach(conn => {
        allConnections.push({
          id: `${conn.source}-${conn.target}`,
          source: conn.source,
          target: conn.target,
          sourceHandle: 'bottom-source',
          targetHandle: 'top-target',
          type: conn.type
        });
      });
    } else {
      roadmapPhases.forEach(phase => {
        const phaseItems = roadmapItems.filter(item => 
          phase.items.includes(getItemId(item))
        );
        
        if (phaseItems.length > 0) {
          const treeConnections = generateTreeConnections(phaseItems);
          
          treeConnections.forEach(conn => {
            allConnections.push({
              id: `${conn.source}-${conn.target}`,
              source: conn.source,
              target: conn.target,
              sourceHandle: 'bottom-source',
              targetHandle: 'top-target',
              type: conn.type
            });
          });
        }
      });
    }
    
    return allConnections;
  }, [roadmapItemsKey, roadmapPhasesKey, isUnifiedLayout]);


  const calculatedNodes = useMemo(() => {
    return convertToNodes(
      roadmapItems, 
      roadmapPhases, 
      collapsedItems, 
      phaseLayoutManagers, 
      savedPositionsRef,
      isUnifiedLayout,
      unifiedPositions
    );
  }, [
    roadmapItemsKey, 
    roadmapPhasesKey,
    collapsedItemsKey,
    phaseLayoutManagers, 
    isUnifiedLayout,
    unifiedPositions
  ]);

  const calculatedEdges = useMemo(() => {
    const autoEdges = convertConnectionsToEdges(automaticConnections, roadmapItems, collapsedItems)
      .filter(edge => !hiddenAutoEdgeIds.has(edge.id));
    return [...autoEdges, ...manualConnections];
  }, [
    automaticConnections, 
    roadmapItemsKey, 
    collapsedItemsKey,
    hiddenAutoEdgeIds, 
    manualConnections
  ]);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
      setNodes(calculatedNodes);
    }, [calculatedNodes]);

  useEffect(() => {
      setEdges(calculatedEdges);
    }, [calculatedEdges]);

  const handleNodesChange = useCallback((changes: any[]) => {
    onNodesChange(changes);
    
    const positionChanges = changes.filter(change => 
      change.type === 'position' && change.position && change.dragging === false
    );
    
    if (positionChanges.length === 0) return;
    
    setTimeout(() => {
      setRoadmapItems((items) =>
        items.map((item) => {
          const nodeChange = positionChanges.find((c) => c.id === getItemId(item));
          if (nodeChange && nodeChange.position) {
            savedPositionsRef.current.set(getItemId(item), nodeChange.position);
            return {
              ...item,
              customPosition: nodeChange.position,
            };
          }
          return item;
        })
      );
    }, 0);
  }, [onNodesChange, setRoadmapItems, savedPositionsRef]);

  const handleToggleItemCollapse = useCallback((itemId: string) => {
    setCollapsedItems(prev => {
      const newCollapsed = new Set(prev);
      
      if (newCollapsed.has(itemId)) {
        newCollapsed.delete(itemId);
      } else {
        const childrenToHide = roadmapItems.filter(item => {
          const type = getItemType(item);
          
          if (type === 'task') {
            return (item as any).user_story_id === itemId;
          }
          if (type === 'bug') {
            const bug = item as any;
            return bug.userStoryRelated === itemId || bug.taskRelated === itemId;
          }
          return false;
        });

        childrenToHide.forEach(child => {
          const childId = getItemId(child);
          const currentNode = nodes.find(n => n.id === childId);
          if (currentNode) {
            savedPositionsRef.current.set(childId, currentNode.position);
          }
        });

        newCollapsed.add(itemId);
      }
      
      return newCollapsed;
    });
  }, [roadmapItems, nodes, setCollapsedItems, savedPositionsRef]);

  const onConnect = useCallback((params: Connection) => {
    const sourceNode = nodes.find(n => n.id === params.source);
    const targetNode = nodes.find(n => n.id === params.target);

    if (!sourceNode || !targetNode || sourceNode.data.type === 'phase' || targetNode.data.type === 'phase') return;

    const connectionType: 'parent-child' | 'relation' =
      sourceNode.data.type === 'user-story' && targetNode.data.type !== 'user-story'
        ? 'parent-child'
        : 'relation';

    const newEdgeId = `${params.source}-${params.target}`;

    const existingEdge = edges.find(e => e.id === newEdgeId);

    if (existingEdge) {
      setEdges(edges.map(e =>
        e.id === existingEdge.id
          ? {
              ...e,
              ...params,
              id: newEdgeId,
              style: getEdgeStyle(connectionType),
              data: { connectionType }
            }
          : e
      ));
    } else {
      const newEdge: Edge = {
        ...params,
        id: newEdgeId,
        type: 'smoothstep',
        sourceHandle: 'bottom-source',
        targetHandle: 'top-target',
        style: getEdgeStyle(connectionType),
        data: { connectionType }
      };
      setManualConnections(prev => addEdge(newEdge, prev));
    }
  }, [nodes, edges, setEdges]);

  const onEdgesDelete = useCallback((edgesToDelete: Edge[]) => {
    setManualConnections(prev => prev.filter(edge =>
      !edgesToDelete.find(toDelete => toDelete.id === edge.id)
    ));
    setHiddenAutoEdgeIds(prev => {
      const updated = new Set(prev);
      edgesToDelete.forEach(e => updated.add(e.id));
      return updated;
    });
  }, []);

  const onNodeClick = useCallback((event: MouseEvent, node: Node) => {
    setSelectedNode(node as Node<NodeData>);
  }, []);

  const onNodeDoubleClick = useCallback(
    (event: MouseEvent, node: Node) => {
    const nodeData = node.data as NodeData;
      if (nodeData.type === 'user-story') handleToggleItemCollapse(nodeData.id);
    },
    [handleToggleItemCollapse]
  );


  return {
    nodes,
    edges,
    selectedNode,
    setSelectedNode,
    onNodesChange: handleNodesChange,
    onEdgesChange,
    onConnect,
    onEdgesDelete,
    onNodeClick,
    onNodeDoubleClick,
    handleToggleItemCollapse,
  };
};