
// "use client"

// import { useState } from "react"
// import { Canvas } from "@react-three/fiber"
// import { Suspense } from "react"
// import { AnimatedAvatar } from "../dashboard/components/dashboard/avatarConfig/avatarAnimationsDashboard"
// import { Button } from "@/components/ui/button"

// export default function AvatarTest() {
//   // URL del avatar de Ready Player Me (puedes usar diferentes URLs para probar)
//   const [avatarUrl, setAvatarUrl] = useState("https://models.readyplayer.me/67d45fdb3c8fe26009a1fe47.glb")
//   const [gender, setGender] = useState<"masculine" | "feminine">("masculine")
  
//   // Ejemplos de avatares para probar
//   const avatarExamples = [
//     { url: "https://models.readyplayer.me/67d45fdb3c8fe26009a1fe47.glb", gender: "masculine" },
//     { url: "https://models.readyplayer.me/682db562b86b334033a3da7b.glb", gender: "feminine" },
//     { url: "https://models.readyplayer.me/64c9a6b1c086abafd3c8a9a2.glb", gender: "masculine" },
//   ]

//   return (
//     <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-purple-50 to-white">
//       <h1 className="text-3xl font-bold text-purple-900 mb-8">Avatar Animation Test</h1>
      
//       {/* Visualizador de animación */}
//       <div className="w-full h-[500px] max-w-2xl bg-gray-100 rounded-lg overflow-hidden mb-8">
//         <Canvas camera={{ position: [0, 0.3, 3.5], fov: 30 }}>
//           <ambientLight intensity={0.6} />
//           <directionalLight position={[2, 5, 2]} intensity={1} />
//           <Suspense fallback={null}>
//             <AnimatedAvatar
//               avatarUrl={avatarUrl}
//               gender={gender}
//               minDelay={3000}
//               maxDelay={6000}
//               idleTime={5000}
//             />
//           </Suspense>
//         </Canvas>
//       </div>
      
//       {/* Selector de avatares */}
//       <div className="mb-8">
//         <h2 className="text-xl font-semibold text-purple-800 mb-4">Selecciona un avatar para probar</h2>
//         <div className="flex flex-wrap justify-center gap-4">
//           {avatarExamples.map((avatar, index) => (
//             <Button
//               key={index}
//               onClick={() => {
//                 setAvatarUrl(avatar.url)
//                 setGender(avatar.gender)
//               }}
//               variant={avatarUrl === avatar.url ? "default" : "outline"}
//               className={avatarUrl === avatar.url ? "bg-purple-600" : ""}
//             >
//               {avatar.gender === "masculine" ? "Hombre" : "Mujer"} {index + 1}
//             </Button>
//           ))}
//         </div>
//       </div>
      
//       {/* Detalles de depuración */}
//       <div className="w-full max-w-md bg-white rounded-lg shadow-md p-4">
//         <h3 className="text-lg font-medium text-purple-800 mb-2">Detalles de configuración</h3>
//         <p>URL del avatar: <span className="text-sm text-gray-500 break-all">{avatarUrl}</span></p>
//         <p>Género: {gender}</p>
//         <p>Delay mínimo: 3000ms</p>
//         <p>Delay máximo: 6000ms</p>
//         <p>Tiempo idle: 5000ms</p>
//       </div>
//     </main>
//   )
// }


///////////////// PROFILEEE ICON ////////////////////////////////

// "use client"

// import { useState } from "react"
// import AvatarProfileIcon from "@/components/Avatar/AvatarDisplay"
// import { Button } from "@/components/ui/button"
// import { Slider } from "./components/slider"

// export default function Home() {
//   // URL del avatar de Ready Player Me
//   // hombre
//   const [avatarUrl, setAvatarUrl] = useState("https://models.readyplayer.me/67d45fdb3c8fe26009a1fe47.glb")
  
