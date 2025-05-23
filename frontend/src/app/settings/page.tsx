import { Suspense } from "react"
import SettingsContent from "./components/SettingsContent"

// Componente de carga para el límite de Suspense
function LoadingSettings() {
  return (
    <div className="min-h-screen bg-[#ebe5eb]/30 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#4a2b4a] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

// Componente principal (servidor) que envuelve el contenido cliente en Suspense
export default function SettingsPage() {
  return (
    <Suspense fallback={<LoadingSettings />}>
      <SettingsContent />
    </Suspense>
  );
}