import React, { useState } from 'react';
import Toast from './Toast';
import { ToastData } from '../../hooks/useToast';

interface ToastManagerProps {
  toasts: ToastData[];
  onRemoveToast: (id: string) => void;
}

const ToastManager: React.FC<ToastManagerProps> = ({ toasts, onRemoveToast }) => {
  const [closingToasts, setClosingToasts] = useState<Set<string>>(new Set());

  const handleCloseToast = (id: string) => {
    setClosingToasts(prev => new Set(prev).add(id));
    
    // Remove from closing state and from toasts after animation
    setTimeout(() => {
      setClosingToasts(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      onRemoveToast(id);
    }, 400);
  };

  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          isVisible={true}
          isClosing={closingToasts.has(toast.id)}
          onClose={() => handleCloseToast(toast.id)}
        />
      ))}
    </>
  );
};

export default ToastManager;
