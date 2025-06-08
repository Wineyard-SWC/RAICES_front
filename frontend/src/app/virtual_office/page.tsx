// "use client";

// import Navbar from "@/components/NavBar";
// import { Suspense } from 'react';


// export default function VirtualOffice() {
  
//   return (
//     <Suspense fallback={<div>Loading...</div>}>
//       <div className="flex flex-col h-screen">
//         {/* Navbar */}
//         <Navbar projectSelected={false} />

//         {/* Título */}
//         <div className="px-8 pt-6 pb-2 bg-[#EBE5EB]/30">
//           <h1 className="text-3xl font-bold text-[#4a2b4a]">My Virtual Office</h1>
//         </div>

//         {/* Contenedor del juego */}
//         <div className="flex-1 relative">
          
//             <iframe
//               src="/webgl/index.html"
//               className="absolute top-0 left-0 w-full h-full"
//               allowFullScreen
//               style={{ border: "none" }}
//             />
        
//         </div>
//       </div> 
//     </Suspense>
//   );
// }