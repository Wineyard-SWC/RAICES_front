import { useRef, useEffect, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import { motion } from "framer-motion";
import * as THREE from "three";
import { useRouter } from 'next/navigation';
import { print } from "@/utils/debugLogger";

function SimpleAvatarGreeting({
  avatarUrl,
  gender,
  expressionAnimUrl,
  onLoad
}: {
  avatarUrl: string;
  gender: string;
  expressionAnimUrl: string;
  onLoad?: () => void;
}) {
  const group = useRef<THREE.Group>(null!);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);

  // Prefijo según género
  const prefix = gender === "F" ? "F" : "M";

  // 🔥 CARGAR IDLE Y EXPRESIÓN SEPARADAMENTE
  const avatarGltf = useGLTF(avatarUrl);
  const idlePath = `/animation/avatarAnimations/idle/${prefix}_Standing_Idle_001.glb`;
  const idleGltf = useGLTF(idlePath);
  const expressionGltf = useGLTF(expressionAnimUrl);

  // 🔥 COMBINAR TODAS LAS ANIMACIONES
  const allClips = [
    ...idleGltf.animations,
    ...expressionGltf.animations
  ];

  const { actions } = useAnimations(allClips, group);

  // 🔥 INICIAR IDLE INMEDIATAMENTE CUANDO LAS ACCIONES ESTÉN LISTAS
  useEffect(() => {
    if (!actions) return;

    const idleName = `${prefix}_Standing_Idle_001`;
    const idleAction = actions[idleName];

    if (idleAction) {
      // 🔥 EMPEZAR IDLE INMEDIATAMENTE PARA EVITAR T-POSE
      idleAction
        .reset()
        .setLoop(THREE.LoopRepeat, Infinity)
        .play();
      
      print("🎬 Started idle animation immediately:", idleName);
    }
  }, [actions, prefix]);

  // 🔥 VERIFICAR QUE TODO ESTÉ CARGADO
  useEffect(() => {
    const checkAssetsLoaded = () => {
      if (avatarGltf.scene && idleGltf.animations.length > 0 && expressionGltf.animations.length > 0) {
        print("✅ Avatar, idle y expresiones cargados completamente");
        setIsLoaded(true);
        onLoad?.();
        
        // 🔥 ESPERAR 3 SEGUNDOS ANTES DE HACER EL SALUDO
        setTimeout(() => {
          setShowGreeting(true);
        }, 3000);
      }
    };

    // Verificar inmediatamente y también después de un pequeño delay
    checkAssetsLoaded();
    const timer = setTimeout(checkAssetsLoaded, 100);
    
    return () => clearTimeout(timer);
  }, [avatarGltf, idleGltf, expressionGltf, onLoad]);

  // 🔥 EJECUTAR ANIMACIÓN DE SALUDO CUANDO SEA EL MOMENTO
  useEffect(() => {
    if (!isLoaded || !showGreeting || !actions) return;

    const idleName = `${prefix}_Standing_Idle_001`;
    const exprAnimName = "M_Standing_Expressions_001"; // Siempre usar masculino para expresiones
    
    const idleAction = actions[idleName];
    const greetingAction = actions[exprAnimName];

    if (greetingAction && idleAction) {
      print("🎭 Ejecutando animación de saludo:", exprAnimName);
      
      // 🔥 HACER CROSSFADE DEL IDLE A EXPRESIÓN
      idleAction.fadeOut(0.5);
      
      greetingAction
        .reset()
        .setLoop(THREE.LoopOnce, 1)
        .fadeIn(0.5)
        .play();
      greetingAction.clampWhenFinished = true;

      // 🔥 VOLVER AL IDLE DESPUÉS DE LA EXPRESIÓN
      const durationMs = (greetingAction.getClip().duration || 3) * 1000;
      
      setTimeout(() => {
        greetingAction.fadeOut(0.5);
        idleAction
          .reset()
          .setLoop(THREE.LoopRepeat, Infinity)
          .fadeIn(0.5)
          .play();
        
        print("🔄 Volviendo al idle después del saludo");
      }, durationMs + 200);
    }
  }, [showGreeting, actions, isLoaded, prefix]);

  // 🔥 MOSTRAR AVATAR SIEMPRE, PERO MARCAR COMO CARGADO CUANDO ESTÉ LISTO
  return (
    <group ref={group} dispose={null}>
      <primitive
        object={avatarGltf.scene}
        scale={1.5}
        position={[0, -2.2, 0]}
      />
    </group>
  );
}

