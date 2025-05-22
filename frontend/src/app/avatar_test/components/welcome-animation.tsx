import { useRef, useEffect, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import { motion } from "framer-motion";
import * as THREE from "three";
import { useRouter } from 'next/navigation';

type Phase = "walk" | "waitRight" | "return" | "expression";

function AvatarSequence({
  avatarUrl,
  gender,
  walkAnimUrl,
  jogAnimUrl,
  expressionAnimUrl,
  onLoad
}: {
  avatarUrl: string;
  gender: string;
  walkAnimUrl: string;
  jogAnimUrl: string;
  expressionAnimUrl: string;
  onLoad?: () => void;
}) {
  const group = useRef<THREE.Group>(null!);
  const [isLoaded, setIsLoaded] = useState(false);
  const [phase, setPhase] = useState<Phase>("walk");
  const [avatarX, setAvatarX] = useState(-2);

  // Precarga de modelos
  const avatarGltf = useGLTF(avatarUrl);
  const walkGltf = useGLTF(walkAnimUrl);
  const jogGltf = useGLTF(jogAnimUrl);
  const expressionGltf = useGLTF(expressionAnimUrl);

  const { actions: walkActions } = useAnimations(walkGltf.animations, group);
  const { actions: jogActions } = useAnimations(jogGltf.animations, group);
  const { actions: exprActions } = useAnimations(expressionGltf.animations, group);

  // Verificar que todo esté cargado antes de iniciar
  useEffect(() => {
    Promise.all([
      new Promise(resolve => {
        if (avatarGltf.scene) resolve(true);
      }),
      new Promise(resolve => {
        if (walkGltf.animations.length > 0) resolve(true);
      }),
      new Promise(resolve => {
        if (jogGltf.animations.length > 0) resolve(true);
      }),
      new Promise(resolve => {
        if (expressionGltf.animations.length > 0) resolve(true);
      })
    ]).then(() => {
      setIsLoaded(true);
      onLoad?.();
    });
  }, [avatarGltf, walkGltf, jogGltf, expressionGltf, onLoad]);

  // Solo ejecutar animaciones cuando todo esté cargado
  useEffect(() => {
    if (!isLoaded) return;

    // Detener todas las animaciones actuales
    Object.values(walkActions).forEach((a) => a && a.stop());
    Object.values(jogActions).forEach((a) => a && a.stop());
    Object.values(exprActions).forEach((a) => a && a.stop());

    const safeGender = gender?.toLowerCase() === "feminine" ? "F" : "M";
    const genderVersion = safeGender === "F" ? "001" : "002";

    // Construir los nombres de las animaciones basados en el género
    const walkAnimName = `${safeGender}_Walk_Strafe_Left_${genderVersion}`;
    const jogAnimName = `${safeGender}_Walk_Strafe_Right_${genderVersion}`;

    // La animación de expresión siempre es la misma
    const exprAnimName = "M_Standing_Expressions_001";

    console.log("Usando animaciones:", { walkAnimName, jogAnimName, exprAnimName });

    if (phase === "walk") {
      walkActions[walkAnimName]
        ?.reset()
        .fadeIn(0.3)
        .play();
    } else if (phase === "return") {
      jogActions[jogAnimName]
        ?.reset()
        .fadeIn(0.3)
        .play();
    } else if (phase === "expression") {
      exprActions[exprAnimName]
        ?.reset()
        .setLoop(THREE.LoopOnce, 1)
        .fadeIn(0.3)
        .play();
      if (exprActions[exprAnimName]) {
        exprActions[exprAnimName].clampWhenFinished = true;
      }
    }
  }, [phase, walkActions, jogActions, exprActions, isLoaded, gender]);

  // Controla el movimiento y las fases
  useFrame((_, delta) => {
    if (phase === "walk") {
      setAvatarX((x) => {
        const next = x + delta * 1;
        // console.log("Avatar X:", next);
        if (next >= -0.09) {
          setPhase("waitRight");
          return 2;
        }
        return next;
      });
    } else if (phase === "waitRight") {
      // Espera 2 segundos y luego cambia a "return"
      setTimeout(() => setPhase("return"), 2000);
      // Solo ejecuta el timeout una vez
      setPhase("waiting"); // Fase temporal para evitar múltiples timeouts
    } else if (phase === "return") {
      console.log("Inicio en:", avatarX);
      setAvatarX((x) => {
        const next = x - delta * 1;
        console.log("Avatar X:", x);
        if (next <= 1.5) {
          setPhase("expression");
          return 0;
        }
        return next;
      });
    }
    // Cuando está en "expression", no mueve más el avatar
  });

  // Solo renderizar cuando esté cargado
  return (
    <group ref={group} dispose={null}>
      {isLoaded && phase !== "waitRight" && phase !== "waiting" && (
        <primitive
          object={avatarGltf.scene}
          scale={1.5}
          position={[avatarX, -2.2, 0]}
        />
      )}
    </group>
  );
}

const WelcomeText = ({ isVisible }: { isVisible: boolean }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.2
      }
    }
  };

  const textVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const logoVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.8,
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
            src="/img/logoAlone.png" 
            alt="Raices Logo" 
            className="h-[100px] w-auto object-contain"
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default function WelcomeAnimation({ 
  avatarUrl,
  gender = "masculine" // Por defecto usamos masculine
}: { 
  avatarUrl: string;
  gender?: string;
}) {
  const [showWelcome, setShowWelcome] = useState(false);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const router = useRouter();

  const safeGender = gender?.toLowerCase() === "feminine" ? "F" : "M";
  
  // Determinar qué versión de animación usar según el género
  const versionGender = safeGender === "F" ? "001" : "002";

  console.log("Género detectado:", safeGender, "- Usando versión:", versionGender);

  useEffect(() => {
    if (assetsLoaded) {
      const timer = setTimeout(() => {
        setShowWelcome(true);
      }, 4000);

      const navigationTimer = setTimeout(() => {
        router.push('/projects');
      }, 8000);

      return () => {
        clearTimeout(timer);
        clearTimeout(navigationTimer);
      };
    }
  }, [router, assetsLoaded]);

  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="relative">
        <WelcomeText isVisible={showWelcome} />
        <div
          className="rounded-full shadow-lg bg-white flex items-center justify-center"
          style={{
            width: 320,
            height: 320,
            border: "8px solid #EBE5EB",
            boxShadow: "0 8px 32px rgba(74,43,74,0.10)",
            overflow: "hidden",
          }}
        >
          <Canvas camera={{ position: [0, 0.3, 3.5], fov: 30 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[2, 5, 2]} intensity={1} />
            <Suspense fallback={null}>
              <AvatarSequence
                avatarUrl={avatarUrl}
                gender={safeGender}
                walkAnimUrl={`/animation/avatarAnimations/locomotion/${safeGender}_Walk_Strafe_Left_${versionGender}.glb`}
                jogAnimUrl={`/animation/avatarAnimations/locomotion/${safeGender}_Walk_Strafe_Right_${versionGender}.glb`}
                expressionAnimUrl={`/animation/avatarAnimations/expression/M_Standing_Expressions_001.glb`}
                onLoad={() => setAssetsLoaded(true)}
              />
            </Suspense>
          </Canvas>
        </div>
      </div>
    </div>
  );
}