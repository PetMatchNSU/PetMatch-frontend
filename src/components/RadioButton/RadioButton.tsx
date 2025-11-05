import React from 'react';
import { Form } from 'react-bootstrap';
import type { FormCheckProps } from 'react-bootstrap/esm/FormCheck';
import styles from './RadioButton.module.css';

interface RadioButtonOption {
  value: string;
  label: string;
}

type LabelPosition = 'top' | 'left';

interface RadioButtonProps {
  name: string;
  options: RadioButtonOption[];
  selectedValue?: string;
  onChange?: (value: string) => void;
  label?: string;
  labelPosition?: LabelPosition;
  inline?: boolean;
  disabled?: boolean;
}

const RadioButton: React.FC<RadioButtonProps> = ({
  name,
  options,
  selectedValue,
  onChange,
  label,
  labelPosition = 'top',
  inline = false,
  disabled = false,
}) => {
  const isHorizontal = labelPosition === 'left';
  
  return (
    <div className={`${styles.radioButtonWrapper} ${isHorizontal ? styles.radioButtonWrapperHorizontal : ''}`}>
      {label && (
        <div className={`${styles.radioButtonLabel} ${isHorizontal ? styles.radioButtonLabelLeft : ''}`}>
          {label}
                  </div>
                )}
                <div className={`${styles.radioButtonContainer} ${disabled ? styles.radioButtonContainerDisabled : ''}`}>
                  {options.map((option) => (
                    <Form.Check
                      key={option.value}
                      type="radio"
                      id={`${name}-${option.value}`}
                      name={name}
                      label={option.label}
                      value={option.value}
                      checked={selectedValue === option.value}
                      onChange={(e) => onChange?.(e.target.value)}
                      inline={inline}
                      disabled={disabled}
                    />
                  ))}
                </div>
              </div>
            );
          };

export default RadioButton;
export type { LabelPosition };