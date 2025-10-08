import React from 'react';
import styles from './Button.module.css';

// Define button sizes
export const ButtonSize = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
} as const;

type ButtonSizeType = typeof ButtonSize[keyof typeof ButtonSize];

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick?: () => void;
  disabled?: boolean;
  size?: ButtonSizeType;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  disabled = false,
  size = ButtonSize.MEDIUM,
  children,
  className = '',
  ...props
}) => {
  const buttonClasses = `${styles.button} ${styles[`button--${size}`]} ${
    disabled ? styles['button--disabled'] : ''
  } ${className}`.trim();

  return (
    <button
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;