import React from 'react';

interface PhaseCardProps {
  data: {
    id: string;
    title: string;
    description?: string;
    color: string;
    itemCount: number;
    type: 'phase';
  };
  isConnectable: boolean;
  hasConnections: boolean;
}

const PhaseCard: React.FC<PhaseCardProps> = ({ data, isConnectable, hasConnections = false }) => {
  const { title, description, color, itemCount } = data;
  const actualItemCount = itemCount ?? 0;

  return (
    <div className="relative">
      
      {/* Phase Card */}
      <div 
        className="bg-white rounded-xl shadow-lg border-2 min-w-80 max-w-96 overflow-hidden transition-all hover:shadow-xl hover:scale-[1.02] cursor-pointer"
        style={{ borderColor: color }}
      >
        {/* Header with gradient */}
        <div 
          className="p-4 text-white relative overflow-hidden"
          style={{ 
            background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)` 
          }}
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
            <div className="w-full h-full rounded-full border-4 border-white transform translate-x-6 -translate-y-6"></div>
          </div>
          <div className="absolute bottom-0 left-0 w-16 h-16 opacity-10">
            <div className="w-full h-full rounded-full border-4 border-white transform -translate-x-4 translate-y-4"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold">{title}</h3>
              <div className="bg-white bg-opacity-20 rounded-full px-3 py-1">
                <span className="text-sm font-semibold">{actualItemCount}</span>
              </div>
            </div>
            
            {description && (
              <p className="text-sm opacity-90 leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Progress indicator */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-gray-600">Elements</span>
              <span className="text-xs font-bold text-gray-800">{actualItemCount}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-500"
                style={{ 
                  backgroundColor: color,
                  width: itemCount > 0 ? '100%' : '0%'
                }}
              ></div>
            </div>
          </div>

          {/* Phase indicators */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              ></div>
              <span className="text-xs text-gray-600 font-medium">Project Phase</span>
            </div>
            
            {actualItemCount  > 0 && (
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600 font-medium">Active</span>
              </div>
            )}
          </div>

          {/* Bottom decoration */}
          <div className="mt-3 flex justify-center">
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i}
                  className="w-1 h-1 rounded-full opacity-30"
                  style={{ backgroundColor: color }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Drop zone indicator (when dragging items) */}
        <div className="absolute inset-0 border-2 border-dashed border-transparent hover:border-blue-400 hover:bg-blue-50 hover:bg-opacity-50 rounded-xl pointer-events-none transition-all"></div>
      </div>
    </div>
  );
};

export default PhaseCard;