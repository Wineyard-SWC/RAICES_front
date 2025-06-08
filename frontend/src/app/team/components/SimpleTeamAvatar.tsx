"use client";

import { useEffect, useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, useAnimations, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { useAvatarEmotions } from "../hooks/useAvatarEmotions"; // 🔥 NUEVO IMPORT
import { useTeamMood } from "@/hooks/useTeamMood";

// Animaciones categorizadas por género (mismo que TeamAvatarDisplay)
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

// Componente de avatar simplificado (ahora con emociones)
function SimpleTeamAvatar({ member, memberMood, position, minDelay, maxDelay, idleTime }) { // 🔥 AGREGADO: memberMood
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
  const emotionIntensity = memberMood?.sessionCount > 0 ? 0.5 : 0.3; // Intensidad más sutil para vista simple
  useAvatarEmotions(avatarGltf.scene, emotion, emotionIntensity);

  // Sistema de animaciones (mismo que TeamAvatarDisplay pero simplificado)
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

  return (
    <group ref={group} position={position}>
      {/* Avatar más pequeño y compacto con emociones aplicadas */}
      <primitive object={avatarGltf.scene} scale={1.2} position={[0, -1.4, 0]} />
      
      {/* Círculo base más pequeño con color basado en mood */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -1.4, 0]}>  
        <circleGeometry args={[0.6, 32]} />
        <meshStandardMaterial 
          color={memberMood?.mood && memberMood.mood > 60 ? "#6db46d" : memberMood?.mood && memberMood.mood < 40 ? "#d16d6d" : "#4a2b4a"} // 🔥 COLOR BASADO EN MOOD
          opacity={0.2} 
          transparent 
        />
      </mesh>
    </group>
  );
}

// Componente principal actualizado
export default function ProjectTeamDisplay({ projectTeam, projectUsers }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const projectId = localStorage.getItem("currentProjectId"); // 🔥 NUEVO

  // 🔥 OBTENER DATOS DE MOOD PARA EL SIMPLE TEAM DISPLAY
  const teamMembers = projectTeam?.members || [];
  const { teamMood, loading: moodLoading } = useTeamMood(teamMembers, projectId);

  // Enriquecer datos de miembros
  useEffect(() => {
    if (!projectTeam?.members?.length || !projectUsers?.length) {
      setLoading(false);
      return;
    }

    const enriched = projectTeam.members.map(member => {
      const user = projectUsers.find(u => 
        u.userRef === member.id || u.name.toLowerCase() === member.name.toLowerCase()
      );
      return {
        ...member,
        avatarUrl: user?.avatarUrl,
        gender: user?.gender,
      };
    }).filter(member => member.avatarUrl); // Solo mostrar miembros con avatar

    setMembers(enriched);
    setLoading(false);
  }, [projectTeam, projectUsers]);

  if (loading || moodLoading) { // 🔥 INCLUIR moodLoading
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4a2b4a]"></div>
        <p className="ml-3 text-lg text-[#4a2b4a]">Loading team...</p>
      </div>
    );
  }

  if (!members.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="text-6xl mb-4">👥</div>
        <h3 className="text-xl font-semibold text-[#4a2b4a] mb-2">No Team Members</h3>
        <p className="text-gray-600">No avatars available for the project team.</p>
      </div>
    );
  }

  // 🔥 CALCULAR MOOD PROMEDIO DEL EQUIPO
  const averageTeamMood = teamMood?.averageMood || 50;
  const moodColor = averageTeamMood > 60 ? "text-green-600" : averageTeamMood < 40 ? "text-red-600" : "text-yellow-600";
  const moodEmoji = teamMood?.moodInterpretation?.emoji || "😐";

  return (
    <div className="bg-white rounded-lg shadow-md h-full">
      <div className="p-6">
        <div className="flex justify-between items-center mb-2"> {/* 🔥 NUEVO: header con mood */}
          <h2 className="text-2xl font-bold text-[#1e1e1e]">Project Team</h2>
        </div>
        <p className="text-gray-600 mb-6">{projectTeam.description}</p>
        
        {/* Stats rápidos */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-[#ebe5eb]/30 rounded-lg">
            <div className="text-2xl font-bold text-[#4a2b4a]">{members.length}</div>
            <div className="text-sm text-gray-600">Members</div>
          </div>
          <div className="text-center p-3 bg-[#ebe5eb]/30 rounded-lg">
            <div className="text-2xl font-bold text-[#4a2b4a]">
              {projectTeam.members.reduce((sum, member) => sum + (member.tasksCompleted || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Tasks Done</div>
          </div>
          <div className="text-center p-3 bg-[#ebe5eb]/30 rounded-lg">
            <div className="text-2xl font-bold text-[#4a2b4a]">
              {projectTeam.members.reduce((sum, member) => sum + (member.currentTasks || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Active Tasks</div>
          </div>
        </div>
      </div>

      {/* Canvas con avatares más compactos */}
      <div className="w-full h-[400px]">
        <Canvas dpr={[1, 2]} shadows>
          <ambientLight intensity={0.7} />
          <directionalLight intensity={1} position={[5, 10, 5]} />
          <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={30} />

          {members.map((member, i) => {
            const count = members.length;
            // Radio más pequeño para mayor compacidad
            const radius = Math.max(count * 0.5, 2.5);
            // Arco más cerrado para mayor unión
            const arc = Math.min(Math.PI * 0.8, Math.PI * 0.6 + count * 0.03);
            const angle = Math.PI/2 - arc/2 + (arc * i/(count-1 || 1));
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius * 0.5 - 1.5;

            // 🔥 ENCONTRAR DATOS DE MOOD PARA ESTE MIEMBRO
            const memberMood = teamMood?.memberMoods.find(mood => mood.memberId === member.id);

            return (
              <SimpleTeamAvatar
                key={member.id || i}
                member={member}
                memberMood={memberMood} // 🔥 PASAR DATOS DE MOOD
                position={[x, 0, z]}
                minDelay={1500 + i * 300}
                maxDelay={4000 + i * 300}
                idleTime={6000}
              />
            );
          })}
        </Canvas>
      </div>
    </div>
  );
}