const WelcomeText = ({ isVisible }: { isVisible: boolean }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.8,
        staggerChildren: 0.3
      }
    }
  };

  const textVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 1,
        ease: "easeOut"
      }
    }
  };

  const logoVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 1,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      className="absolute top-[-120px] left-1/2 transform -translate-x-1/2 w-full text-center"
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={containerVariants}
    >
      <div className="flex items-center justify-center gap-6">
        <motion.h1 
          className="text-5xl font-bold whitespace-nowrap"
          style={{ color: '#4A2B4A' }}
          variants={textVariants}
        >
          Welcome to RAICES
        </motion.h1>
        <motion.div 
          variants={logoVariants}
          className="flex-shrink-0"
        >
          <img 
            src="/img/LogoAlone.png" 
            alt="Raices Logo" 
            className="h-[100px] w-auto object-contain"
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

// 🔥 COMPONENTE DE LOADING MÁS SUTIL
const LoadingSpinner = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4A2B4A]"></div>
  </div>
);

export default function WelcomeAnimation({ 
  avatarUrl,
  gender = "masculine" 
}: { 
  avatarUrl: string;
  gender?: string;
}) {
  const [showWelcome, setShowWelcome] = useState(false);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const router = useRouter();

  // Normalizar el género
  const normalizedGender = gender?.toLowerCase() === "feminine" ? "feminine" : "masculine";
  const safeGender = normalizedGender === "feminine" ? "F" : "M";

  print("🎭 Género recibido:", gender, "-> Usando:", safeGender);

  // 🔥 TIMELINE SIMPLIFICADO
  useEffect(() => {
    if (assetsLoaded) {
      // Mostrar texto de bienvenida después de que cargue
      const welcomeTimer = setTimeout(() => {
        setShowWelcome(true);
      }, 1000);

      // Navegar después de completar la animación
      const navigationTimer = setTimeout(() => {
        router.push('/projects');
      }, 8000); // 🔥 AUMENTADO: 8 segundos para ver el saludo completo

      return () => {
        clearTimeout(welcomeTimer);
        clearTimeout(navigationTimer);
      };
    }
  }, [router, assetsLoaded]);

  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="relative">
        <WelcomeText isVisible={showWelcome} />
        <div
          className="rounded-full shadow-lg bg-white flex items-center justify-center relative"
          style={{
            width: 320,
            height: 320,
            border: "8px solid #EBE5EB",
            boxShadow: "0 8px 32px rgba(74,43,74,0.10)",
            overflow: "hidden",
          }}
        >
          {/* 🔥 LOADING SPINNER SOLO CUANDO NO ESTÁ CARGADO */}
          {!assetsLoaded && <LoadingSpinner />}
          
          {/* 🔥 CANVAS SIEMPRE VISIBLE */}
          <Canvas camera={{ position: [0, 0.3, 3.5], fov: 30 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[2, 5, 2]} intensity={1} />
            <Suspense fallback={null}>
              <SimpleAvatarGreeting
                avatarUrl={avatarUrl}
                gender={safeGender}
                expressionAnimUrl={`/animation/avatarAnimations/expression/M_Standing_Expressions_001.glb`}
                onLoad={() => {
                  print("🎉 Assets completamente cargados, ocultando spinner");
                  setAssetsLoaded(true);
                }}
              />
            </Suspense>
          </Canvas>
        </div>
        
        {/* 🔥 INDICADOR DE PROGRESO */}
        {!assetsLoaded && (
          <div className="absolute bottom-[-60px] left-1/2 transform -translate-x-1/2 text-center">
            <p className="text-[#4A2B4A] text-sm animate-pulse">Loading your avatar...</p>
          </div>
        )}
      </div>
    </div>
  );
}