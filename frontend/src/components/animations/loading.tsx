import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

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
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-50 bg-[#F5F0F1] flex flex-col items-center pt-6"
          initial={{ y: '100%' }}
          animate={{ y: '0%' }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          {/* Drag handle style */}
          <div className="h-2 w-20 bg-gray-300 mx-auto mb-4 rounded-full" />

          {/* Animation */}
          <div className="w-full max-w-6xl h-[50vh]">
            <iframe
              src="/animation/plant.html"
              title="Generating Animation"
              className="w-full h-full"
              style={{ border: 'none' }}
              loading="lazy"
            />
          </div>

          {/* Progressive messages */}
          <div className="w-full max-w-2xl mt-4 space-y-4 text-lg text-[#4a2a4a] font-medium px-6 pt-12">
            {visibleMessages.map((msg, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-2xl">•</span>
                <span
                  className={`text-2xl ${
                    i === visibleMessages.length - 1 &&
                    i !== loadingMessagesMap[generationType].length - 1
                      ? 'dot-loading'
                      : ''
                  }`}
                >
                  {msg}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

};

export default LoadingScreen;
