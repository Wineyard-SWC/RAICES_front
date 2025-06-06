export const getEdgeStyle = (connectionType: string) => {
  switch (connectionType) {
    case 'parent-child':
      return { 
        stroke: '#6366f1', 
        strokeWidth: 3,
      };
    case 'relation':
      return { 
        stroke: '#f59e0b', 
        strokeWidth: 2, 
      };
    case 'dependency':
      return { 
        stroke: '#10b981', 
        strokeWidth: 2,
      };
    default:
      return { 
        stroke: '#6b7280', 
        strokeWidth: 2 
      };
  }
};
