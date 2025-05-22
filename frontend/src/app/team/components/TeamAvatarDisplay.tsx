"use client";

import { useEffect, useState, useRef } from "react";
import { useProjectUsers } from "@/contexts/ProjectusersContext";
import { Canvas } from "@react-three/fiber";
import { useGLTF, useAnimations, PerspectiveCamera, Html } from "@react-three/drei";
import * as THREE from "three";

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

// Emojis para tooltips
const EMOJIS = ["😊", "😄", "😁", "🙂", "😉", "😎", "🤩"];

// Componente de avatar con animaciones y tooltip
function AnimatedTeamAvatar({ member, position, minDelay, maxDelay, idleTime, hoveredId, setHoveredId }) {
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
    <group
      ref={group}
      position={position}
      onPointerOver={() => setHoveredId(member.id)}
      onPointerOut={() => setHoveredId(null)}>

      <primitive object={avatarGltf.scene} scale={1.4} position={[0, -1.65, 0]} />
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -1.65, 0]}>  
        <circleGeometry args={[0.75, 32]} />
        <meshStandardMaterial color="#672767" opacity={0.7} transparent />
      </mesh>

      {hoveredId === member.id && (
        <Html center distanceFactor={4} className="pointer-events-none">
          <div className="bg-white p-2 rounded shadow-md border">
            <div className="text-2xl mb-1">{member.emoji}</div>
            <div className="font-semibold text-[#4a2b4a]">{member.name}</div>
            <div className="text-sm text-[#694969]">{member.role}</div>
          </div>
        </Html>
      )}
    </group>
  );
}

// Componente principal
export default function TeamAvatarsDisplay({ teamId, teamMembers, projectId, preloadedUsers = false }) {
  const { loadUsersIfNeeded, getUsersForProject } = useProjectUsers();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState(null);

  // Carga y enriquecimiento de datos
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
          emoji: EMOJIS[Math.floor(Math.random()*EMOJIS.length)]
        };
      });
      setMembers(enriched);
      setLoading(false);
    })();
  }, [projectId, teamMembers, preloadedUsers]);

  if (loading) return (
    <div className="flex justify-center items-center py-16">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4a2b4a]"></div>
      <p className="ml-3 text-lg text-[#4a2b4a]">Loading team avatars...</p>
    </div>
  );

  return (
    <div className="pb-8">
      <h2 className="text-2xl font-bold text-[#1e1e1e] mb-6 flex items-center p-6">
        {/* Ícono SVG aquí si lo deseas */}
        Team Members
      </h2>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="w-full h-[500px]">
          <Canvas dpr={[1, 2]} shadows>
            <ambientLight intensity={0.7} />
            <directionalLight intensity={1} position={[2, 0, 5]} />
            <PerspectiveCamera makeDefault position={[0, -0.5, 7]} fov={35} />

            {members.map((m, i) => {
              const count = members.length;
              const radius = Math.max(count * 0.7, 3);
              const arc = Math.min(Math.PI, Math.PI * 0.7 + count * 0.05);
              const angle = Math.PI/2 - arc/2 + (arc * i/(count-1 || 1));
              const x = Math.cos(angle) * radius;
              const z = Math.sin(angle) * radius * 0.6 - 2;
              return (
                <AnimatedTeamAvatar
                  key={m.id || i}
                  member={m}
                  position={[x, 0, z]}
                  minDelay={2000 + i * 500}
                  maxDelay={5000 + i * 500}
                  idleTime={8000}
                  hoveredId={hoveredId}
                  setHoveredId={setHoveredId}
                />
              );
            })}
          </Canvas>
        </div>
      </div>
    </div>
  );
}
