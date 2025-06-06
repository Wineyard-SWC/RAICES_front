"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SessionWelcome from "./steps/1_SessionWelcome";
import DeviceConnection from "./steps/2_DeviceConnection";
import BaselineCapture from "./steps/3_BaselineCapture";
import QuestionsFlow from "./steps/4_QuestionsFlow";
import SessionResults from "./steps/5_SessionResults";

interface BiometricSessionStepsProps {
  sessionId: string;
}

export default function BiometricSessionSteps({ sessionId }: BiometricSessionStepsProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [sessionData, setSessionData] = useState(null);

  useEffect(() => {
    // Cargar datos de la sesión
    // fetchSessionData(sessionId);
  }, [sessionId]);

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);

  const handleComplete = () => {
    router.push(`/biometric_sessions/session/${sessionId}/results`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium ${
                step <= currentStep
                  ? "bg-[#4a2b4a] text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {step}
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-[#4a2b4a] h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      {currentStep === 1 && (
        <SessionWelcome 
          sessionData={sessionData}
          onNext={nextStep}
        />
      )}
      {currentStep === 2 && (
        <DeviceConnection 
          onNext={nextStep}
          onPrev={prevStep}
        />
      )}
      {currentStep === 3 && (
        <BaselineCapture 
          onNext={nextStep}
          onPrev={prevStep}
        />
      )}
      {currentStep === 4 && (
        <QuestionsFlow 
          sessionData={sessionData}
          onNext={nextStep}
          onPrev={prevStep}
        />
      )}
      {currentStep === 5 && (
        <SessionResults 
          sessionData={sessionData}
          onComplete={handleComplete}
          onPrev={prevStep}
        />
      )}
    </div>
  );
}