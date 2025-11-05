import React from 'react';
import ReactSelect from 'react-select';
import type { Props as ReactSelectProps } from 'react-select';
import styles from './Select.module.css';

// Object for label positioning (similar to Input component)
export const LabelPosition = {
  TOP: 'top',
  LEFT: 'left',
} as const;

type LabelPositionType = typeof LabelPosition[keyof typeof LabelPosition];

interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps extends Omit<ReactSelectProps<SelectOption>, 'labelPosition'> {
  label?: string;
  labelPosition?: LabelPositionType;
  error?: string;
  isDisabled?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  labelPosition = LabelPosition.TOP,
  error,
  isDisabled = false,
  className = '',
  ...props
}) => {
  const wrapperClasses = `${styles.selectWrapper} ${
    label && labelPosition === LabelPosition.LEFT ? styles['selectWrapper--horizontal'] : ''
  }`.trim();

  // Custom styles for react-select
  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      border: '1px solid #AC7F5E',
      borderRadius: '6px',
      minHeight: '36px',
      boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(172, 127, 94, 0.25)' : 'none',
      '&:hover': {
        borderColor: '#966d52',
      },
      backgroundColor: isDisabled ? '#f5f5f5' : '#fff',
      cursor: isDisabled ? 'not-allowed' : 'default',
    }),
    menu: (provided: any) => ({
      ...provided,
      border: '1px solid #AC7F5E',
      borderRadius: '6px',
      boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)',
      zIndex: 1000,
      backgroundColor: '#fff',
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      fontFamily: "'Roboto', sans-serif",
      fontWeight: 300,
      fontSize: '16px',
      color: '#50280E',
      backgroundColor: state.isSelected 
        ? '#AC7F5E' // Brown color for selected option
        : state.isFocused ? '#f8f9fa' : '#fff',
      transition: 'background-color 0.15s ease-in-out',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: state.isSelected ? '#966d52' : '#f8f9fa',
      },
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: '#888888',
      fontFamily: "'Roboto', sans-serif",
      fontWeight: 300,
      fontSize: '16px',
      opacity: 0.7,
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: '#50280E',
      fontFamily: "'Roboto', sans-serif",
      fontWeight: 300,
      fontSize: '16px',
    }),
    input: (provided: any) => ({
      ...provided,
      color: '#50280E',
    }),
  };

  return (
    <div className={wrapperClasses}>
      {label && (
        <label className={`${styles.selectLabel} ${
          labelPosition === LabelPosition.LEFT ? styles['selectLabel--left'] : ''
        }`}>
          {label}
        </label>
      )}
      
      <div className={styles.selectContainer}>
        <ReactSelect
          className={`${styles.reactSelect} ${className}`}
          styles={customStyles}
          isDisabled={isDisabled}
          {...props}
        />
        
        {error && <div className={styles.selectError}>{error}</div>}
      </div>
    </div>
  );
};

export default CustomSelect;