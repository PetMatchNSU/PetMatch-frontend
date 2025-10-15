import React, { useState } from 'react';
import Toggle from '../Toggle/Toggle';
import styles from './RegistrationTable.module.css';

interface ContactInfo {
  email: string;
  phone: string;
  telegram: string;
  vk: string;
}

interface VisibilitySettings {
  email: boolean;
  phone: boolean;
  telegram: boolean;
  vk: boolean;
}

interface RegistrationTableProps {
  onContactInfoChange: (contactInfo: ContactInfo) => void;
  onVisibilityChange: (visibility: VisibilitySettings) => void;
  contactInfo: ContactInfo;
  visibility: VisibilitySettings;
}

const RegistrationTable: React.FC<RegistrationTableProps> = ({
  onContactInfoChange,
  onVisibilityChange,
  contactInfo,
  visibility
}) => {
  const handleInputChange = (field: keyof ContactInfo, value: string) => {
    onContactInfoChange({ ...contactInfo, [field]: value });
  };

  const handleToggleChange = (field: keyof VisibilitySettings) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onVisibilityChange({ ...visibility, [field]: e.target.checked });
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
              <input
                type="email"
                placeholder="Введите email"
                value={contactInfo.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={styles.tableInput}
              />
            </td>
            <td>
              <div className={styles.toggleWrapper}>
                <Toggle
                  checked={visibility.email}
                  onChange={handleToggleChange('email')}
                  wrapperClassName={styles.noMargin}
                />
              </div>
            </td>
          </tr>
          <tr>
            <td>Телефон</td>
            <td>
              <input
                type="tel"
                placeholder="Введите номер телефона"
                value={contactInfo.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={styles.tableInput}
              />
            </td>
            <td>
              <div className={styles.toggleWrapper}>
                <Toggle
                  checked={visibility.phone}
                  onChange={handleToggleChange('phone')}
                  wrapperClassName={styles.noMargin}
                />
              </div>
            </td>
          </tr>
          <tr>
            <td>Telegram</td>
            <td>
              <input
                placeholder="Введите логин Telegram"
                value={contactInfo.telegram}
                onChange={(e) => handleInputChange('telegram', e.target.value)}
                className={styles.tableInput}
              />
            </td>
            <td>
              <div className={styles.toggleWrapper}>
                <Toggle
                  checked={visibility.telegram}
                  onChange={handleToggleChange('telegram')}
                  wrapperClassName={styles.noMargin}
                />
              </div>
            </td>
          </tr>
          <tr>
            <td>VK</td>
            <td>
              <input
                placeholder="Введите логин VK"
                value={contactInfo.vk}
                onChange={(e) => handleInputChange('vk', e.target.value)}
                className={styles.tableInput}
              />
            </td>
            <td>
              <div className={styles.toggleWrapper}>
                <Toggle
                  checked={visibility.vk}
                  onChange={handleToggleChange('vk')}
                  wrapperClassName={styles.noMargin}
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default RegistrationTable;