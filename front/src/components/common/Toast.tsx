import React from 'react';
import styled, { keyframes } from 'styled-components';

const slideInRight = keyframes`
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const slideOutRight = keyframes`
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(100%); opacity: 0; }
`;

const ToastContainer = styled.div<{ isClosing: boolean; type: 'success' | 'error' | 'info' }>`
  position: fixed;
  top: 20px;
  right: 20px;
  background: ${props => {
    switch (props.type) {
      case 'success': return 'linear-gradient(135deg, #28a745, #20c997)';
      case 'error': return 'linear-gradient(135deg, #dc3545, #e74c3c)';
      case 'info': return 'linear-gradient(135deg, #17a2b8, #6f42c1)';
      default: return 'linear-gradient(135deg, #6c757d, #495057)';
    }
  }};
  color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  max-width: 380px;
  width: calc(100% - 40px);
  display: flex;
  align-items: center;
  gap: 1rem;
  animation: ${(props) => (props.isClosing ? slideOutRight : slideInRight)} 0.4s ease-out forwards;

  @media (max-width: 480px) {
    top: 10px;
    right: 10px;
    left: 10px;
    width: auto;
    max-width: none;
  }
`;

const ToastIcon = styled.div<{ type: 'success' | 'error' | 'info' }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 1.2rem;
`;

const ToastContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ToastTitle = styled.h4`
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 700;
`;

const ToastMessage = styled.p`
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.9;
  line-height: 1.4;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  font-size: 12px;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
`;

interface ToastProps {
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  isVisible: boolean;
  isClosing: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ 
  type, 
  title, 
  message, 
  isVisible, 
  isClosing, 
  onClose 
}) => {
  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      default: return 'ℹ️';
    }
  };

  return (
    <ToastContainer type={type} isClosing={isClosing}>
      <CloseButton onClick={onClose}>✕</CloseButton>
      
      <ToastIcon type={type}>
        {getIcon()}
      </ToastIcon>

      <ToastContent>
        <ToastTitle>{title}</ToastTitle>
        <ToastMessage>{message}</ToastMessage>
      </ToastContent>
    </ToastContainer>
  );
};

export default Toast;
