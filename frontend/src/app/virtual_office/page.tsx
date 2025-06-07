'use client';

import Navbar from "@/components/NavBar";
import { Suspense, useEffect, useRef, useState } from "react";

export default function VirtualOffice() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const uid = localStorage.getItem("userId");
    if (uid) setUserId(uid);
  }, []);

  useEffect(() => {
    if (iframeRef.current && userId) {
      iframeRef.current.contentWindow?.postMessage({ userId }, "*");
    }
  }, [userId]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex flex-col h-screen bg-[#EBE5EB]/30">
        {/* Navbar */}
        <Navbar projectSelected={false} />

        {/* Encabezado centrado */}
        <div className="text-center pt-6 pb-2">
          <h1 className="text-3xl font-bold text-[#4a2b4a]">My Virtual Office</h1>
          <p className="text-[#694969] mt-1 text-sm">
            Activate Fullscreen Mode to purchase items and interact fully.
          </p>
        </div>

        {/* Contenedor del juego */}
        <div className="flex-1 relative bg-[#EBE5EB]/30">
          <iframe
            ref={iframeRef}
            src="/webgl/index.html"
            className="absolute top-0 left-0 w-full h-full"
            allowFullScreen
            style={{ border: "none" }}
          />
        </div>
      </div>
    </Suspense>
  );
}