/**
 * Email Verification Page - страница подтверждения email
 *
 * Функционал:
 * - Ввод кода подтверждения из письма
 * - Отправка кода на backend для подтверждения
 * - Обработка успешного подтверждения (редирект на /feed)
 * - Обработка ошибок (истекший/неверный код)
 */

import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/Input/Input';
import Button from '../components/Button/Button';
import styles from './EmailVerification.module.css';

const EmailVerification: React.FC = () => {
  const { verifyEmail, isVerifyingEmail } = useAuth();

  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [code, setCode] = useState<string>('');

  // Обработчик отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      setErrorMessage('Введите код подтверждения');
      return;
    }

    setStatus('verifying');
    setErrorMessage('');

    const result = await verifyEmail(code.trim());

    if (result.success) {
      setStatus('success');
    } else {
      setStatus('error');
      setErrorMessage(
        result.error || 'Неверный код или срок действия истёк. Мы выслали новое письмо для подтверждения почты'
      );
    }
  };

  // Состояние: Идет проверка
  if (status === 'verifying' || isVerifyingEmail) {
    return (
      <div className={styles['email-verification']}>
        <div className={styles['email-verification__container']}>
          <div className={styles['email-verification__content']}>
            <h1 className={styles['email-verification__title']}>Подтверждение email</h1>
            <div className={styles['email-verification__message']}>
              Проверяем ваш код подтверждения...
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Состояние: Успех
  if (status === 'success') {
    return (
      <div className={styles['email-verification']}>
        <div className={styles['email-verification__container']}>
          <div className={styles['email-verification__content']}>
            <h1 className={styles['email-verification__title']}>Email подтвержден!</h1>
            <div className={styles['email-verification__message']}>
              Ваш email успешно подтвержден. Перенаправляем на главную страницу...
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Состояние: Форма для ввода кода (idle или error)
  return (
    <div className={styles['email-verification']}>
      <div className={styles['email-verification__container']}>
        <div className={styles['email-verification__content']}>
          <h1 className={styles['email-verification__title']}>Подтверждение email</h1>

          <div className={styles['email-verification__message']}>
            Введите код подтверждения из письма.
          </div>

          {errorMessage && (
            <div className={styles['email-verification__error']}>
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles['email-verification__form']}>
            <Input
              label="Код подтверждения"
              type="text"
              placeholder="Введите код из письма"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />

            <div className={styles['email-verification__actions']}>
              <Button
                type="submit"
                size="large"
                disabled={!code.trim()}
                className={styles['email-verification__button']}
              >
                Подтвердить
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
