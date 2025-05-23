import { Suspense } from "react"
import SprintPlanningContent from "./components/SprintPlanningContent"

// Componente de carga para el límite de Suspense
function LoadingSprintPlanning() {
  return (
    <div className="min-h-screen bg-[#ebe5eb]/30 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#4a2b4a] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

// Componente principal (servidor) que envuelve el contenido cliente en Suspense
export default function SprintPlanningPage() {
  return (
    <Suspense fallback={<LoadingSprintPlanning />}>
      <SprintPlanningContent />
    </Suspense>
  );
}