//   // mujer
//   //const [avatarUrl, setAvatarUrl] = useState("https://models.readyplayer.me/682db562b86b334033a3da7b.glb")

//   // Controles para ajustar la posición de la cámara y el modelo
//   const [cameraY, setCameraY] = useState(0.1) // Valor inicial para mover la cámara un poco hacia arriba
//   const [modelY, setModelY] = useState(-0.1)

//   // Ejemplos de avatares para probar
//   const avatarExamples = [
//     "https://models.readyplayer.me/682d8b73092177c0ba2c9739.glb",
//     "https://models.readyplayer.me/682d8b73092177c0ba2c9739.glb",
//     "https://models.readyplayer.me/64c9a6b1c086abafd3c8a9a2.glb",
//   ]

//   return (
//     <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-purple-50 to-white">
//       <h1 className="text-3xl font-bold text-purple-900 mb-8">Avatar Profile Icon</h1>

//       {/* Demostración principal - tamaño grande con controles */}
//       <div className="mb-12 flex flex-col items-center">
//         <AvatarProfileIcon
//           avatarUrl={avatarUrl}
//           size={320}
//           borderWidth={8}
//           borderColor="#EBE5EB"
//           shadowColor="rgba(74,43,74,0.10)"
//           cameraPosition={[0, cameraY, 1.2]}
//           modelPosition={[0, modelY, 0]}
//         />

//         {/* Controles de ajuste */}
//         <div className="mt-8 w-full max-w-md bg-white p-6 rounded-lg shadow-md">
//           <h3 className="text-lg font-medium text-purple-800 mb-4">Ajustes de posición</h3>

//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Posición vertical de la cámara: {cameraY.toFixed(2)}
//             </label>
//             <Slider
//               value={[cameraY]}
//               min={-0.5}
//               max={0.5}
//               step={0.01}
//               onValueChange={(value) => setCameraY(value[0])}
//               className="py-2"
//             />
//           </div>

//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Posición vertical del modelo: {modelY.toFixed(2)}
//             </label>
//             <Slider
//               value={[modelY]}
//               min={-1.2}
//               max={-0.2}
//               step={0.01}
//               onValueChange={(value) => setModelY(value[0])}
//               className="py-2"
//             />
//           </div>

//           <div className="flex justify-between mt-4">
//             <Button
//               variant="outline"
//               onClick={() => {
//                 setCameraY(0.1)
//                 setModelY(-0.65)
//               }}
//             >
//               Restablecer
//             </Button>
//             <Button
//               variant="default"
//               className="bg-purple-600"
//               onClick={() => {
//                 alert(
//                   `Configuración actual:\n- cameraPosition: [0, ${cameraY.toFixed(2)}, 1.2]\n- modelPosition: [0, ${modelY.toFixed(2)}, 0]`,
//                 )
//               }}
//             >
//               Guardar configuración
//             </Button>
//           </div>
//         </div>
//       </div>

//       {/* Selector de avatares */}
//       <div className="mb-8">
//         <h2 className="text-xl font-semibold text-purple-800 mb-4">Prueba con diferentes avatares</h2>
//         <div className="flex flex-wrap justify-center gap-4">
//           {avatarExamples.map((url, index) => (
//             <Button
//               key={index}
//               onClick={() => setAvatarUrl(url)}
//               variant={avatarUrl === url ? "default" : "outline"}
//               className={avatarUrl === url ? "bg-purple-600" : ""}
//             >
//               Avatar {index + 1}
//             </Button>
//           ))}
//         </div>
//       </div>

