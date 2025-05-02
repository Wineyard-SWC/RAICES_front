// components/LoadingTasks.tsx
"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingTasksProps {
  isLoading: boolean;
}

// Mensajes de carga para tasks
const TASK_LOADING_MESSAGES = [
  "Reading selected user stories",
  "Analyzing story complexity",
  "Generating tasks",
  "Organizing results",
];

function useLoadingMessages(isLoading: boolean) {
  const [visibleMessages, setVisibleMessages] = useState<string[]>([]);
  useEffect(() => {
    if (!isLoading) {
      setVisibleMessages([]);
      return;
    }
    let idx = 0;
    const iv = setInterval(() => {
      setVisibleMessages(prev => {
        if (idx < TASK_LOADING_MESSAGES.length) {
          return [...prev, TASK_LOADING_MESSAGES[idx++]];
        }
        clearInterval(iv);
        return prev;
      });
    }, 1200);
    return () => clearInterval(iv);
  }, [isLoading]);
  return visibleMessages;
}

const LoadingTasks: React.FC<LoadingTasksProps> = ({ isLoading }) => {
  const visibleMessages = useLoadingMessages(isLoading);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-50 bg-[#F5F0F1] flex flex-col items-center -mt-10"          
          initial={{ y: "100%" }}
          animate={{ y: "0%" }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* — Regadera animada — */}
          <div className="loading-container">
            <svg
              className="growth-svg"
              viewBox="-10 -30 140 149"
              preserveAspectRatio="xMinYMin"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g className="swing-group">
                <g className="water-offset">
                  <path
                    className="water-1"
                    d="M79.449994,63.4914319 C89.5752152,63.008737 94.975463,64.4361089 95.6507374,67.7735477"
                    strokeLinecap="round"
                  />
                  <path
                    className="water-2"
                    d="M79.4813921,58.5799658 C96.7990534,57.6976955 105.879764,63.1909813 106.723524,75.059823"
                    strokeLinecap="round"
                  />
                  <path
                    className="water-3"
                    d="M79.4530382,53.8852864 C100.951491,52.7708113 112.32084,60.115559 113.561085,75.9195296"
                    strokeLinecap="round"
                  />
                  <path
                    className="water-4"
                    d="M79.6303778,49.5250278 C104.257034,47.9136138 117.226104,56.5125637 118.537587,75.3218774"
                    strokeLinecap="round"
                  />
                </g>
                <g className="can-group">
                  <path
                    className="can"
                    d="M14.4105458,5.6538622 C15.9307934,4.18074352 17.9023984,3.44741754 19.8722724,3.44741754 C21.915281,3.44741754 23.9565586,4.23635731 25.4902215,5.8069079 C28.5021554,8.89239529 28.4333483,13.8437468 25.3361628,16.8447357 L12.552321,29.2319523 C12.1109169,18.5536741 12.6362744,7.37271622 14.4105458,5.6538622 M72.2154425,53.5450928 L58.5332135,50.3690714 L63.3003778,45.7496781 L63.2177227,45.771665 C70.13089,38.2482836 63.8491037,31.385801 63.8491037,31.385801 L64.0196069,31.5013397 L46.1236997,13.1716391 C41.9294952,17.2353256 35.2223165,17.143067 31.1427906,12.9647041 L31.0220536,13.0819672 C31.1116326,12.5322961 31.1613988,11.9722782 31.169621,11.4053625 C31.2111649,8.39963127 30.0756312,5.55729253 27.971605,3.4021505 C23.6281021,-1.04652134 16.4613439,-1.14524659 11.9966712,3.18185093 C10.7590087,4.38078071 9.09768479,7.44212568 8.96223432,20.1263803 C8.89083071,26.8297816 9.2915564,33.1658733 9.29588389,33.2292471 L9.35041028,34.0806985 L0,43.1410035 L32.0809907,76 L47.5292688,61.0313983 L71.969641,58.6029297 C72.6581448,62.6118646 75.3282069,65.6244936 77.746409,65.6581205 L78,47.4435275 C75.7445116,47.4124873 73.197783,49.9659792 72.2154425,53.5450928"
                  />
                </g>
              </g>
            </svg>

            {/* Aquí van tus estilos originaless */}
            <style jsx>{`
              .loading-container {
                width: 200px;
                margin: 100px auto 0;
              }
              .growth-svg {
                width: 100%;
              }
              .loading-container {
                width: 35vh;
                margin: 100px auto 0;
                /* mueve todo el SVG (agua + can) */
                transform: translate(-12vh, 10vh);
              }

              .swing-group {
                transform-box: view-box;
                transform-origin: 50% 50%;
                animation: water-swing 2.2s ease infinite;
              }
              .water-offset {
                transform: translateY(10px);
                transform-box: view-box;
                transform-origin: 50% 50%;
                animation: water-swing 2.2s ease infinite reverse;
              }
              .water-1,
              .water-2,
              .water-3,
              .water-4 {
                stroke: #4a2b4a;
                stroke-width: 2;
                fill: none;
                animation: watering 0.8s linear infinite;
              }
              .can {
                fill: #4a2b4a;
              }
              .stem {
                animation: stem-growth 2.2s linear infinite;
                transform-box: view-box;
                transform-origin: 50% 50%;
              }
              .leaves-group {
                animation: growth-move 2.2s linear infinite;
                transform-box: view-box;
                transform-origin: 50% 50%;
              }
              @keyframes water-swing {
                from {
                  transform: translate(1px, 1px) rotate(6deg);
                }
                40%,
                74% {
                  transform: translate(1px, -2px) rotate(12deg);
                }
                to {
                  transform: translate(1px, 1px) rotate(6deg);
                }
              }
              @keyframes watering {
                from {
                  stroke-dasharray: 2, 3;
                }
                50% {
                  stroke-dasharray: 4, 3;
                }
                75% {
                  stroke-dasharray: 6, 3;
                }
                to {
                  stroke-dasharray: 8, 3;
                }
              }
              @keyframes stem-growth {
                from {
                  opacity: 1;
                }
                20% {
                  opacity: 1;
                }
                70% {
                  transform: scale3d(1.2, 2, 0);
                  opacity: 1;
                }
                to {
                  transform: scale3d(1.2, 2, 0);
                  opacity: 0;
                }
              }
              @keyframes growth-move {
                from {
                  opacity: 1;
                }
                20% {
                  opacity: 1;
                }
                70% {
                  transform: scale(1.35) translateY(-3px);
                  opacity: 1;
                }
                to {
                  transform: scale(1.35) translateY(-3px);
                  opacity: 0;
                }
              }
            `}</style>
          </div>

          {/* — Planta animada (iframe) — */}
          <div className="w-full max-w-4xl h-[35vh] -mt-10">
            <iframe
              src="/animation/plant.html"
              title="Plant Animation"
              className="w-full h-full"
              style={{ border: "none" }}
              loading="lazy"
            />
          </div>

          {/* — Mensajes progresivos — */}
          <div className="w-full max-w-2xl mt-4 space-y-4 text-lg text-[#4a2a4a] font-medium px-6 pt-6">
            {visibleMessages.map((msg, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-2xl">•</span>
                <span
                  className={`text-2xl ${
                    i === visibleMessages.length - 1 &&
                    i !== TASK_LOADING_MESSAGES.length - 1
                      ? "dot-loading"
                      : ""
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

export default LoadingTasks;
