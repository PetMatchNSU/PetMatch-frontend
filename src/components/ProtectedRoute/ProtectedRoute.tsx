/**
 * ProtectedRoute - компонент для защиты приватных роутов
 *
 * Проверяет авторизацию пользователя перед отображением защищенного контента.
 * Если пользователь не авторизован - перенаправляет на /login
 */

import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectIsInitialized } from '../../store/authSelectors';
import styles from './ProtectedRoute.module.css';

interface ProtectedRouteProps {
  children: ReactNode;
  requireEmailVerification?: boolean; // Опционально: требовать верификацию email
}

export const ProtectedRoute = ({ children, requireEmailVerification = false }: ProtectedRouteProps) => {
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isInitialized = useSelector(selectIsInitialized);

  // Пока приложение не инициализировано, показываем загрузку (или ничего)
  // Это предотвращает мигание редиректа при первой загрузке страницы
  if (!isInitialized) {
    return (
      <div className={styles['protected-route__loader']}>
        <div className={styles['protected-route__loader-text']}>Загрузка...</div>
      </div>
    );
  }

  // Если пользователь не авторизован, перенаправляем на /login
  // Сохраняем текущий путь в state для возврата после авторизации
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // TODO: Добавить проверку на requireEmailVerification если нужно
  // const isEmailVerified = useSelector(selectIsEmailVerified);
  // if (requireEmailVerification && !isEmailVerified) {
  //   return <Navigate to="/verify-email" state={{ from: location.pathname }} replace />;
  // }

  return <>{children}</>;
};