//       {/* Ejemplos con la configuración actual */}
//       <div className="mb-12">
//         <h2 className="text-xl font-semibold text-purple-800 mb-4">Ejemplos con la configuración actual</h2>
//         <div className="flex flex-wrap justify-center gap-6">
//           {[64, 96, 128].map((size) => (
//             <div key={size} className="flex flex-col items-center">
//               <AvatarProfileIcon
//                 avatarUrl={avatarUrl}
//                 size={size}
//                 borderWidth={4}
//                 cameraPosition={[0, cameraY, 1.2]}
//                 modelPosition={[0, modelY, 0]}
//               />
//               <span className="mt-2 text-sm text-gray-600">{size}px</span>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Código de uso */}
//       <div className="w-full max-w-md bg-gray-800 rounded-lg p-4 overflow-auto">
//         <pre className="text-gray-300 text-sm">
//           {`<AvatarProfileIcon 
//   avatarUrl="${avatarUrl}" 
//   size={128} 
//   borderWidth={4}
//   borderColor="#EBE5EB"
//   shadowColor="rgba(74,43,74,0.10)"
//   cameraPosition={[0, ${cameraY.toFixed(2)}, 1.2]}
//   modelPosition={[0, ${modelY.toFixed(2)}, 0]}
// />`}
//         </pre>
//       </div>
//     </main>
//   )
// }


////////////////////////////////////////////////// ANIMACION MAXIMOOOOOOOOOOOOOOOOOOOOOO ////////////////////

// 'use client';

// import { useState, useRef, useEffect, Suspense } from "react";
// import { Canvas } from "@react-three/fiber";
// import { useGLTF, useAnimations, OrbitControls } from "@react-three/drei";
// import * as THREE from "three";
// import { Button } from "@/components/ui/button";

// function AnimatedModel({ modelUrl, animationUrl, playAnimation }: { 
//   modelUrl: string; 
//   animationUrl: string;
//   playAnimation: boolean;
// }) {
//   const group = useRef<THREE.Group>(null!);
//   const { scene } = useGLTF(modelUrl);
//   const { animations } = useGLTF(animationUrl);
//   const { actions, names } = useAnimations(animations, group);
//   const [currentAction, setCurrentAction] = useState<THREE.AnimationAction | null>(null);

//   // Effect to handle playing the animation
//   useEffect(() => {
//     if (names.length > 0) {
//       const animName = names[0];
//       const action = actions[animName];
      
//       if (action) {
//         setCurrentAction(action);
        
//         if (playAnimation) {
//           action.reset().fadeIn(0.5).play();
//         }
//       }
//     }
    
//     // Cleanup
//     return () => {
//       if (currentAction) {
//         currentAction.fadeOut(0.5);
//       }
//     };
//   }, [actions, names, playAnimation]);

//   return (
//     <group ref={group}>
//       <primitive object={scene} scale={1.5} position={[0, -1.5, 0]} />
//     </group>
//   );
// }

// export default function SimpleAnimationTest() {
//   const [modelUrl, setModelUrl] = useState("https://models.readyplayer.me/682ed025b86b334033bb4bfb.glb");
//   const [animationUrl, setAnimationUrl] = useState("/animation/avatarAnimations/kneeling.glb");
//   const [playAnimation, setPlayAnimation] = useState(false);
  
//   const handlePlay = () => {
//     // Reset animation flag first to ensure it replays even if the same animation
//     setPlayAnimation(false);
//     setTimeout(() => setPlayAnimation(true), 50);
//   };

//   return (
//     <div className="flex flex-col min-h-screen p-6 bg-gradient-to-b from-purple-50 to-white">
//       <h1 className="text-3xl font-bold text-purple-900 mb-6">Simple Animation Test</h1>
      
//       <div className="grid grid-cols-1 gap-6">
//         {/* Controls */}
//         <div className="bg-white p-6 rounded-lg shadow-md">
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Avatar URL
//             </label>
//             <input 
//               type="text" 
//               value={modelUrl}
//               onChange={(e) => setModelUrl(e.target.value)}
//               className="w-full p-2 border border-gray-300 rounded"
//             />
//           </div>
          
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Animation URL
//             </label>
//             <input 
//               type="text" 
//               value={animationUrl}
//               onChange={(e) => setAnimationUrl(e.target.value)}
//               className="w-full p-2 border border-gray-300 rounded"
//             />
//           </div>
          
