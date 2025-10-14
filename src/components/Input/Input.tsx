import React, { forwardRef } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import type { FormControlProps } from 'react-bootstrap/esm/FormControl';
import styles from './Input.module.css';

// Object for label positioning (alternative to enum)
export const LabelPosition = {
  TOP: 'top',
  LEFT: 'left',
} as const;

type LabelPositionType = typeof LabelPosition[keyof typeof LabelPosition];

interface InputProps extends Omit<FormControlProps, 'type'> {
  label?: string;
  error?: string;
  type?: FormControlProps['type'] | 'textarea';
  addonBefore?: React.ReactNode;
  addonAfter?: React.ReactNode;
  floating?: boolean;
  labelPosition?: LabelPositionType; // New prop for label positioning
}

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(({
  label,
  error,
  type = 'text',
  addonBefore,
  addonAfter,
  floating = false,
  labelPosition = LabelPosition.TOP, // Default to TOP
  className = '',
  isInvalid,
  ...props
}, ref) => {
  // If isInvalid is not explicitly provided, derive it from error
  const invalid = isInvalid ?? !!error;
  
  const inputClasses = `${styles.input} ${invalid ? styles['input--invalid'] : ''} ${className}`.trim();
  
  const renderInput = () => {
    if (type === 'textarea') {
      return (
        <Form.Control
          as="textarea"
          ref={ref as React.Ref<HTMLTextAreaElement>}
          isInvalid={invalid}
          className={inputClasses}
          {...props}
        />
      );
    }
    
    return (
      <Form.Control
        type={type}
        ref={ref as React.Ref<HTMLInputElement>}
        isInvalid={invalid}
        className={inputClasses}
        {...props}
      />
    );
  };
  
  if (floating && label) {
    return (
      <div className={styles['input-wrapper--floating']}>
        {renderInput()}
        <label htmlFor={props.id} className={styles['input-label--floating']}>{label}</label>
        {error && <div className={styles['input-error']}>{error}</div>}
      </div>
    );
  }
  
  // Handle different label positions
  if (label && labelPosition === LabelPosition.LEFT) {
    return (
      <div className={`${styles['input-wrapper']} ${styles['input-wrapper--horizontal']}`}>
        <label className={`${styles['input-label']} ${styles['input-label--left']}`}>{label}</label>
        <div className={styles['input-container']}>
          {addonBefore || addonAfter ? (
            <div className={styles['input-group']}>
              {addonBefore && <span className={`${styles['input-group__addon']} ${styles['input-group__addon--before']}`}>{addonBefore}</span>}
              {renderInput()}
              {addonAfter && <span className={`${styles['input-group__addon']} ${styles['input-group__addon--after']}`}>{addonAfter}</span>}
            </div>
          ) : (
            renderInput()
          )}
          {error && <div className={styles['input-error']}>{error}</div>}
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles['input-wrapper']}>
      {label && <label className={styles['input-label']}>{label}</label>}
      
      {addonBefore || addonAfter ? (
        <div className={styles['input-group']}>
          {addonBefore && <span className={`${styles['input-group__addon']} ${styles['input-group__addon--before']}`}>{addonBefore}</span>}
          {renderInput()}
          {addonAfter && <span className={`${styles['input-group__addon']} ${styles['input-group__addon--after']}`}>{addonAfter}</span>}
        </div>
      ) : (
        renderInput()
      )}
      
      {error && <div className={styles['input-error']}>{error}</div>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;