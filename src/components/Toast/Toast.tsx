/**
 * Toast Component - компонент для отображения уведомлений
 *
 * Поддерживает типы:
 * - success (зеленый фон)
 * - error (красный фон)
 * - info (синий фон)
 * - warning (желтый фон)
 *
 * Автоматически закрывается через заданное время (по умолчанию 5 секунд)
 */

import React, { useEffect } from 'react';
import styles from './Toast.module.css';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number; // в миллисекундах
  onClose: () => void;
  isVisible: boolean;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 5000,
  onClose,
  isVisible,
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const typeClass = styles[`toast--${type}`];

  return (
    <div className={`${styles.toast} ${typeClass}`}>
      <div className={styles.toast__content}>
        <span className={styles.toast__message}>{message}</span>
        <button className={styles.toast__close} onClick={onClose}>
          &times;
        </button>
      </div>
    </div>
  );
};

export default Toast;
