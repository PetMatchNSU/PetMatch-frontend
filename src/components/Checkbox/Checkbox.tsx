import React, { forwardRef } from 'react';
import styles from './Checkbox.module.css';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  error?: string;
  description?: React.ReactNode;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  error,
  description,
  className = '',
  id,
  checked,
  ...props
}, ref) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
  
  const checkboxClasses = `
    ${styles.checkbox}
    ${error ? styles['checkbox--invalid'] : ''}
    ${className}
  `.trim();

  return (
    <div className={styles['checkbox-wrapper']}>
      <div className={styles['checkbox-container']}>
        <input
          type="checkbox"
          ref={ref}
          id={checkboxId}
          className={styles['checkbox-input']}
          checked={checked}
          {...props}
        />
        <label htmlFor={checkboxId} className={styles['checkbox-label']}>
          <span className={styles['checkbox-custom']}></span>
          {label && <span className={styles['checkbox-text']}>{label}</span>}
        </label>
      </div>
      
      {description && (
        <div className={styles['checkbox-description']}>
          {description}
        </div>
      )}
      
      {error && <div className={styles['checkbox-error']}>{error}</div>}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;