//           <Button 
//             onClick={handlePlay} 
//             className="w-full bg-purple-600 hover:bg-purple-700"
//           >
//             Play Animation
//           </Button>
//         </div>
        
//         {/* 3D Viewer */}
//         <div className="bg-gray-100 rounded-lg overflow-hidden" style={{ height: "600px" }}>
//           <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
//             <ambientLight intensity={0.6} />
//             <directionalLight position={[2, 5, 2]} intensity={1} />
//             <Suspense fallback={null}>
//               <AnimatedModel 
//                 modelUrl={modelUrl} 
//                 animationUrl={animationUrl} 
//                 playAnimation={playAnimation} 
//               />
//             </Suspense>
//             <OrbitControls />
//           </Canvas>
//         </div>
//       </div>
//     </div>
//   );
// }






///////////////// ANIMACIÓNS PRUEBAS ///////////////////////////////////////////////

// 'use client';

// import WelcomeAnimation from "./components/welcome-animation";

// export default function Home() {
//   return (
//     <WelcomeAnimation
//       avatarUrl="https://models.readyplayer.me/682ed025b86b334033bb4bfb.glb"
//       onComplete={() => alert("¡Animación terminada!")}

//     />
//   );
// }





//////////////////////////////// PRUEBA DE EXPRESIONES FACIALEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEES////////////////////////////////////

'use client';

import { useState, useRef, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Button } from "@/components/ui/button";

