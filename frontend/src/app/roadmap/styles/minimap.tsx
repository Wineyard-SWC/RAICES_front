import { Node } from '@xyflow/react';

export const getMiniMapNodeColor = (node: Node): string => {
  const nodeData = node.data as any;
  switch (nodeData.type) {
    case 'user-story': return '#3b82f6';
    case 'task': return '#10b981';
    case 'bug': return '#ef4444';
    case 'phase': return '#8b5cf6';
    default: return '#6b7280';
  }
};