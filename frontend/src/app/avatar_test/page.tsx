
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


///////////////// ANIMACIÓNS PRUEBAS ///////////////////////////////////////////////

'use client';

import WelcomeAnimation from "./components/welcome-animation";

export default function Home() {
  return (
    <WelcomeAnimation
      avatarUrl="https://models.readyplayer.me/682ed025b86b334033bb4bfb.glb"
      onComplete={() => alert("¡Animación terminada!")}

    />
  );
}