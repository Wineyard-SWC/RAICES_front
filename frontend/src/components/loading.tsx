import React, { useEffect, useState } from 'react';

interface LoadingScreenProps {
  isLoading: boolean;
  generationType: "requirements" | "epics" | "userStories";
}

const loadingMessagesMap = {
    requirements: [
        "Reading request",
        "Analyzing context",
        "Searching in the knowledge base",
        "Generating requirements",
        "Organizing results",
      ],
      epics: [
        "Reading selected requirements",
        "Analyzing dependencies",
        "Grouping functionalities",
        "Generating epics",
        "Organizing results",
      ],
      userStories: [
        "Reading selected epics",
        "Analyzing feature scope",
        "Breaking down into user tasks",
        "Generating user stories",
        "Creating acceptance criteria",
        "Organizing results",
      ],
  };

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isLoading, generationType }) => {
  const [position, setPosition] = useState('100%');
  const [visibleMessages, setVisibleMessages] = useState<string[]>([]);

  useEffect(() => {
    if (isLoading) {
      setPosition('0%');
      setVisibleMessages([]); 
    } else {
      setPosition('100%');
    }
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading) return;

    let currentIndex = 0;

    const messagesToShow = loadingMessagesMap[generationType];

    const interval = setInterval(() => {
      if (currentIndex < messagesToShow.length) {
        setVisibleMessages(prev => [...prev, messagesToShow[currentIndex]]);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 5500);

    return () => clearInterval(interval);
  }, [isLoading]);

  return (
    <div
      className="fixed inset-x-0 bottom-0 bg-[#F5F0F1] z-40"
      style={{
        height: '100vh',
        transform: `translateY(${position})`,
        transition: 'transform 1s ease-in-out',
        boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.1)',
        borderTopLeftRadius: '16px',
        borderTopRightRadius: '16px',
      }}
    >
      <div className="h-2 w-20 bg-gray-300 mx-auto mt-2 rounded-full"></div>
      <div className="w-full h-full flex flex-col items-center justify-start pt-2 relative">
        {/* Animación más arriba */}
        <div className="w-full h-[50vh] max-w-6xl">
          <iframe
            src="/animation/plant.html"
            className="w-full h-full"
            style={{ border: 'none' }}
            title="Generating Animation"
          />
        </div>

        {/* Mensajes progresivos */}
        <div className="w-full max-w-2xl mt-4 space-y-4 text-lg text-[#4a2a4a] font-medium px-6 mx-auto pt-12">
            {visibleMessages.map((msg, i) => (
            <div key={i} className="flex items-center gap-2">
                <span className="text-2xl">•</span>
                <span className={`text-2xl ${i === visibleMessages.length - 1 && i !== loadingMessagesMap[generationType].length - 1 ? 'dot-loading' : ''}`}>
                {msg}
                </span>
            </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
