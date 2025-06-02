import { Node, Edge, XYPosition } from '@xyflow/react';
import { 
RoadmapItem, 
RoadmapConnection, 
RoadmapPhase, 
getItemId,
getItemType, 
getItemTitle,
extractRelationsFromItem, 
NodeData
} from '@/types/roadmap';
import { getEdgeStyle } from '../styles/edge';
import { isItemVisible } from './roadmapRelations';  
import { TreeLayoutManager } from '../class/TreeLayoutManager';

export const extractAllConnections = (items: RoadmapItem[]): RoadmapConnection[] => {
  const allConnections: RoadmapConnection[] = [];
  items.forEach(item => {
    const itemConnections = extractRelationsFromItem(item);
    allConnections.push(...itemConnections);
  });
  
  return allConnections.filter((conn, index, self) => 
    index === self.findIndex(c => c.id === conn.id)
  );
};

const calculateTreeLayout = (
  items: RoadmapItem[],
  phaseLayoutManagers: Map<string, TreeLayoutManager>,
  collapsedItems: Set<string>,
  savedPositionsRef: React.RefObject<Map<string, any>>,
  phaseId?: string 
): Map<string, XYPosition> => {
  let layoutManager: TreeLayoutManager | undefined;

  if (phaseId) {
    layoutManager = phaseLayoutManagers.get(phaseId);
    if (!layoutManager) {
      console.warn(`No layout manager for phase`);
      return new Map();
    }
  } else {
    layoutManager = phaseLayoutManagers.get('global');
    if (!layoutManager) {
      console.warn(`No global layout manager found.`);
      return new Map();
    }
  }

  const visibleItems = items.filter(item => isItemVisible(item, collapsedItems));
  return layoutManager.calculateTreePositions(
    visibleItems,
    collapsedItems,
    savedPositionsRef.current
  );
};

const createNode = (
  item: RoadmapItem,
  position: XYPosition,
  connectedIds: Set<string>,
  collapsedItems: Set<string>,
  phaseId: string
): Node<NodeData> => {
  const itemId = getItemId(item);
  const itemType = getItemType(item);

  return {
    id: itemId,
    type: 'taskNode',
    position,
    data: {
      type: itemType,
      id: itemId,
      title: getItemTitle(item),
      originalData: item,
      phaseId: phaseId,
      isCollapsed: collapsedItems.has(itemId),
      hasCollapsibleChildren: itemType === 'user-story',
      hasConnections: connectedIds.has(itemId)
    },
    draggable: true,
  };
};

export const convertToNodes = (
  roadmapItems: RoadmapItem[],
  roadmapPhases: RoadmapPhase[],
  collapsedItems: Set<string>,
  phaseLayoutManagers: Map<string, TreeLayoutManager>,
  savedPositionsRef: React.RefObject<Map<string, any>>,
  useUnifiedLayout: boolean = false,
  unifiedPositions?: Map<string, XYPosition>
): Node<NodeData>[] => {
  const nodes: Node<NodeData>[] = [];
  const allConnections = extractAllConnections(roadmapItems);
  const connectedIds = new Set(
    allConnections.flatMap(conn => [conn.source, conn.target])
  );

  roadmapPhases.forEach(phase => {
    const phaseItems = roadmapItems.filter(item => phase.items.includes(getItemId(item)));

    nodes.push({
      id: phase.id,
      type: 'phaseNode',
      position: phase.position,
      data: {
        type: 'phase',
        id: phase.id,
        title: phase.name,
        originalData: { ...phase, itemCount: phaseItems.length },
        phaseId: phase.id,
        isCollapsed: false,
        hasCollapsibleChildren: false,
        hasConnections: false
      },
      draggable: false,
      selectable: false,
      style: {
        width: 350,
        height: 180,
        zIndex: -1,
      },
    });
  });

  let itemPositions: Map<string, XYPosition>;

  if (useUnifiedLayout) {
    itemPositions = calculateTreeLayout(
      roadmapItems,
      phaseLayoutManagers,
      collapsedItems,
      savedPositionsRef,
      undefined 
    );
  } else {
    itemPositions = new Map<string, XYPosition>();
    roadmapPhases.forEach(phase => {
      const phasePositions = calculateTreeLayout(
        roadmapItems.filter(item => phase.items.includes(getItemId(item))),
        phaseLayoutManagers,
        collapsedItems,
        savedPositionsRef,
        phase.id
      );
      phasePositions.forEach((pos, id) => itemPositions.set(id, pos));
    });

  }

  roadmapItems.forEach(item => {
    const itemId = getItemId(item);
    const position = itemPositions.get(itemId) || { x: 100, y: 400 };

    const itemPhase = roadmapPhases.find(phase => phase.items.includes(itemId));
    const phaseId = itemPhase?.id || 'unassigned';

    const node = createNode(item, position, connectedIds, collapsedItems, phaseId);
    nodes.push(node);
  });

  return nodes;
};

export const convertConnectionsToEdges = (
  connections: RoadmapConnection[],
  roadmapItems: RoadmapItem[],
  collapsedItems: Set<string>
): Edge[] => {
  const visibleItemIds = new Set(
    roadmapItems.filter(item => isItemVisible(item, collapsedItems)).map(item => getItemId(item))
  );

  return connections
    .filter(conn => visibleItemIds.has(conn.source) && visibleItemIds.has(conn.target))
    .map(conn => ({
      id: conn.id,
      source: conn.source,
      target: conn.target,
      sourceHandle: (conn as any).sourceHandle || undefined, 
      targetHandle: (conn as any).targetHandle || undefined, 
      type: 'smoothstep',
      style: getEdgeStyle(conn.type),
      data: { connectionType: conn.type }
    }));
};
