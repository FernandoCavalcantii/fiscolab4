import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './BackButton.module.css';

interface BackButtonProps {
  onClick?: () => void;
  to?: string;
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ 
  onClick, 
  to, 
  className = '' 
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button 
      className={`${styles.backButton} ${className}`} 
      onClick={handleClick}
    >
      &larr;
    </button>
  );
};

export default BackButton;
