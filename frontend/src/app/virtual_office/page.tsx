'use client';

import Navbar from "@/components/NavBar";
import { useEffect } from "react";

export default function VirtualOffice() {
  useEffect(() => {
    // No necesitas cargar loader.js manualmente si usas iframe.
  }, []);

  return (
    <div className="flex flex-col h-screen">
      {/* Navbar */}
      <Navbar projectSelected={false} />

      {/* Título */}
      <div className="px-8 pt-6 pb-2 bg-[#EBE5EB]/30">
        <h1 className="text-3xl font-bold text-[#4a2b4a]">My Virtual Office</h1>
      </div>

      {/* Contenedor del juego */}
      <div className="flex-1 relative">
        <iframe
          src="/webgl/index.html"
          className="absolute top-0 left-0 w-full h-full"
          allowFullScreen
          style={{ border: "none" }}
        />
      </div>
    </div>
  );
}