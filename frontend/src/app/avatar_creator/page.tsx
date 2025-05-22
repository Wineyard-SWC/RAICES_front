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
          
          // Extraer el género de la respuesta del metadato en lugar del bodyType
          let gender = "masculine"; // Valor por defecto
          
          try {
            // Hacer una petición al endpoint de metadatos
            const metadataUrl = url.replace('.glb', '.json');
            const response = await fetch(metadataUrl);
            const metadata = await response.json();

            console.log("Metadata fetched:", metadata);
            
            // El género está disponible en los metadatos
            if (metadata && metadata.outfitGender) {
              gender = metadata.outfitGender === "male" ? "masculine" : "feminine";
            }
            
            console.log("Detected gender from metadata:", gender);
            // Actualizar el estado para pasarlo correctamente al componente WelcomeAnimation
            setSelectedGender(gender);
          } catch (e) {
            console.error("Error fetching avatar metadata, using default gender:", e);
          }
          
          console.log("Avatar exported with gender:", gender);
          
          try {
            // Actualizar tanto el avatar como el género en la base de datos
            await updateAvatarAndGender(storedUserId, url, gender);
            
            // También actualizar en el contexto para usar en toda la app
            updateAvatarUrl(url, gender);
          } catch (e) {
            console.error('Error updating profile:', e);
          }
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
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <WelcomeAnimation 
              avatarUrl={avatarUrl} 
              gender={selectedGender} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return null;
}
