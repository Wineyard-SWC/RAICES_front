'use client';

import { useUser } from '@/contexts/usercontext'; 
import { useState } from 'react';
import { FaGithub } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, githubProvider } from '@/utils/firebaseConfig';
import { FaEye, FaEyeSlash } from 'react-icons/fa'

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); 
  const [error, setError] = useState('');

  const { setUserId } = useUser();

  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Función para el login con Firebase Email y Password
  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Verifica si el correo electrónico está verificado
      if (!user.emailVerified) {
        setError('Please verify your email before logging in.');
        return;
      }

      const token = await user.getIdToken(); // Obtener el token JWT
      localStorage.setItem("authToken", token); // Guardar el token en localStorage

      const userId = user.uid;
      setUserId(userId);

      const response = await fetch(`${API_URL}/token`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Server returned error: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);

      router.push("/dashboard");
    } catch (err) {
      setError('Error logging in: ' + (err as Error).message);
    }
  };

  // Función para el login con Google
  const handleGoogleLogin = async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const token = await userCredential.user.getIdToken(); // Obtener el token JWT
      localStorage.setItem("authToken", token); // Guardar el token en localStorage

      const userId = userCredential.user.uid; 
      console.log(userId)
      setUserId(userId)

      const response = await fetch(`${API_URL}/token`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Server returned error: ${response.status}`);
      }
    
      const data = await response.json();
      console.log(data);

      router.push("/dashboard");
    } catch (err) {
      setError('Error logging in: ' + (err as Error).message);
    }
  };

  // Función para el login con GitHub
  const handleGithubLogin = async () => {
    try {
      const userCredential = await signInWithPopup(auth, githubProvider);
      const token = await userCredential.user.getIdToken(); // Obtener el token JWT
      localStorage.setItem("authToken", token); // Guardar el token en localStorage

      const userId = userCredential.user.uid; 
      setUserId(userId)
    
      const response = await fetch(`${API_URL}/token`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error(`Server returned error: ${response.status}`);
      }
    
      const data = await response.json();
      console.log(data);

      router.push("/dashboard");
    } catch (err) {
      setError('Error logging in: ' + (err as Error).message);
    }
  };


  return (
    <div className="flex h-screen">
      <div className="w-1/2 flex flex-col justify-center items-center text-white p-10" style={{ backgroundColor: '#4A2B4A' }}>
        <div className="bg-purple-300 rounded-full p-10 flex justify-center items-center">
          <span className="text-3xl font-bold text-purple-900 tracking-wide">RAÍCES</span>
        </div>
        <p className="text-center mt-4 max-w-md">
          Plan, track, and grow your projects organically. Visualize your team's progress and cultivate success
          with our sprint planning tools.
        </p>
      </div>

      <div className="w-1/2 flex justify-center items-center p-10" style={{ backgroundColor: '#EBE5EB' }}>
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#000000' }}>Welcome back</h2>
          <p className="mb-4" style={{ color: '#000000' }}>Log in to continue to your dashboard</p>

          <div className="mb-4">
            <label className="block mb-1" style={{ color: '#000000' }}>Email</label>
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
            <a 
              href="#" 
              className="text-sm" 
              style={{ color: '#694969', position: 'absolute', right: '0', top: '0', fontSize: '14px' }}
            >
              Forgot password?
            </a>
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

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <button className="w-full text-white py-2 rounded-lg"
          style={{ backgroundColor: '#4A2B4A' }}
          onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#694969'}
          onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#4A2B4A'}
          onClick={handleLogin} // Llamada al login de Firebase
          >Log In</button>
          
          <p className="text-center text-sm mt-4" style={{ color: '#000000' }}>
            Don't have an account? <Link href="/signup" style={{ color: '#694969' }}>Sign up</Link>
          </p>

          <div className="flex items-center my-4">
            <div className="flex-grow border-t" style={{ color: '#000000' }}></div>
            <span className="px-3 text-gray-500 text-sm" style={{ color: '#694969' }}>Or continue with</span>
            <div className="flex-grow border-t" style={{ color: '#000000' }}></div>
          </div>

          <div className="flex space-x-4">
            <button 
            className="flex items-center justify-center w-1/2 py-2 rounded-lg hover:bg-gray-200"
            style={{ color: '#000000', border: '2px solid #694969' }}
            onClick={handleGoogleLogin} // Llamada al login con Google
            >
            <FcGoogle className="mr-2"/> Google
            </button>
            <button className="flex items-center justify-center w-1/2 py-2 rounded-lg hover:bg-gray-200"
            style={{ color: '#000000', border: '2px solid #694969' }} 
            onClick={handleGithubLogin} // Llamada al login con GitHub
            >
            <FaGithub className="mr-2" /> Github
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}