// Predefined expressions with their blendshape values
const EXPRESSIONS = {
  Relaxed: {
    // Parpadeo suave: sensación de calma/ojos medio cerrados
    eyeBlinkLeft:    0.2,
    eyeBlinkRight:   0.2,
    // Comisura de labios apenas cerrada: labios relajados
    mouthClose:      0.1,
    // Leve hinchazón de mejillas: respiración tranquila
    cheekPuff:       0.1,
    // Una ligera elevación interna de cejas para no verse completamente neutro
    browInnerUp:     0.1
  },
  Happy: {
    // Sonrisa amplia
    mouthSmileLeft:   0.8,
    mouthSmileRight:  0.8,
    // Hoyuelos en mejillas
    mouthDimpleLeft:  0.3,
    mouthDimpleRight: 0.3,
    // Ceño “suave” arqueado hacia arriba
    browOuterUpLeft:  0.1,
    browOuterUpRight: 0.1,
    // Ojos entrecerrados por la sonrisa
    eyeSquintLeft:    0.4,
    eyeSquintRight:   0.4,
    // Elevación de parte superior del labio para enfatizar la sonrisa
    mouthUpperUpLeft: 0.3,
    mouthUpperUpRight:0.3,
    // Leve arrugado de mejillas
    cheekSquintLeft:  0.5,
    cheekSquintRight: 0.5
  },
  Euphoric: {
    // Cierre completo de ojos: éxtasis
    eyeBlinkLeft:    1.0,
    eyeBlinkRight:   1.0,
    // Sonrisa máxima
    mouthSmileLeft:  1.0,
    mouthSmileRight: 1.0,
    // Boca bien abierta de júbilo
    mouthOpen:       1.0,
    // Sacar un poco la lengua para acentuar la intensidad
    tongueOut:       0.3,
    // Mejillas muy arrugadas por la sonrisa
    cheekSquintLeft:  0.8,
    cheekSquintRight: 0.8,
    // Cejas levantadas en el centro y hacia fuera
    browInnerUp:      0.5,
    browOuterUpLeft:  0.7,
    browOuterUpRight: 0.7
  },
  Calm: {
    // Ojos cerrados por completo: estado de meditación/binocular
    eyeBlinkLeft:   1.0,
    eyeBlinkRight:  1.0,
    // Labio ligeramente fruncido o casi neutro
    mouthClose:     0.05,
    // Una pequeña elevación interna de cejas, como “suave atención”
    browInnerUp:    0.2
  },
  Excited: {
    // Sonrisa marcada
    mouthSmileLeft:   0.8,
    mouthSmileRight:  0.8,
    // Ojos muy abiertos (asombro)
    eyeWideLeft:      0.6,
    eyeWideRight:     0.6,
    // Elevación de cejas internas y externas: entusiasmo
    browInnerUp:      0.5,
    browOuterUpLeft:  0.6,
    browOuterUpRight: 0.6,
    // Mejillas arrugadas por la sonrisa
    cheekSquintLeft:  0.5,
    cheekSquintRight: 0.5,
    // Labios estirados hacia los lados para enfatizar excitación
    mouthStretchLeft:  0.7,
    mouthStretchRight: 0.7,
    // Una ligera apertura de boca para transmitir energía
    mouthOpen:        0.5
  },
  Sad: {
  // ===== Ceja: forma de “V” invertida más pronunciada =====
  browDownLeft:       0.6,    // baja el extremo exterior de la ceja
  browDownRight:      0.6,
  browInnerUp:        0.7,    // eleva más el centro de ambas cejas

  // ===== Ojos: mirada hacia abajo y párpados algo cargados =====
  eyeLookDownLeft:    0.3,
  eyeLookDownRight:   0.3,
  eyeBlinkLeft:       0.2,
  eyeBlinkRight:      0.2,
  eyeSquintLeft:      0.2,
  eyeSquintRight:     0.2,

  // ===== Boca: cerrada (sin mostrar dientes), pero con comisuras caídas =====
  mouthClose:         0.3,    // cierra los labios lo suficiente para no ver los dientes
  mouthFrownLeft:     0.6,    // baja las comisuras sin forzar apertura
  mouthFrownRight:    0.6,
  mouthPressLeft:     0.1,    // presiona ligeramente los labios para tensión contenida
  mouthPressRight:    0.1,

  // ===== Mejillas: leve arrugado por la tensión de la boca/ojos =====
  cheekSquintLeft:    0.2,
  cheekSquintRight:   0.2
  },
  Stressed: {
    // Cejas muy arqueadas hacia abajo (fruncido)
    browDownLeft:    0.8,
    browDownRight:   0.8,
    // Cejas internas levantadas para tensión
    browInnerUp:     0.4,
    // Ojos entrecerrados por fatiga/tensión
    eyeSquintLeft:   0.5,
    eyeSquintRight:  0.5,
    // Apertura parcial de mandíbula
    jawForward:      0.3,
    // Arrugado de nariz (desagrado/estrés)
    noseSneerLeft:   0.4,
    noseSneerRight:  0.4,
    // Labios presionados para contener tensión
    mouthPressLeft:  0.4,
    mouthPressRight: 0.4,
    // Comisuras de labios levemente hacia abajo
    mouthFrownLeft:   0.5,
    mouthFrownRight:  0.5,
    // Labio inferior caído
    mouthLowerDownLeft:  0.4,
    mouthLowerDownRight: 0.4
  },
  Neutral: {
    // Sin ninguna influencia activada: expresión totalmente neutra
    // (Todos los demás blendshapes en 0 por defecto)
  }
};


function AvatarWithExpressions({ avatarUrl, expression }: { 
  avatarUrl: string;
  expression: string;
}) {
  const group = useRef<THREE.Group>(null!);
  const { scene } = useGLTF(avatarUrl);
  const [loaded, setLoaded] = useState(false);
  
  // Find the head mesh with morph targets
  useEffect(() => {
    if (!scene) return;
    
    // Reset all blendshapes first
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh && object.morphTargetDictionary && object.morphTargetInfluences) {
        for (let i = 0; i < object.morphTargetInfluences.length; i++) {
          object.morphTargetInfluences[i] = 0;
        }
      }
    });
    
    // Apply the selected expression
    if (expression && EXPRESSIONS[expression]) {
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh && object.morphTargetDictionary && object.morphTargetInfluences) {
          for (const [blendshapeName, value] of Object.entries(EXPRESSIONS[expression])) {
            const index = object.morphTargetDictionary[blendshapeName];
            if (index !== undefined) {
              object.morphTargetInfluences[index] = value;
            }
          }
        }
      });
    }
    
    setLoaded(true);
  }, [scene, expression]);

  return (
    <group ref={group}>
      <primitive object={scene} scale={3} position={[0, -5, 0]} />
    </group>
  );
}

