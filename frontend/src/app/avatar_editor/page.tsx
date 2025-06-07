'use client';

import { useEffect, useState, Suspense } from 'react';
import { AvatarCreator, AvatarCreatorConfig, AvatarExportedEvent } from '@readyplayerme/react-avatar-creator';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAvatar } from '@/contexts/AvatarContext';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { useUpdateAvatar } from '../avatar_creator/hooks/useUpdateAvatar';
import { print, printError } from '@/utils/debugLogger';

// Estilo para el iframe del editor
const editorStyle = { width: '100%', height: '100vh', border: 'none' };

// Loading component to show while params are loading
function LoadingEditor() {
  return (
    <div className="flex items-center justify-center h-screen bg-slate-50">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-800"></div>
    </div>
  );
}

// Client component that uses searchParams
function AvatarEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Obtener la URL del avatar de los parámetros de consulta o del contexto
  const { avatarUrl: contextAvatarUrl, gender, updateAvatarUrl } = useAvatar();
  const avatarUrlParam = searchParams.get('avatarUrl');
  
  // Usar el parámetro si existe, de lo contrario usar el del contexto
  const avatarUrl = avatarUrlParam || contextAvatarUrl;
  const { updateAvatarAndGender, isLoading: isSaving } = useUpdateAvatar();
  const [isEditorLoaded, setIsEditorLoaded] = useState(false);
  const [editComplete, setEditComplete] = useState(false);
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') || '' : '';

  // Configuración específica para edición
  const editorConfig: AvatarCreatorConfig = {
    clearCache: false,
    bodyType: 'fullbody',
    quickStart: true, // Saltar intro en modo edición
    language: 'en',
    background: { color: "#5834c0" }, // Color distintivo para el modo edición
    showBackButton: false, // Usaremos nuestro propio botón de regreso
  };

  // Verificamos que tengamos un avatar para editar
  useEffect(() => {
    if (!avatarUrl) {
      // Si no hay avatar, redirigimos al perfil
      console.warn('No avatar URL found, redirecting to profile');
      router.push('/settings?tab=profile');
    } else {
      // Si hay avatar, marcamos el editor como listo para cargar
      setIsEditorLoaded(true);
    }
  }, [avatarUrl, router]);

  // Manejador para cuando el avatar es exportado
  const handleAvatarExported = async (event: AvatarExportedEvent) => {
    // Add the morphTargets parameter to the avatar URL
    const baseUrl = event.data.url;
    const newAvatarUrl = `${baseUrl}?morphTargets=ARKit,Oculus Visemes`;
    
    try {
      // Intentar obtener información de género desde los metadatos
      let updatedGender = gender; // Por defecto mantener el género actual
      
      try {
        // Update to use the enhanced URL's base for metadata
        const metadataUrl = baseUrl.replace('.glb', '.json');
        const response = await fetch(metadataUrl);
        if (response.ok) {
          const metadata = await response.json();
          if (metadata && metadata.outfitGender) {
            updatedGender = metadata.outfitGender === "male" ? "masculine" : "feminine";
          }

          updatedGender = metadata.outfitGender;
        }
      } catch (e) {
        console.warn('Error fetching avatar metadata:', e);
        // Continuar con el género actual si hay error
      }
      
      // Actualizar en la base de datos con la URL mejorada
      await updateAvatarAndGender(userId, newAvatarUrl, updatedGender);
      
      // Actualizar en el contexto con la URL mejorada
      updateAvatarUrl(newAvatarUrl, updatedGender);

      // Mostrar confirmación
      setEditComplete(true);
      
      // Regresar al perfil después de 1.5 segundos
      setTimeout(() => {
        router.push('/settings?tab=profile');
      }, 1500);
      
    } catch (error) {
      printError('Error updating avatar:', error);
      alert('There was an error updating your avatar. Please try again.');
      router.push('/settings?tab=profile');
    }
  };

  // Si no se ha cargado el editor (no hay URL de avatar), mostramos pantalla de carga
  if (!isEditorLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-800"></div>
      </div>
    );
  }

  // Pantalla de éxito después de actualizar
  if (editComplete) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
        <div className="text-center p-8 rounded-lg">
          <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
          <h2 className="text-2xl font-bold mb-2">Avatar Updated!</h2>
          <p className="text-gray-600">Returning to your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen bg-gray-100">
      {/* Header con botón de regreso */}
      <div className="absolute top-0 left-0 right-0 bg-[#4A2B4A] text-white z-10 p-4 flex items-center">
        <button
          onClick={() => router.replace('/settings?tab=profile')}
          className="flex items-center space-x-2 hover:text-purple-200 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Profile</span>
        </button>
        <h1 className="text-xl font-bold mx-auto pr-24">Edit Your Avatar</h1>
      </div>

      {/* Editor de Avatar */}
      <div className="pt-16 h-full">
        <AvatarCreator
          subdomain="raices" // Asegúrate de usar tu subdominio correcto
          config={editorConfig}
          style={editorStyle}
          avatarUrl={avatarUrl} // Usar la URL recuperada
          onAvatarExported={handleAvatarExported}
        />
      </div>
      
      {/* Overlay de guardado */}
      {isSaving && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl">
            <div className="flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-800"></div>
              <p>Saving your avatar...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Main page component with Suspense
export default function AvatarEditorPage() {
  return (
    <Suspense fallback={<LoadingEditor />}>
      <AvatarEditorContent />
    </Suspense>
  );
}