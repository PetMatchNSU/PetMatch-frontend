import React, { useEffect, useState } from 'react';
import Toggle from '../Toggle/Toggle';
import styles from './RegistrationTable.module.css';
import type { ContactInfo } from '../../types/auth';

type ContactType = 'EMAIL' | 'PHONE' | 'TELEGRAM' | 'VK';

interface LocalContactState {
  email: { contact: string; visible: boolean };
  phone: { contact: string; visible: boolean };
  telegram: { contact: string; visible: boolean };
  vk: { contact: string; visible: boolean };
}

interface ValidationErrors {
  email?: string;
  phone?: string;
}

interface RegistrationTableProps {
  contactInfo: ContactInfo[];
  onChange: (contacts: ContactInfo[], isValid: boolean) => void;
  error?: string;
}

const contactTypeMap: Record<string, ContactType> = {
  email: 'EMAIL',
  phone: 'PHONE',
  telegram: 'TELEGRAM',
  vk: 'VK',
};

const PREFIXES = {
  phone: '+7',
  telegram: '@',
  vk: 'https://vk.com/',
};

const RegistrationTable: React.FC<RegistrationTableProps> = ({
  contactInfo,
  onChange,
  error,
}) => {
  const [localState, setLocalState] = useState<LocalContactState>({
    email: { contact: '', visible: true },
    phone: { contact: '', visible: false },
    telegram: { contact: '', visible: false },
    vk: { contact: '', visible: false },
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<{ email: boolean; phone: boolean }>({
    email: false,
    phone: false,
  });

  // Валидация email
  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) {
      return 'Email обязателен для заполнения';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Введите корректный email';
    }
    return undefined;
  };

  // Валидация телефона (10 цифр после +7)
  const validatePhone = (phone: string): string | undefined => {
    if (!phone) {
      return undefined; // Телефон не обязателен
    }
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length !== 10) {
      return 'Номер телефона должен содержать 10 цифр';
    }
    return undefined;
  };

  // Проверка валидности всей формы
  const validate = (state: LocalContactState): { errors: ValidationErrors; isValid: boolean } => {
    const errors: ValidationErrors = {};

    const emailError = validateEmail(state.email.contact);
    if (emailError) errors.email = emailError;

    const phoneError = validatePhone(state.phone.contact);
    if (phoneError) errors.phone = phoneError;

    const isValid = !emailError && !phoneError;
    return { errors, isValid };
  };

  // Синхронизация с входящим contactInfo
  useEffect(() => {
    const newState: LocalContactState = {
      email: { contact: '', visible: true },
      phone: { contact: '', visible: false },
      telegram: { contact: '', visible: false },
      vk: { contact: '', visible: false },
    };

    contactInfo.forEach((item) => {
      const key = item.type.toLowerCase() as keyof LocalContactState;
      if (newState[key]) {
        newState[key] = {
          contact: item.contact,
          visible: key === 'email' ? true : item.visible
        };
      }
    });

    setLocalState(newState);
  }, [contactInfo]);

  const convertToContactInfoArray = (state: LocalContactState): ContactInfo[] => {
    const result: ContactInfo[] = [];
    (Object.keys(state) as Array<keyof LocalContactState>).forEach((key) => {
      if (state[key].contact) {
        result.push({
          type: contactTypeMap[key],
          contact: state[key].contact,
          visible: key === 'email' ? true : state[key].visible,
        });
      }
    });
    return result;
  };

  const handleInputChange = (field: keyof LocalContactState, value: string) => {
    const newState = {
      ...localState,
      [field]: { ...localState[field], contact: value },
    };
    setLocalState(newState);

    // Валидируем и передаём результат наверх
    const { errors, isValid } = validate(newState);
    setValidationErrors(errors);
    onChange(convertToContactInfoArray(newState), isValid);
  };

  const handleBlur = (field: 'email' | 'phone') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const { errors } = validate(localState);
    setValidationErrors(errors);
  };

  const handleToggleChange = (field: keyof LocalContactState) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (field === 'email') return;

      const newState = {
        ...localState,
        [field]: { ...localState[field], visible: e.target.checked },
      };
      setLocalState(newState);
      const { isValid } = validate(newState);
      onChange(convertToContactInfoArray(newState), isValid);
    };

  return (
    <div className={styles.registrationTableContainer}>
      <table className={styles.contactTable}>
        <thead>
          <tr>
            <th>Способ связи</th>
            <th>Логин/Имя</th>
            <th>Показывать другим пользователям</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Email</td>
            <td>
              <div className={styles.inputCell}>
                <input
                  type="email"
                  placeholder="Введите email"
                  value={localState.email.contact}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className={`${styles.tableInput} ${touched.email && validationErrors.email ? styles.inputError : ''}`}
                />
                {touched.email && validationErrors.email && (
                  <div className={styles.fieldError}>{validationErrors.email}</div>
                )}
              </div>
            </td>
            <td>
              <div className={styles.toggleWrapper}>
                <Toggle
                  checked={true}
                  onChange={() => {}}
                  disabled={true}
                  wrapperClassName={styles.noMargin}
                />
              </div>
            </td>
          </tr>
          <tr>
            <td>Телефон</td>
            <td>
              <div className={styles.inputCell}>
                <div className={styles.inputWithPrefix}>
                  <span className={styles.prefix}>{PREFIXES.phone}</span>
                  <input
                    type="tel"
                    placeholder="9001234567"
                    value={localState.phone.contact}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    onBlur={() => handleBlur('phone')}
                    className={`${styles.tableInputWithPrefix} ${touched.phone && validationErrors.phone ? styles.inputError : ''}`}
                  />
                </div>
                {touched.phone && validationErrors.phone && (
                  <div className={styles.fieldError}>{validationErrors.phone}</div>
                )}
              </div>
            </td>
            <td>
              <div className={styles.toggleWrapper}>
                <Toggle
                  checked={localState.phone.visible}
                  onChange={handleToggleChange('phone')}
                  wrapperClassName={styles.noMargin}
                />
              </div>
            </td>
          </tr>
          <tr>
            <td>Telegram</td>
            <td>
              <div className={styles.inputWithPrefix}>
                <span className={styles.prefix}>{PREFIXES.telegram}</span>
                <input
                  placeholder="username"
                  value={localState.telegram.contact}
                  onChange={(e) => handleInputChange('telegram', e.target.value)}
                  className={styles.tableInputWithPrefix}
                />
              </div>
            </td>
            <td>
              <div className={styles.toggleWrapper}>
                <Toggle
                  checked={localState.telegram.visible}
                  onChange={handleToggleChange('telegram')}
                  wrapperClassName={styles.noMargin}
                />
              </div>
            </td>
          </tr>
          <tr>
            <td>VK</td>
            <td>
              <div className={styles.inputWithPrefix}>
                <span className={styles.prefix}>{PREFIXES.vk}</span>
                <input
                  placeholder="id или username"
                  value={localState.vk.contact}
                  onChange={(e) => handleInputChange('vk', e.target.value)}
                  className={styles.tableInputWithPrefix}
                />
              </div>
            </td>
            <td>
              <div className={styles.toggleWrapper}>
                <Toggle
                  checked={localState.vk.visible}
                  onChange={handleToggleChange('vk')}
                  wrapperClassName={styles.noMargin}
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
};

export default RegistrationTable;
