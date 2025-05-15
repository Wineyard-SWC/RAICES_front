'use client';

import React, { useEffect } from 'react';
import { CheckCircle, AlertTriangle, X, Info } from 'lucide-react';
import "../styles/globals.css"

type ToastType = 'success' | 'error' | 'info' | 'warning';

export type ToastProps = {
  message: string;
  type?: ToastType;
  visible: boolean;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
};

const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'success', 
  visible, 
  onClose,
  autoClose = true,
  duration = 5000
}) => {
    useEffect(() => {
        if (visible && autoClose) {
          const timer = setTimeout(() => {
            onClose();
          }, duration);
    
          return () => clearTimeout(timer);
        }
      }, [visible, autoClose, duration, onClose]);
    
      if (!visible) return null;
  
  const config = {
    success: {
      bgColor: 'bg-green-100',
      textColor: 'text-green-700',
      borderColor: 'border-green-400',
      Icon: CheckCircle
    },
    error: {
      bgColor: 'bg-red-100',
      textColor: 'text-red-700',
      borderColor: 'border-red-400',
      Icon: AlertTriangle
    },
    info: {
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-400',
      Icon: Info
    },
    warning: {
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-700',
      borderColor: 'border-yellow-400',
      Icon: AlertTriangle
    }
  };
  
  const { bgColor, textColor, borderColor, Icon } = config[type];
  
  
  return (
    <div 
      className={`fixed top-4 right-4 ${bgColor} border ${borderColor} ${textColor} px-4 py-3 rounded shadow-md flex items-center justify-between transition-opacity duration-300 toast-animate-in z-50 max-w-md`}
      role="alert"
    >
      <div className="flex items-center">
        <Icon className="w-5 h-5 mr-2 flex-shrink-0" />
        <span className="font-medium">{message}</span>
      </div>
      <button 
        onClick={onClose} 
        className="ml-4 text-gray-500 hover:text-gray-700 focus:outline-none"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;