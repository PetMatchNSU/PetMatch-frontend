/**
 * useAuth - кастомный хук для управления авторизацией
 *
 * Предоставляет удобный API для работы с авторизацией во всем приложении:
 * - Информация о пользователе
 * - Методы для login/logout/register
 * - Статусы загрузки и ошибок
 * - Инициализация auth при загрузке приложения
 */

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useVerifyEmailMutation,
  useRefreshTokenMutation,
} from '../services/authApi';
import {
  setUser,
  clearAuth,
  initializeAuth,
  setEmailVerified,
} from '../store/authSlice';
import {
  selectAuth,
  selectIsAuthenticated,
  selectEmailVerified,
} from '../store/authSelectors';
import { tokenManager } from '../utils/tokenManager';
import type { LoginRequest, RegisterRequest } from '../types/auth';
import type { AppDispatch } from '../store';

/**
 * Хук для работы с авторизацией
 */
export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useSelector(selectAuth);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const emailVerified = useSelector(selectEmailVerified);

  // RTK Query мутации
  const [loginMutation, { isLoading: isLoginLoading, error: loginError }] = useLoginMutation();
  const [registerMutation, { isLoading: isRegisterLoading, error: registerError }] = useRegisterMutation();
  const [logoutMutation] = useLogoutMutation();
  const [verifyEmailMutation, { isLoading: isVerifyingEmail, error: verifyEmailError }] = useVerifyEmailMutation();
  const [refreshTokenMutation] = useRefreshTokenMutation();

  /**
   * Инициализация авторизации при загрузке приложения
   * Проверяет токены и обновляет их если нужно
   */
  useEffect(() => {
    const initAuth = async () => {
      // Проверяем, нужно ли обновить токены
      if (tokenManager.shouldRefreshToken()) {
        const refreshToken = tokenManager.getRefreshToken();
        if (refreshToken) {
          try {
            await refreshTokenMutation({ refreshToken }).unwrap();
            dispatch(initializeAuth());
          } catch (error) {
            console.error('Token refresh failed during init:', error);
            tokenManager.clearTokens();
            dispatch(initializeAuth());
          }
        }
      } else {
        dispatch(initializeAuth());
      }
    };

    if (!auth.isInitialized) {
      initAuth();
    }
  }, [auth.isInitialized, dispatch, refreshTokenMutation]);

  /**
   * Авторизация пользователя
   */
  const login = async (credentials: LoginRequest) => {
    try {
      const result = await loginMutation(credentials).unwrap();

      // Сохраняем пользователя в store
      dispatch(setUser({
        email: credentials.email,
        emailVerified: result.user.emailVerified,
      }));
      console.log(result);
      console.log(result?.user);
      console.log(result?.user?.emailVerified);
      console.log(!result?.user?.emailVerified);
      
      // Если email не подтвержден - не редиректим, показываем сообщение
      if (!result.user.emailVerified) {
        console.log('кто ты воин');
        return { success: true, emailVerified: false };
      }
      
      // Перенаправляем на страницу, с которой пришел пользователь, или на главную
      // const from = (location.state as { from?: string })?.from || '/';
      navigate('/feed', { replace: true });

      return { success: true, emailVerified: true };
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error?.data?.message || 'Ошибка авторизации',
      };
    }
  };

  /**
   * Регистрация пользователя
   */
  const register = async (userData: RegisterRequest) => {
    try {
      const result = await registerMutation(userData).unwrap();

      // Сохраняем пользователя в store
      dispatch(setUser({
        email: userData.email,
        emailVerified: result.user.emailVerified,
        firstName: userData.firstName,
        secondName: userData.secondName,
        middleName: userData.middleName,
        gender: userData.gender,
        region: userData.region,
        city: userData.city,
      }));

      return { success: true, emailVerified: result.user.emailVerified };
    } catch (error: any) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error?.data?.message || 'Ошибка регистрации',
      };
    }
  };

  /**
   * Выход из системы
   */
  const logout = async () => {
    try {
      await logoutMutation().unwrap();
      dispatch(clearAuth());
      navigate('/feed', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Все равно чистим локальные данные
      dispatch(clearAuth());
      navigate('/feed', { replace: true });
    }
  };

  /**
   * Подтверждение email
   */
  const verifyEmail = async (code: string) => {
    try {
      await verifyEmailMutation({ code }).unwrap();
      dispatch(setEmailVerified(true));
      navigate('/feed', { replace: true });
      return { success: true };
    } catch (error: any) {
      console.error('Email verification error:', error);
      return {
        success: false,
        error: error?.data?.message || 'Ошибка подтверждения email',
      };
    }
  };

  return {
    // Состояние
    user: auth.user,
    isAuthenticated,
    emailVerified,
    isInitialized: auth.isInitialized,

    // Методы
    login,
    register,
    logout,
    verifyEmail,

    // Статусы загрузки
    isLoginLoading,
    isRegisterLoading,
    isVerifyingEmail,

    // Ошибки
    loginError,
    registerError,
    verifyEmailError,
  };
};
