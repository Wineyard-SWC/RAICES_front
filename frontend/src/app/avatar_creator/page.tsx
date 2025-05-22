'use client';

import { useState, useEffect } from 'react';
import { AvatarCreator, AvatarCreatorConfig, AvatarExportedEvent } from '@readyplayerme/react-avatar-creator';
import { useUpdateAvatar } from './hooks/useUpdateAvatar';
import { useRouter } from 'next/navigation';
import { useAvatar } from '@/contexts/AvatarContext'; // Import the avatar context
import WelcomeAnimation from '../avatar_test/components/welcome-animation';
import { motion, AnimatePresence } from 'framer-motion';

const config: AvatarCreatorConfig = {
  clearCache: true,
  bodyType: 'fullbody',
  quickStart: false,
  language: 'en',
};
const style = { width: '100%', height: '100vh', border: 'none' };

export default function AvatarPage() {
  const router = useRouter();
  const { updateAvatarAndGender } = useUpdateAvatar();
  const { updateAvatarUrl } = useAvatar(); // Get the context function
  const storedUserId = localStorage.getItem('userId') || '';

  const [step, setStep] = useState<'intro' | 'creator' | 'welcome'>('intro');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [selectedGender, setSelectedGender] = useState<string>('masculine');
  const [isLoading, setIsLoading] = useState(true);

  // Add loading effect when step changes to welcome
  useEffect(() => {
    if (step === 'welcome') {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // 1) Intro screen
  if (step === 'intro') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#EBE5EB]/30">
        <h1 className="text-4xl font-bold mb-4 text-[#4A2B4A]">First things first</h1>
        <p className="mb-6 text-lg text-[#4A2B4A]">
          Let's create your avatar before we dive in.
        </p>
        <button
          className="px-6 py-3 rounded-lg text-white font-semibold transition"
          style={{ backgroundColor: '#4A2B4A' }}
          onClick={() => setStep('creator')}
        >
          Get Started
        </button>
      </div>
    );
  }

  // 2) Avatar Creator
  if (step === 'creator') {
    return (
      <AvatarCreator
        subdomain="raices"
        config={config}
        style={style}
        onAvatarExported={async (event: AvatarExportedEvent) => {
          const url = event.data.url;
          setAvatarUrl(url);
          
          // Variable local para guardar el género detectado
          let detectedGender = "masculine"; // Valor por defecto
          
          try {
            // Hacer una petición al endpoint de metadatos
            const metadataUrl = url.replace('.glb', '.json');
            const response = await fetch(metadataUrl);
            const metadata = await response.json();

            console.log("Metadata fetched:", metadata);
            
            // Determinar el género basado en los metadatos
            if (metadata && metadata.outfitGender) {
              // Normalizar el género para nuestro formato interno
              detectedGender = metadata.outfitGender.toLowerCase() === "female" ? "feminine" : 
                             metadata.outfitGender.toLowerCase() === "feminine" ? "feminine" : "masculine";
            }

            detectedGender = metadata.outfitGender;
            
            console.log("Género detectado y normalizado:", detectedGender);
          } catch (e) {
            console.error("Error fetching avatar metadata, using default gender:", e);
          }
          
          // Actualizar el estado con el género detectado
          setSelectedGender(detectedGender);
          
          console.log("Avatar exported with normalized gender:", detectedGender);
          
          try {
            // Actualizar base de datos (esto puede ser asíncrono y no bloqueante)
            await updateAvatarAndGender(storedUserId, url, detectedGender);
            
            // Actualizar contexto (esto también es asíncrono)
            updateAvatarUrl(url, detectedGender);
          } catch (e) {
            console.error('Error updating profile:', e);
          }
          
          // Avanzar al siguiente paso con el género ya detectado y normalizado
          setStep('welcome');
        }}
      />
    );
  }

  // 3) Loading and Welcome Animation
  if (step === 'welcome') {
    return (
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center h-screen bg-white"
          >
            <motion.div
              className="w-20 h-20 rounded-full border-4 border-[#4A2B4A]"
              animate={{
                rotate: 360,
                borderWidth: ['4px', '2px', '4px'],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        ) : (
          !isLoading && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <WelcomeAnimation 
                avatarUrl={avatarUrl} 
                gender={selectedGender} // El género se pasa directamente del estado local
              />
            </motion.div>
          )
        )}
      </AnimatePresence>
    );
  }

  return null;
}
