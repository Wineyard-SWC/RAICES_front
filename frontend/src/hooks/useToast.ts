'use client';

import { useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastState {
  message: string;
  type: ToastType;
  visible: boolean;
}

interface UseToastReturn {
  toast: ToastState;
  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;
}

const DEFAULT_TOAST: ToastState = {
  message: '',
  type: 'success',
  visible: false
};

/**
 * Hook personalizado para gestionar notificaciones toast
 * @returns {UseToastReturn} Objeto con el estado del toast y funciones para mostrarlo y ocultarlo
 */
export function useToast(): UseToastReturn {
  const [toast, setToast] = useState<ToastState>(DEFAULT_TOAST);

  /**
   * Muestra un toast con un mensaje y tipo especificados
   * @param {string} message - El mensaje a mostrar
   * @param {ToastType} type - El tipo de toast (success, error, info, warning)
   */
  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    setToast({
      message,
      type,
      visible: true
    });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }));
  }, []);

  return { toast, showToast, hideToast };
}

export default useToast;