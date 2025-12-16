import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { api } from '../services/api';
import type { LoginCredentials } from '../types/user';
import Input from '../components/Input/Input';
import Button from '../components/Button/Button';
import LinksBlock from '../components/LinksBlock/LinksBlock';
import styles from './Login.module.css';

const schema = yup.object({
  email: yup
    .string()
    .email('Введите корректный email')
    .required('Email обязателен для заполнения'),
  password: yup
    .string()
    .required('Пароль обязателен для заполнения')
    .min(8, 'Пароль должен содержать минимум 8 символов')
    .max(50, 'Пароль не должен превышать 50 символов')
    .matches(/[A-Z]/, 'Пароль должен содержать хотя бы одну заглавную букву')
    .matches(/[a-z]/, 'Пароль должен содержать хотя бы одну строчную букву')
    .matches(/\d/, 'Пароль должен содержать хотя бы одну цифру')
    .matches(/^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]*$/, 'Пароль содержит недопустимые символы'),
}).required();

const Login: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const [serverError, setServerError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const onSubmit = async (data: LoginCredentials) => {
    setServerError(null);
    
    try {
      const result = await api.loginUser(data);
      console.log('Login successful:', result);
      setLoginSuccess(true);
      
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
      
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.response?.status === 400) {
        setServerError('Неверный email или пароль');
      } else if (error.message) {
        setServerError(error.message);
      } else {
        setServerError('Сервис временно недоступен, приносим извинения за неудобства');
      }
    }
  };

  if (loginSuccess) {
    return (
      <div className={styles.login}>
        <div className={styles.login__container}>
          <div className={styles.login__success}>
            <h1 className={styles.login__title}>Вход выполнен</h1>
            <div className={styles.login__message}>
              Вы успешно вошли в систему. Перенаправляем на главную страницу...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.login}>
      
      <div className={styles.login__container}>
        {serverError && (
          <div className={styles.login__error}>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className={styles.login__form}>
          <h1>Войти</h1>
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
                { text: "Забыли пароль?", to: "/forgot-password" }
              ]}
            />
          </div>

          <Button
            type="submit"
            size="large"
            disabled={isSubmitting}
            className={styles.login__submit}
          >
            {isSubmitting ? 'Вход...' : 'Войти'}
          </Button>

          <div className={styles.login__register}>
            <LinksBlock 
              title="Ещё нет аккаунта?"
              links={[
                { text: "Зарегистрироваться", to: "/register" }
              ]}
              layout = 'horizontal'
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;