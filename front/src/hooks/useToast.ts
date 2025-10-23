import { useState, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = (
    type: ToastType,
    title: string,
    message: string,
    duration: number = 5000
  ) => {
    const id = Date.now().toString();
    const newToast: ToastData = {
      id,
      type,
      title,
      message,
      duration
    };

    setToasts(prev => [...prev, newToast]);

    // Auto remove toast after duration
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showSuccess = (title: string, message: string, duration?: number) => {
    showToast('success', title, message, duration);
  };

  const showError = (title: string, message: string, duration?: number) => {
    showToast('error', title, message, duration);
  };

  const showInfo = (title: string, message: string, duration?: number) => {
    showToast('info', title, message, duration);
  };

  return {
    toasts,
    showToast,
    showSuccess,
    showError,
    showInfo,
    removeToast
  };
};
