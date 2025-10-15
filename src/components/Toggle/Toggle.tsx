import React from 'react';
import { Form } from 'react-bootstrap';
import type { FormCheckProps } from 'react-bootstrap/esm/FormCheck';
import styles from './Toggle.module.css';

type LabelPosition = 'top' | 'left';

interface ToggleProps extends Omit<FormCheckProps, 'type' | 'labelPosition'> {
  label?: string;
  labelPosition?: LabelPosition;
  error?: string;
  wrapperClassName?: string;
}

const Toggle: React.FC<ToggleProps> = ({
  checked = false,
  onChange,
  label,
  labelPosition = 'top',
  disabled = false,
  error,
  id,
  wrapperClassName = '',
  ...props
}) => {
  const isHorizontal = labelPosition === 'left';
  
  return (
    <div className={`${styles.toggleWrapper} ${isHorizontal ? styles.toggleWrapperHorizontal : ''} ${wrapperClassName}`.trim()}>
      {label && (
        <div className={`${styles.toggleLabel} ${isHorizontal ? styles.toggleLabelLeft : ''}`}>
          {label}
        </div>
      )}
      
      <div className={styles.toggleContainer}>
        <Form.Check
          type="switch"
          id={id}
          label=""
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          isInvalid={!!error}
          {...props}
        />
        
        {error && <div className={styles.toggleError}>{error}</div>}
      </div>
    </div>
  );
};

export default Toggle;
export type { LabelPosition };