/**
 * Email Verification Page - страница подтверждения email
 *
 * Функционал:
 * - Автоматическое извлечение кода из URL query параметра (?code=123)
 * - Отправка кода на backend для подтверждения
 * - Обработка успешного подтверждения (редирект на /feed)
 * - Обработка ошибок (истекший/неверный код)
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Button/Button';
import styles from './EmailVerification.module.css';

const EmailVerification: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail, isVerifyingEmail } = useAuth();

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const code = searchParams.get('code');

    if (!code) {
      setStatus('error');
      setErrorMessage('Код подтверждения не найден в ссылке');
      return;
    }

    // Автоматически отправляем код на подтверждение
    const verify = async () => {
      const result = await verifyEmail(code);

      if (result.success) {
        setStatus('success');
        // Редирект происходит автоматически в useAuth
      } else {
        setStatus('error');
        setErrorMessage(
          result.error || 'Неверный код или срок действия истёк. Мы выслали новое письмо для подтверждения почты'
        );
      }
    };

    verify();
  }, [searchParams, verifyEmail]);

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

  // Состояние: Ошибка
  return (
    <div className={styles['email-verification']}>
      <div className={styles['email-verification__container']}>
        <div className={styles['email-verification__content']}>
          <h1 className={styles['email-verification__title']}>Ошибка подтверждения</h1>
          <div className={styles['email-verification__error']}>
            {errorMessage}
          </div>

          <div className={styles['email-verification__actions']}>
            <Button
              size="large"
              onClick={() => navigate('/login')}
              className={styles['email-verification__button']}
            >
              Вернуться на страницу входа
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