// Component to list all available blendshapes in the model
function BlendshapeDebugger({ avatarUrl }: { avatarUrl: string }) {
  const { scene } = useGLTF(avatarUrl);
  const [blendshapes, setBlendshapes] = useState<string[]>([]);
  
  useEffect(() => {
    if (!scene) return;
    
    const foundBlendshapes = new Set<string>();
    
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh && object.morphTargetDictionary) {
        Object.keys(object.morphTargetDictionary).forEach(key => {
          foundBlendshapes.add(key);
        });
      }
    });
    
    setBlendshapes(Array.from(foundBlendshapes).sort());
  }, [scene]);
  
  return (
    <div className="mt-4 p-4 bg-gray-100 rounded-lg max-h-60 overflow-y-auto">
      <h3 className="font-medium text-gray-700 mb-2">Available Blendshapes ({blendshapes.length})</h3>
      <div className="text-xs text-gray-600 grid grid-cols-2 sm:grid-cols-3 gap-1">
        {blendshapes.map(name => (
          <div key={name} className="bg-white p-1 rounded">{name}</div>
        ))}
      </div>
    </div>
  );
}

// In your ExpressionTest component
export default function ExpressionTest() {
  const [avatarUrl, setAvatarUrl] = useState("https://models.readyplayer.me/6837b68957dc975dd3e11219.glb?morphTargets=ARKit,Oculus Visemes");
  const [currentExpression, setCurrentExpression] = useState("neutral");
  const [showBlendshapes, setShowBlendshapes] = useState(false);
  
  return (
    <div className="flex flex-col min-h-screen p-6 bg-gradient-to-b from-purple-50 to-white">
      <h1 className="text-3xl font-bold text-purple-900 mb-6">Avatar Expression Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Avatar URL
            </label>
            <input 
              type="text" 
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expression
            </label>
            <div className="grid grid-cols-2 gap-2 h-72 overflow-y-auto">
              {Object.keys(EXPRESSIONS).map((exp) => (
                <Button 
                  key={exp}
                  onClick={() => setCurrentExpression(exp)}
                  variant={currentExpression === exp ? "default" : "outline"}
                  className={currentExpression === exp ? "bg-purple-600 hover:bg-purple-700" : ""}
                >
                  {exp.charAt(0).toUpperCase() + exp.slice(1)}
                </Button>
              ))}
            </div>
          </div>
          
          <Button 
            onClick={() => setShowBlendshapes(!showBlendshapes)} 
            variant="outline"
            className="w-full mt-4"
          >
            {showBlendshapes ? "Hide Blendshapes" : "Show Available Blendshapes"}
          </Button>
          
          {showBlendshapes && <BlendshapeDebugger avatarUrl={avatarUrl} />}
        </div>
        
        {/* 3D Viewer */}
        <div className="md:col-span-2 bg-gray-100 rounded-lg overflow-hidden" style={{ height: "600px" }}>
          <Canvas camera={{ position: [0, 0, 2.5], fov: 40 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[2, 5, 2]} intensity={1} />
            <Suspense fallback={null}>
              <AvatarWithExpressions 
                avatarUrl={avatarUrl} 
                expression={currentExpression} 
              />
            </Suspense>
            <OrbitControls />
          </Canvas>
        </div>
      </div>
    </div>
  );
}