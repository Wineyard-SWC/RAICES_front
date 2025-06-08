"use client";

import { useEffect, useState, useRef } from "react";
import { useProjectUsers } from "@/contexts/ProjectusersContext";
import { Canvas } from "@react-three/fiber";
import { useGLTF, useAnimations, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import MemberInfoPanel from "./MemberInfoPanel"; // 🔥 IMPORTACIÓN CORRECTA
import { useTeamMood } from "@/hooks/useTeamMood";
import { useAvatarEmotions } from "../hooks/useAvatarEmotions";

// Animaciones categorizadas por género
const ANIMATION_PATHS = {
  feminine: [
    "/animation/avatarAnimations/idle/F_Standing_Idle_001.glb",
    "/animation/avatarAnimations/idle/F_Standing_Idle_Variations_001.glb",
    "/animation/avatarAnimations/idle/F_Standing_Idle_Variations_002.glb",
    "/animation/avatarAnimations/idle/F_Standing_Idle_Variations_003.glb",
    "/animation/avatarAnimations/idle/F_Standing_Idle_Variations_004.glb",
  ],
  masculine: [
    "/animation/avatarAnimations/idle/M_Standing_Idle_001.glb",
    "/animation/avatarAnimations/idle/M_Standing_Idle_002.glb",
    "/animation/avatarAnimations/idle/M_Standing_Idle_Variations_001.glb",
    "/animation/avatarAnimations/idle/M_Standing_Idle_Variations_002.glb",
    "/animation/avatarAnimations/idle/M_Standing_Idle_Variations_003.glb",
  ]
};

// Componente de avatar con animaciones
function AnimatedTeamAvatar({ 
  member, 
  memberMood, 
  position, 
  minDelay, 
  maxDelay, 
  idleTime, 
  selectedId, 
  setSelectedId, 
  isSelected,
  memberIndex,
  totalMembers
}) {
  const group = useRef();
  const prefix = member.gender === 'female' ? 'F' : 'M';
  const idlePath = `/animation/avatarAnimations/idle/${prefix}_Standing_Idle_001.glb`;

  // Carga del modelo y animaciones
  const avatarGltf = useGLTF(member.avatarUrl);
  const idleGltf = useGLTF(idlePath);
  const variationPaths = member.gender === 'female'
    ? ANIMATION_PATHS.feminine.slice(1)
    : ANIMATION_PATHS.masculine.slice(2);
  const variationGltfs = variationPaths.map(path => useGLTF(path));
  const allClips = [
    ...idleGltf.animations,
    ...variationGltfs.flatMap(g => g.animations)
  ];
  const { actions } = useAnimations(allClips, group);

  // 🔥 APLICAR EMOCIONES AL AVATAR
  const emotion = memberMood?.mostCommonEmotion || 'neutral';
  const emotionIntensity = memberMood?.sessionCount > 0 ? 0.6 : 0.3; // Mayor intensidad si hay datos
  useAvatarEmotions(avatarGltf.scene, emotion, emotionIntensity);

  // Efectos de animación
  useEffect(() => {
    if (!actions) return;
    const idleName = `${prefix}_Standing_Idle_001`;
    const specialNames = Object.keys(actions).filter(
      name => name !== idleName && name.includes(prefix)
    );
    let timer;

    function playVariation() {
      if (!specialNames.length) return;
      const variation = specialNames[Math.floor(Math.random() * specialNames.length)];
      const varAction = actions[variation];
      const idleAction = actions[idleName];
      if (!varAction || !idleAction) return;
      
      idleAction.fadeOut(0.5);
      varAction.reset().setLoop(THREE.LoopOnce, 1).clampWhenFinished = true;
      varAction.fadeIn(0.5).play();
      
      const durationMs = (varAction.getClip().duration || 3) * 1000;
      timer = setTimeout(() => {
        varAction.fadeOut(0.5);
        idleAction.reset().setLoop(THREE.LoopRepeat, Infinity).fadeIn(0.5).play();
        timer = setTimeout(playVariation, idleTime);
      }, durationMs + 200);
    }

    const idleAction = actions[idleName];
    if (idleAction) {
      idleAction.reset().setLoop(THREE.LoopRepeat, Infinity).play();
      const initialDelay = minDelay + Math.random() * (maxDelay - minDelay);
      timer = setTimeout(playVariation, initialDelay);
    }

    return () => clearTimeout(timer);
  }, [actions, prefix, minDelay, maxDelay, idleTime]);

  // Animación de zoom cuando es seleccionado
  useEffect(() => {
    if (!group.current) return;
    
    const targetScale = isSelected ? 1.8 : 1.4;
    const targetY = isSelected ? 0.3 : 0;
    
    let frame;
    const animate = () => {
      if (group.current) {
        const currentScale = group.current.scale.x;
        const currentY = group.current.position.y;
        
        const scaleStep = (targetScale - currentScale) * 0.1;
        const yStep = (targetY - currentY) * 0.1;
        
        if (Math.abs(scaleStep) > 0.01 || Math.abs(yStep) > 0.01) {
          group.current.scale.setScalar(currentScale + scaleStep);
          group.current.position.y = currentY + yStep;
          frame = requestAnimationFrame(animate);
        }
      }
    };
    
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isSelected]);

  // 🔥 CALCULAR POSICIÓN INTELIGENTE DEL PANEL (MÁS CERCA)
  const getPanelPosition = () => {
    const [avatarX, y, z] = position;
    
    // Distancia aún más corta del panel al avatar
    const panelDistance = 1.4; // 🔥 REDUCIDO de 1.8 a 1.4
    
    // Determinar lado basado en la posición X del avatar
    if (avatarX > 1.5) {
      // Avatar en el lado derecho -> panel a la izquierda
      return [-panelDistance, 0.2, 0]; // 🔥 Y reducido de 0.5 a 0.2
    } else if (avatarX < -1.5) {
      // Avatar en el lado izquierdo -> panel a la derecha  
      return [panelDistance, 0.2, 0];
    } else {
      // Avatar en el centro -> panel a la derecha por defecto
      return [panelDistance, 0.2, 0];
    }
  };

  return (
    <group ref={group} position={[position[0], position[1], position[2]]}>
      {/* Avatar con emociones aplicadas */}
      <primitive object={avatarGltf.scene} scale={1.4} position={[0, -1.65, 0]} />
      
      {/* Círculo base clickeable */}
      <mesh 
        rotation={[-Math.PI/2, 0, 0]} 
        position={[0, -1.65, 0]}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedId(selectedId === member.id ? null : member.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'default';
        }}
      >
        <circleGeometry args={[0.75, 32]} />
        <meshStandardMaterial 
          color={isSelected ? "#c7a0b8" : "#4a2b4a"} 
          opacity={isSelected ? 0.4 : 0.25} 
          transparent 
        />
      </mesh>

      {/* 🔥 PANEL DE INFORMACIÓN MÁS CERCA DEL AVATAR */}
      {isSelected && (
        <MemberInfoPanel 
          member={member}
          memberMood={memberMood}
          position={getPanelPosition()} // 🔥 POSICIÓN MEJORADA
        />
      )}
    </group>
  );
}

