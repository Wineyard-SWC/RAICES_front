'use client';

import { useState, useEffect } from 'react';
import { FaGithub } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth';
import { auth } from '@/utils/firebaseConfig';
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import Image from "next/image"

export default function CreateAccountPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { loginWithGoogle, loginWithGithub } = useAuth()

  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isValidEmail = (email: string): boolean => { // Añadí :string y el booleano
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };  

  const handleSignup = async () => {
    if (isSubmitting) return; // Evitar llamadas múltiples

  
    if (!isValidEmail(email)) {
      setError('Invalid email format');
      return;
    }
  
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
  
    try {
      setIsSubmitting(true); // Deshabilitar el botón inmediatamente
  
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
      });    

      await sendEmailVerification(user);
      setError('Verification email sent. Please check your inbox.');
  
      setTimeout(() => {
        router.push("/login"); // Redirigir al login después de 3 segundos
      }, 3000);
  
      auth.signOut(); // Cerrar sesión hasta que verifique el correo
  
    } catch (err) {
      setError('Error creating account: ' + (err as Error).message); // Encerré el err y le añadí "as Error"
    } finally {
      setTimeout(() => setIsSubmitting(false), 3000); // Rehabilitar botón después de 3s
    }
  };
  

  if (!isClient) {
    return null; // Evita que el contenido se renderice antes de que el cliente esté listo
  }

  return (
    <div className="flex min-h-screen">
      <div className="w-full sm:w-1/2 flex flex-col justify-center items-center text-white p-10" style={{ backgroundColor: '#4A2B4A' }}>
        <div className="mb-8 flex h-40 w-40 items-center justify-center rounded-full bg-[#D9B8D9]">
          <Image src="/logo.png" alt="RACES Logo" width={160} height={120} className="object-contain" priority />
        </div>
        <p className="text-center mt-4 max-w-md">
          Join our community of agile teams and start planning your sprints more effectively. Get started with RAICES today.
        </p>
      </div>

      <div className="w-full sm:w-1/2 flex justify-center items-center p-10" style={{ backgroundColor: '#EBE5EB' }}>
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#000000' }}>Create account</h2>
          <p className="mb-4" style={{ color: '#000000' }}>Get started with a free account</p>

          {/* Form inputs */}
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="mb-4 w-full sm:w-1/2">
              <label className="block mb-1 text-black">First Name</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" 
                placeholder="John"
                value={firstName}
                style={{ borderColor: '#694969', color: '#000000' }}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="mb-4 w-full sm:w-1/2">
              <label className="block mb-1 text-black">Last Name</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" 
                placeholder="Doe"
                value={lastName}
                style={{ borderColor: '#694969', color: '#000000' }}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-black">Email</label>
            <input 
              type="email" 
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" 
              placeholder="name@company.com"
              value={email}
              style={{ borderColor: '#694969', color: '#000000' }}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-4 relative">
            <label className="block mb-1 text-black">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}  // Cambia entre texto y contraseña
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" 
                placeholder="********"
                value={password}
                style={{ borderColor: '#694969', color: '#000000' }}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
                style={{ color: '#694969', fontSize: '18px' }}  // Ajuste del color y tamaño del ícono
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}  {/* El ojo tachado significa que está oculto */}
              </div>
            </div>
          </div>

          <div className="mb-4 relative">
            <label className="block mb-1 text-black">Confirm Password</label>
            <div className="relative">
              <input 
                type={showConfirmPassword ? "text" : "password"}  // Cambia entre texto y contraseña
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" 
                placeholder="********"
                value={confirmPassword}
                style={{ borderColor: '#694969', color: '#000000' }}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <div 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ color: '#694969', fontSize: '18px' }}  // Ajuste del color y tamaño del ícono
              >
                {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}  {/* El ojo tachado significa que está oculto */}
              </div>
            </div>
          </div>


          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <div className="mb-4 flex items-center">
            <input type="checkbox" id="terms" className="mr-2" />
            <label htmlFor="terms" className="text-black text-sm">I agree to the terms of service and privacy policy</label>
          </div>

          {/* Checkbox y el botón de creación */}
          <button 
            className="w-full text-white py-2 rounded-lg" 
            style={{ backgroundColor: '#4A2B4A', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
            onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = '#694969'}
            onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = '#4A2B4A'}
            onClick={handleSignup}
            disabled={isSubmitting} // Deshabilitar el botón cuando se está enviando
          >
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
          
          <p className="text-center text-sm mt-4 text-black">
            Already have an account? <Link href="/login" style={{ color: '#694969' }}>Log in</Link>
          </p>

          <div className="flex items-center my-4">
            <div className="flex-grow border-t" style={{ color: '#000000' }}></div>
            <span className="px-3 text-gray-500 text-sm" style={{ color: '#694969' }}>Or continue with</span>
            <div className="flex-grow border-t" style={{ color: '#000000' }}></div>
          </div>

          <div className="flex flex-col sm:flex-row space-x-4">
            <button 
              className="flex items-center justify-center w-full sm:w-1/2 py-2 rounded-lg hover:bg-gray-200"
              style={{ color: '#000000', border: '2px solid #694969' }}
              onClick={loginWithGoogle}
            >
              <FcGoogle className="mr-2"/> Google
            </button>
            <button 
              className="flex items-center justify-center w-full sm:w-1/2 py-2 rounded-lg hover:bg-gray-200"
              style={{ color: '#000000', border: '2px solid #694969' }}
              onClick={loginWithGithub}
            >
              <FaGithub className="mr-2" /> Github
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}