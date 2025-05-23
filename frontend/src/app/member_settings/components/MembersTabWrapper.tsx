"use client"

import { Suspense } from "react"
import MembersTab from "./MembersTab"

// Componente de carga para usar como fallback de Suspense
function LoadingMembersTab() {
  return (
    <div className="flex justify-center p-8">
      <div className="w-8 h-8 border-4 border-[#4a2b4a] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

// Este componente sirve como un wrapper que incluye el Suspense
export default function MembersTabWrapper() {
  return (
    <Suspense fallback={<LoadingMembersTab />}>
      <MembersTab />
    </Suspense>
  )
}