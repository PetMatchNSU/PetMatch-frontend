import React, { useState, useRef, useEffect } from 'react';
import styles from './PreferredTimeInput.module.css';

interface PreferredTimeInputProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
}

const PreferredTimeInput: React.FC<PreferredTimeInputProps> = ({
  label = 'Предпочитаемое время связи',
  value = '',
  onChange,
  error
}) => {
  // Split value into "from" and "to" parts
  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');
  
  const fromInputRef = useRef<HTMLInputElement>(null);
  const toInputRef = useRef<HTMLInputElement>(null);

  // Parse initial value
  useEffect(() => {
    if (value) {
      const [from, to] = value.split('-');
      setFromTime(from || '');
      setToTime(to || '');
    }
  }, [value]);

  // Format time value (HH:MM)
  const formatTime = (value: string): string => {
    if (!value) return '';
    
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Take only first 4 digits
    const cleanValue = digits.substring(0, 4);
    
    // Format as HH:MM
    if (cleanValue.length >= 3) {
      const hours = cleanValue.substring(0, 2);
      const minutes = cleanValue.substring(2, 4);
      return `${hours}:${minutes}`;
    } else if (cleanValue.length > 0) {
      return cleanValue;
    }
    
    return '';
  };

  // Handle input change with masking
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setTime: React.Dispatch<React.SetStateAction<string>>,
    isFromTime: boolean
  ) => {
    const inputValue = e.target.value;
    const formattedValue = formatTime(inputValue);
    
    setTime(formattedValue);
    
    // Call onChange with combined value
    if (onChange) {
      const newValue = isFromTime 
        ? `${formattedValue}-${toTime}` 
        : `${fromTime}-${formattedValue}`;
      onChange(newValue);
    }
  };

  // Handle from time input
  const handleFromTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange(e, setFromTime, true);
  };

  // Handle to time input
  const handleToTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange(e, setToTime, false);
  };

  // Handle key down for better UX
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    nextRef?: React.RefObject<HTMLInputElement>
  ) => {
    if (e.key === 'ArrowRight' && nextRef?.current) {
      nextRef.current.focus();
    }
  };

  return (
    <div className={styles['preferred-time-input']}>
      <div className={styles['preferred-time-input__container']}>
        {label && <label className={styles['preferred-time-input__label']}>{label}</label>}
        
        <div className={styles['preferred-time-input__wrapper']}>
          <div className={styles['preferred-time-input__first-half']}>
            <span className={styles['preferred-time-input__prefix']}>с</span>
            <div className={styles['preferred-time-input__time-wrapper']}>
              <input
                ref={fromInputRef}
                type="text"
                value={fromTime}
                onChange={handleFromTimeChange}
                onKeyDown={(e) => handleKeyDown(e, toInputRef as React.RefObject<HTMLInputElement>)}
                placeholder="__:__"
                maxLength={5}
                className={styles['preferred-time-input__time']}
              />
            </div>
          </div>
          
          <div className={styles['preferred-time-input__second-half']}>
            <span className={styles['preferred-time-input__separator']}>по</span>
            <div className={styles['preferred-time-input__time-wrapper']}>
              <input
                ref={toInputRef}
                type="text"
                value={toTime}
                onChange={handleToTimeChange}
                onKeyDown={(e) => handleKeyDown(e)}
                placeholder="__:__"
                maxLength={5}
                className={styles['preferred-time-input__time']}
              />
            </div>
          </div>
        </div>
      </div>
      
      {error && <div className={styles['preferred-time-input__error']}>{error}</div>}
    </div>
  );
};

export default PreferredTimeInput;