// Componente principal
export default function TeamAvatarsDisplay({ teamId, teamMembers, projectId, preloadedUsers = false }) {
  const { loadUsersIfNeeded, getUsersForProject } = useProjectUsers();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const cameraRef = useRef(); // 🔥 NUEVA REF PARA LA CÁMARA
  
  // Obtener datos de mood real
  const { teamMood, loading: moodLoading } = useTeamMood(teamMembers || [], projectId);

  // Carga y enriquecimiento de datos (sin cambios)
  useEffect(() => {
    if (!projectId || !teamMembers?.length) return setLoading(false);
    (async () => {
      setLoading(true);
      const users = preloadedUsers
        ? getUsersForProject(projectId)
        : await loadUsersIfNeeded(projectId);
      const enriched = teamMembers.map(m => {
        const u = users.find(u => u.userRef === m.id || u.name.toLowerCase() === m.name.toLowerCase());
        return {
          ...m,
          avatarUrl: u?.avatarUrl,
          gender: u?.gender,
        };
      });
      setMembers(enriched);
      setLoading(false);
    })();
  }, [projectId, teamMembers, preloadedUsers]);

  // 🔥 EFECTO PARA MOVER LA CÁMARA CUANDO SE SELECCIONA UN AVATAR (SIMPLIFICADO)
  useEffect(() => {
    if (!cameraRef.current || !selectedId || !members.length) return;

    const selectedIndex = members.findIndex(m => m.id === selectedId);
    const count = members.length;
    const radius = Math.max(count * 0.7, 3);
    const arc = Math.min(Math.PI, Math.PI * 0.7 + count * 0.05);
    const angle = Math.PI/2 - arc/2 + (arc * selectedIndex/(count-1 || 1));
    const x = Math.cos(angle) * radius;

    // 🔥 MOVIMIENTO MÍNIMO DE CÁMARA - Solo en X para centrar mejor
    let targetCameraX = 0;
    let targetCameraZ = 7; // Mantener Z fijo
    
    // Movimiento más sutil
    if (x > 3) {
      targetCameraX = -1; // 🔥 REDUCIDO de -2 a -1
    } else if (x < -3) {
      targetCameraX = 1;  // 🔥 REDUCIDO de 2 a 1
    }

    // Animación más rápida y suave
    let frame;
    const animateCamera = () => {
      if (cameraRef.current) {
        const currentX = cameraRef.current.position.x;
        const currentZ = cameraRef.current.position.z;
        
        const stepX = (targetCameraX - currentX) * 0.08; // 🔥 MÁS RÁPIDO: 0.05 -> 0.08
        const stepZ = (targetCameraZ - currentZ) * 0.08;
        
        if (Math.abs(stepX) > 0.005 || Math.abs(stepZ) > 0.005) { // 🔥 UMBRAL MÁS BAJO
          cameraRef.current.position.x = currentX + stepX;
          cameraRef.current.position.z = currentZ + stepZ;
          frame = requestAnimationFrame(animateCamera);
        }
      }
    };
    
    frame = requestAnimationFrame(animateCamera);
    return () => cancelAnimationFrame(frame);
  }, [selectedId, members]);

  // 🔥 EFECTO PARA RESETEAR LA CÁMARA (SIMPLIFICADO)
  useEffect(() => {
    if (!cameraRef.current || selectedId) return;

    // Volver a posición original más rápido
    let frame;
    const resetCamera = () => {
      if (cameraRef.current) {
        const currentX = cameraRef.current.position.x;
        const currentZ = cameraRef.current.position.z;
        
        const stepX = (0 - currentX) * 0.08; // 🔥 MÁS RÁPIDO
        const stepZ = (7 - currentZ) * 0.08;
        
        if (Math.abs(stepX) > 0.005 || Math.abs(stepZ) > 0.005) {
          cameraRef.current.position.x = currentX + stepX;
          cameraRef.current.position.z = currentZ + stepZ;
          frame = requestAnimationFrame(resetCamera);
        }
      }
    };
    
    frame = requestAnimationFrame(resetCamera);
    return () => cancelAnimationFrame(frame);
  }, [selectedId]);

  if (loading || moodLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4a2b4a]"></div>
        <p className="ml-3 text-lg text-[#4a2b4a]">Loading team avatars...</p>
      </div>
    );
  }

  return (
    <div className="pb-8">
      <div className="flex justify-between items-center mb-6 p-6">
        <h2 className="text-2xl font-bold text-[#1e1e1e] flex items-center">
          Team Members
          {selectedId && (
            <span className="ml-3 text-sm font-normal text-gray-500">
              Click avatar base to view details
            </span>
          )}
        </h2>
        {selectedId && (
          <button
            onClick={() => setSelectedId(null)}
            className="text-sm text-[#4a2b4a] hover:text-[#694969] font-medium"
          >
            Clear Selection
          </button>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="w-full h-[500px]">
          <Canvas dpr={[1, 2]} shadows>
            <ambientLight intensity={0.7} />
            <directionalLight intensity={1} position={[5, 10, 5]} />
            {/* 🔥 CÁMARA CON REF PARA CONTROLARLA */}
            <PerspectiveCamera 
              ref={cameraRef}
              makeDefault 
              position={[0, -0.5, 7]} 
              fov={45} 
            />

            {members.map((m, i) => {
              const count = members.length;
              const radius = Math.max(count * 0.7, 3);
              const arc = Math.min(Math.PI, Math.PI * 0.7 + count * 0.05);
              const angle = Math.PI/2 - arc/2 + (arc * i/(count-1 || 1));
              const x = Math.cos(angle) * radius;
              const z = Math.sin(angle) * radius * 0.6 - 2;
              
              // Encontrar datos de mood para este miembro
              const memberMood = teamMood?.memberMoods.find(mood => mood.memberId === m.id);
              
              return (
                <AnimatedTeamAvatar
                  key={m.id || i}
                  member={m}
                  memberMood={memberMood}
                  position={[x, 0, z]}
                  minDelay={2000 + i * 500}
                  maxDelay={5000 + i * 500}
                  idleTime={8000}
                  selectedId={selectedId}
                  setSelectedId={setSelectedId}
                  isSelected={selectedId === m.id}
                  memberIndex={i} // 🔥 PASAR ÍNDICE PARA POSICIONAMIENTO INTELIGENTE
                  totalMembers={count} // 🔥 PASAR TOTAL PARA CÁLCULOS
                />
              );
            })}
          </Canvas>
        </div>
      </div>
    </div>
  );
}
