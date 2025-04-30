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

  const firebaseErrorMap: { [key: string]: string } = {
    'auth/user-not-found': 'No user found with this email address.',
    'auth/wrong-password': 'Incorrect email or password. Please try again.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-disabled': 'This account has been disabled. Contact support.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/account-exists-with-different-credential': 'Account already in use in other method'
  };

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
      const code = err?.code || ''
      setError(firebaseErrorMap[code] || err.message || 'Something went wrong. Please try again.')
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
      router.push('/projects');
    } 

    catch (err: any) 
    {
      const code = err?.code || ''
      setError(firebaseErrorMap[code] || err.message || 'Something went wrong. Please try again.')
    } 

    finally 
    {
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
      router.push('/projects');
    } 

    catch (err: any) 
    {
      const code = err?.code || ''
      setError(firebaseErrorMap[code] || err.message || 'Something went wrong. Please try again.')
    } 

    finally 
    {
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
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData?.detail || 'Failed to validate session. Please log in again.'
      throw new Error(errorMessage)
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
