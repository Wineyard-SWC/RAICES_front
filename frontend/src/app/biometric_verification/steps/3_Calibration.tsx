"use client";

import { useState, useEffect, useRef } from "react"
import { Waves, AlertCircle, CheckCircle, Bluetooth, Brain, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import EmotionWheel from "../components/EmotionWheel"
import BrainwaveVisualizer from "../components/BrainwaveVisualizer"
import ElectrodeQualityIndicator from "../components/ElectrodeQualityIndicator"
import { useMuse } from "@/hooks/useMuse";
import { useSessionData } from "@/hooks/useSessionData";
import { print, printError } from "@/utils/debugLogger";

interface TeamMember {
  id: string;
  name: string;
}

interface CalibrationProps {
  participant: TeamMember;
  onComplete: () => void;
}

export default function Calibration({ participant, onComplete }: CalibrationProps) {
  const {
    connectionStatus,
    signalQuality,
    eegData,
    electrodeQuality,
    connect,
    disconnect,
  } = useMuse();

  const { captureRestData } = useSessionData();

  // Estados de UI
  const [connectionPhase, setConnectionPhase] = useState(true);
  const [calibrationTime, setCalibrationTime] = useState(30);
  const [calibrationComplete, setCalibrationComplete] = useState(false);
  const [showNeutralPoint, setShowNeutralPoint] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  // 🔥 NUEVOS ESTADOS PARA FASE INFORMATIVA
  const [showInfoPhase, setShowInfoPhase] = useState(false);
  const [infoTime, setInfoTime] = useState(10);
  const [isInfoActive, setIsInfoActive] = useState(false);

  // 🔥 UNA SOLA REFERENCIA PARA TODOS LOS TIMERS
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasCalibrationCompleted = useRef(false);

  // 🔥 FUNCIÓN PARA LIMPIAR CUALQUIER TIMER ACTIVO
  const clearAnyTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      print("🧹 Timer limpiado");
    }
  };

  // Escuchar cambios en el estado de conexión
  useEffect(() => {
    if (connectionStatus === "error") {
      setConnectError("Failed to connect to Muse. Please ensure the device is powered on and in pairing mode.");
    } else if (connectionStatus === "connected") {
      setConnectError(null);
    }
  }, [connectionStatus]);

  // Connect to Muse headset
  const handleConnect = async () => {
    setConnectError(null);
    
    try {
      if (!navigator.bluetooth) {
        setConnectError("Web Bluetooth is not supported in your browser. Please use Chrome, Edge, or Opera on desktop, or check browser compatibility.");
        return;
      }
      
      await connect();
      
    } catch (error: any) {
      printError("Error connecting to Muse:", error);
      
      if (error.message?.includes("User cancelled") || 
          error.name === "NotFoundError" || 
          error.name === "AbortError") {
        setConnectError("Connection cancelled. Please try again when ready.");
      } else {
        setConnectError("An error occurred while connecting to Muse. Please try again.");
      }
    }
  };

  // Start the calibration process
  const startCalibration = () => {
    print("🚀 Starting info phase before calibration");
    
    // 🔥 LIMPIAR CUALQUIER TIMER EXISTENTE PRIMERO
    clearAnyTimer();
    
    setConnectionPhase(false);
    setShowInfoPhase(true);
    setIsInfoActive(true);
    setInfoTime(10); // 🔥 REINICIAR A 10 segundos
    
    // Iniciar countdown de información
    startInfoCountdown();
  };

  // 🔥 FUNCIÓN PARA COUNTDOWN DE INFORMACIÓN (MEJORADA)
  const startInfoCountdown = () => {
    print("ℹ️ Starting info countdown");
    
    // 🔥 ASEGURAR QUE NO HAY TIMERS PREVIOS
    clearAnyTimer();
    
    timerRef.current = setInterval(() => {
      setInfoTime((prevTime) => {
        const newTime = prevTime - 1;
        print(`ℹ️ Info time remaining: ${newTime}s`);
        
        if (newTime <= 0) {
          // 🔥 LIMPIAR TIMER ANTES DE CONTINUAR
          clearAnyTimer();
          
          // 🔥 TRANSICIÓN A CALIBRACIÓN REAL
          setTimeout(() => {
            setShowInfoPhase(false);
            setIsInfoActive(false);
            setIsCalibrating(true);
            setCalibrationTime(30); // 🔥 REINICIAR A 30 segundos
            hasCalibrationCompleted.current = false;
            
            // Iniciar calibración real
            startActualCalibration();
          }, 100);
          
          return 0;
        }
        
        return newTime;
      });
    }, 1000);
  };

  // 🔥 NUEVA FUNCIÓN SEPARADA PARA CALIBRACIÓN REAL
  const startActualCalibration = () => {
    print("⏱️ Iniciando countdown de calibración REAL");
    
    // 🔥 ASEGURAR QUE NO HAY TIMERS PREVIOS
    clearAnyTimer();
    
    timerRef.current = setInterval(() => {
      setCalibrationTime((prevTime) => {
        const newTime = prevTime - 1;
        print(`⏱️ Calibration time remaining: ${newTime}s`);
        
        if (newTime <= 0) {
          // 🔥 LIMPIAR TIMER Y COMPLETAR CALIBRACIÓN
          clearAnyTimer();
          
          if (!hasCalibrationCompleted.current) {
            hasCalibrationCompleted.current = true;
            handleCalibrationComplete();
          }
          
          return 0;
        }
        
        return newTime;
      });
    }, 1000);
  };

  // 🔥 FUNCIÓN PARA SALTAR DIRECTAMENTE A CALIBRACIÓN
  const skipToCalibration = () => {
    print("⏭️ Saltando instrucciones - yendo directo a calibración");
    
    // 🔥 LIMPIAR CUALQUIER TIMER ACTIVO
    clearAnyTimer();
    
    // Cambiar estados
    setShowInfoPhase(false);
    setIsInfoActive(false);
    setIsCalibrating(true);
    setCalibrationTime(30); // 🔥 REINICIAR A 30 segundos
    hasCalibrationCompleted.current = false;
    
    // 🔥 INICIAR CALIBRACIÓN REAL INMEDIATAMENTE
    setTimeout(() => {
      startActualCalibration();
    }, 100);
  };

  const handleCalibrationComplete = () => {
    print("⏱️ Calibración completada → capturando baseline");
    setIsCalibrating(false);
    
    // Pequeño delay para asegurar que todos los datos lleguen
    setTimeout(() => {
      try {
        print("📊 Ejecutando captureRestData...");
        const rest = captureRestData();
        print("📊 Baseline capturado:", {
          eeg: rest?.eeg?.length || 0,
          ppg: rest?.ppg?.length || 0,
          hr: rest?.hr?.length || 0,
        });
        
        setCalibrationComplete(true);
        setShowNeutralPoint(false);
      } catch (err) {
        printError("❌ Error en captureRestData:", err);
      }
    }, 500);
  };

  // 🔥 CLEANUP MEJORADO
  useEffect(() => {
    return () => {
      clearAnyTimer();
      disconnect();
    };
  }, [disconnect]);

  // 🔥 RESET MEJORADO CUANDO CAMBIA DE PARTICIPANTE
  useEffect(() => {
    print("🔄 Reseteando para nuevo participante:", participant.id);
    
    // Limpiar timers
    clearAnyTimer();
    
    // Reset de estados
    setConnectionPhase(true);
    setShowInfoPhase(false);
    setIsInfoActive(false);
    setCalibrationTime(30);
    setInfoTime(10);
    setCalibrationComplete(false);
    setShowNeutralPoint(false);
    setIsCalibrating(false);
    hasCalibrationCompleted.current = false;
  }, [participant.id]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Calibration - {participant.name}</h2>
      
      {connectionPhase ? (
        // Device Connection Phase
        <div>
          <p className="text-gray-600 mb-6">Please connect and position the Muse 2 headset to continue.</p>
          
          <div className="bg-white border rounded-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-44 h-44 relative">
                  <div className="absolute w-32 h-8 bg-gray-700 rounded-full top-20 left-6"></div>
                  <div className="absolute w-8 h-16 bg-gray-700 rounded-md left-6 top-12"></div>
                  <div className="absolute w-8 h-16 bg-gray-700 rounded-md right-6 top-12"></div>
                  
                  <div className="absolute w-4 h-4 rounded-full top-20 left-10 animate-pulse" 
                    style={{
                      backgroundColor: 
                        connectionStatus === "connected" ? "#10b981" : 
                        connectionStatus === "connecting" ? "#f59e0b" : 
                        connectionStatus === "error" ? "#ef4444" : "#6b7280"
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="flex-grow">
                <h3 className="text-lg font-medium mb-3">Muse 2 Headset</h3>
                
                <div className="flex items-center mb-3">
                  <Bluetooth className="h-5 w-5 mr-2 text-blue-500" />
                  <span className="font-medium mr-2">Connection:</span>
                  <span className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${connectionStatus === "disconnected" ? "bg-gray-100 text-gray-700" : ""}
                    ${connectionStatus === "connecting" ? "bg-yellow-100 text-yellow-700 animate-pulse" : ""}
                    ${connectionStatus === "connected" ? "bg-green-100 text-green-700" : ""}
                    ${connectionStatus === "error" ? "bg-red-100 text-red-700" : ""}
                  `}>
                    {connectionStatus === "disconnected" && "Not Connected"}
                    {connectionStatus === "connecting" && "Connecting..."}
                    {connectionStatus === "connected" && "Connected"}
                    {connectionStatus === "error" && "Connection Error"}
                  </span>
                </div>
                
                {connectionStatus === "connected" && (
                  <div className="flex items-center mb-3">
                    <Brain className="h-5 w-5 mr-2 text-purple-500" />
                    <span className="font-medium mr-2">Signal Quality:</span>
                    <span className={`
                      px-2 py-1 rounded-full text-xs font-medium
                      ${signalQuality === "poor" ? "bg-red-100 text-red-700" : ""}
                      ${signalQuality === "fair" ? "bg-yellow-100 text-yellow-700" : ""}
                      ${signalQuality === "good" ? "bg-green-100 text-green-700" : ""}
                      ${signalQuality === "excellent" ? "bg-emerald-100 text-emerald-700" : ""}
                    `}>
                      {signalQuality.charAt(0).toUpperCase() + signalQuality.slice(1)}
                    </span>
                  </div>
                )}
                
                {/* Error Display */}
                {connectError && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div className="flex-grow">
                        <p className="text-sm text-red-700 mb-2">{connectError}</p>
                        <Button 
                          onClick={() => setConnectError(null)} 
                          variant="outline" 
                          size="sm"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          Try Again
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mt-4">
                  {connectionStatus !== "connected" && (
                    <Button 
                      onClick={handleConnect} 
                      disabled={connectionStatus === "connecting"} 
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {connectionStatus === "connecting" ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Connecting...
                        </>
                      ) : (
                        "Connect Muse Headset"
                      )}
                    </Button>
                  )}
                  
                  {connectionStatus === "connected" && (
                    <div className="flex space-x-3">
                      <Button 
                        onClick={() => disconnect()} 
                        variant="outline"
                      >
                        Disconnect
                      </Button>
                      
                      <Button 
                        onClick={startCalibration} 
                        disabled={signalQuality === "poor"} 
                        className="bg-[#4a2b4a] text-white hover:bg-[#694969]"
                      >
                        {signalQuality === "poor" 
                          ? "Improve Signal Quality First" 
                          : "Begin Calibration"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* 🔥 BRAINWAVE VISUALIZER AL LADO DERECHO */}
              {connectionStatus === "connected" && (
                <div className="flex-shrink-0 w-full md:w-80">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">EEG Signal Preview</h4>
                  <div className="bg-gray-50 rounded-lg p-4 h-48">
                    <BrainwaveVisualizer eegData={eegData} />
                  </div>
                </div>
              )}
            </div>
            
            {connectionStatus === "connected" && signalQuality !== "poor" && (
              <div className="mt-6 pt-4 border-t">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Ready for Calibration</h4>
                    <p className="text-sm text-gray-600">
                      The Muse headset is properly connected and showing good signal quality. 
                      You're ready to begin the baseline calibration process.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : showInfoPhase ? (
        // 🔥 NUEVA FASE INFORMATIVA ANTES DE CALIBRACIÓN
        <div className="text-center">
          <div className="max-w-2xl mx-auto">
            <div className="w-32 h-32 rounded-full bg-blue-50 flex items-center justify-center mb-6 mx-auto">
              <Brain className="h-16 w-16 text-blue-600" />
            </div>
            
            <h3 className="text-2xl font-semibold mb-6 text-gray-900">
              Baseline Calibration Setup
            </h3>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <p className="text-lg text-blue-900 leading-relaxed mb-4">
                We need to establish your baseline biometric readings in a relaxed state. 
                This helps us accurately measure changes during task evaluation.
              </p>
              
              <div className="text-sm text-blue-700 space-y-2">
                <p>
                  <strong>What to do:</strong> Sit comfortably, breathe normally, and try to relax
                </p>
                <p>
                  <strong>Duration:</strong> 30 seconds of quiet baseline recording
                </p>
                <p>
                  <strong>Tip:</strong> Close your eyes and think of something peaceful
                </p>
              </div>
            </div>
            
            <div className="text-6xl font-bold text-blue-600 mb-4">{infoTime}s</div>
            
            <p className="text-gray-600 mb-6">
              Calibration will begin automatically when the countdown reaches zero.
            </p>
            
            {/* 🔥 BOTÓN DE SKIP MEJORADO */}
            <Button 
              onClick={skipToCalibration}
              className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2"
            >
              Skip Instructions - Start Calibration Now
            </Button>
            
            <div className="mt-4 text-sm text-gray-500">
              Click above if you're familiar with the calibration process
            </div>
          </div>
        </div>
      ) : (
        // Calibration Phase
        <div>
          <p className="text-gray-600 mb-6">Maintain a relaxed posture and breathe normally for {calibrationTime} seconds.</p>
          
          <div className="flex flex-col items-center mb-8">
            <div className="w-32 h-32 rounded-full bg-[#f0e6f0] flex items-center justify-center mb-4">
              <Waves className="h-16 w-16 text-[#4a2b4a]" />
            </div>

            <div className="text-4xl font-bold mb-4">{calibrationTime}s</div>
            
            {/* {isCalibrating && (
              <div className="w-full max-w-md bg-white p-4 rounded-lg mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Live EEG Data</h4>
                <BrainwaveVisualizer eegData={eegData} />
              </div>
            )} */}

            {showNeutralPoint && (
              <div className="w-full max-w-md">
                <h3 className="text-lg font-medium mb-4 text-center">This is your neutral point</h3>
                <EmotionWheel showNeutralPoint={true} />
              </div>
            )}

            {calibrationComplete && (
              <Button className="bg-[#4a2b4a] text-white hover:bg-[#694969] mt-4" onClick={onComplete}>
                Start task evaluation
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
