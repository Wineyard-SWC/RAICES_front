'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../contexts/usercontext';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, githubProvider } from '../utils/firebaseConfig';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUserId } = useUser();
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL!;

  const loginWithEmail = async (email: string, password: string) => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        setError('Please verify your email before logging in.');
        return;
      }

      const token = await user.getIdToken();
      localStorage.setItem('authToken', token);
      localStorage.setItem('userId', user.uid);

      setUserId(user.uid);

      await validateTokenWithBackend(token);
      router.push('/projects');
    } catch (err: any) {
      setError('Error logging in: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const token = await userCredential.user.getIdToken();

      localStorage.setItem('authToken', token);
      localStorage.setItem('userId', userCredential.user.uid);

      setUserId(userCredential.user.uid);

      await validateTokenWithBackend(token);
      router.push('/dashboard');
    } catch (err: any) {
      setError('Error logging in: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGithub = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithPopup(auth, githubProvider);
      const token = await userCredential.user.getIdToken();
      localStorage.setItem('authToken', token);
      localStorage.setItem('userId', userCredential.user.uid);

      setUserId(userCredential.user.uid);

      await validateTokenWithBackend(token);
      router.push('/dashboard');
    } catch (err: any) {
      setError('Error logging in: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const validateTokenWithBackend = async (token: string) => {
    const response = await fetch(`${API_URL}/token`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Server returned error: ${response.status}`);
    }

    return response.json();
  };

  return {
    loginWithEmail,
    loginWithGoogle,
    loginWithGithub,
    isLoading,
    error,
  };
};
