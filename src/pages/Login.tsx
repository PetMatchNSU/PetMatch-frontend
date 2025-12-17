/**
 * Login Page - страница авторизации
 *
 * Функционал:
 * - Авторизация по email и паролю
 * - Валидация полей формы (Yup schema)
 * - Обработка ошибок сервера
 * - Показ сообщения о неподтвержденном email
 * - Редирект после успешного входа на исходную страницу
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import { useAuth } from '../hooks/useAuth';
import type { LoginRequest } from '../types/auth';
import Input from '../components/Input/Input';
import Button from '../components/Button/Button';
import LinksBlock from '../components/LinksBlock/LinksBlock';
import textLogo from '../assets/PetMatch_text (3).svg';
import logo from '../assets/PetMatch_logo (1).svg';
import styles from './Login.module.css';

// Схема валидации для формы авторизации
const loginSchema = yup.object({
  email: yup
    .string()
    .email('Введите корректный email')
    .max(64, 'Email не должен превышать 64 символа')
    .required('Email обязателен для заполнения'),
  password: yup
    .string()
    .min(8, 'Пароль должен содержать минимум 8 символов')
    .max(64, 'Пароль не должен превышать 64 символа')
    .required('Пароль обязателен для заполнения'),
}).required();

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoginLoading } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginRequest>({
    resolver: yupResolver(loginSchema),
    mode: 'onChange', // Валидация при изменении для активации кнопки
    reValidateMode: 'onChange',
  });

  const onSubmit = async (data: LoginRequest) => {
    setServerError(null);

    const result = await login(data);

    if (!result.success) {
      setServerError(result.error || 'Ошибка авторизации');
      return;
    }

    if (result.success) {
      navigate('/feed');
    }
  };

  return (
    <div className={styles.login}>
      <div className={styles.login__container}>
        {/* Логотип текст PETMATCH */}
        <div className={styles['login__header']}>
          <img src={textLogo} alt="PetMatch" className={styles['login__text-logo']} />
        </div>

        {/* Иконка с лапками и котятами */}
        <div className={styles['login__logo-wrapper']}>
          <img src={logo} alt="PetMatch Logo" className={styles['login__logo']} />
        </div>

        {/* Ошибка сервера */}
        {serverError && (
          <div className={styles.login__error}>
            {serverError}
          </div>
        )}

        {/* Форма авторизации */}
        <form onSubmit={handleSubmit(onSubmit)} className={styles.login__form}>
          <Input
            label="Email"
            type="email"
            placeholder="Введите ваш email"
            {...register('email')}
            error={errors.email?.message}
          />

          <div className={styles.login__password}>
            <Input
              label="Пароль"
              type="password"
              placeholder="Введите ваш пароль"
              {...register('password')}
              error={errors.password?.message}
            />
            <LinksBlock
              title=""
              links={[
                { text: 'Забыли пароль?', to: '/forgot-password' }
              ]}
            />
          </div>

          <Button
            type="submit"
            size="large"
            disabled={!isValid || isLoginLoading}
            className={styles.login__submit}
          >
            {isLoginLoading ? 'Вход...' : 'Войти'}
          </Button>

          <div className={styles.login__register}>
            <LinksBlock
              title="Ещё нет аккаунта?"
              links={[
                { text: 'Зарегистрироваться', to: '/register' }
              ]}
              layout="horizontal"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;