/**
 * Token Manager - утилита для работы с JWT токенами
 * Обеспечивает безопасное хранение и валидацию токенов
 */

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

interface TokenPayload {
  exp: number;
  iat: number;
  [key: string]: any;
}

/**
 * Декодирует JWT токен без верификации (только для проверки срока действия)
 */
const decodeToken = (token: string): TokenPayload | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

/**
 * Проверяет, истек ли токен
 * @param token - JWT токен
 * @returns true если токен истек
 */
const isTokenExpired = (token: string): boolean => {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) {
    return true;
  }

  // Добавляем буфер в 10 секунд для предотвращения race conditions
  const currentTime = Date.now() / 1000;
  return payload.exp < currentTime + 10;
};

/**
 * Сохраняет токены в localStorage
 */
const setTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

/**
 * Получает access token из localStorage
 */
const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * Получает refresh token из localStorage
 */
const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Удаляет все токены и данные авторизации из localStorage
 */
const clearTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  // Очистка дополнительных данных авторизации
  localStorage.removeItem('user');
  localStorage.removeItem('authState');
};

/**
 * Проверяет наличие валидных токенов
 */
const hasValidTokens = (): boolean => {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();

  if (!accessToken && !refreshToken) {
    return false;
  }

  // Если есть access token и он не истек
  if (accessToken && !isTokenExpired(accessToken)) {
    return true;
  }

  // Если есть refresh token и он не истек
  if (refreshToken && !isTokenExpired(refreshToken)) {
    return true;
  }

  return false;
};

/**
 * Проверяет, нужно ли обновить access token
 */
const shouldRefreshToken = (): boolean => {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();

  // Если нет access token или он истек, но есть refresh token
  if ((!accessToken || isTokenExpired(accessToken)) && refreshToken && !isTokenExpired(refreshToken)) {
    return true;
  }

  return false;
};

/**
 * Получает userId из access token
 */
const getUserId = (): number | null => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return null;
  }

  const payload = decodeToken(accessToken);
  if (!payload) {
    return null;
  }

  // userId может быть в разных полях в зависимости от бэкенда
  return payload.userID;
};

/**
 * Получает email из access token
 */
const getEmail = (): string | null => {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return null;
  }

  const payload = decodeToken(accessToken);
  if (!payload) {
    return null;
  }

  return payload.email || null;
};

export const tokenManager = {
  setTokens,
  getAccessToken,
  getRefreshToken,
  clearTokens,
  hasValidTokens,
  shouldRefreshToken,
  isTokenExpired,
  decodeToken,
  getUserId,
  getEmail,
};
