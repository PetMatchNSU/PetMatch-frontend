/**
 * Base API - базовая конфигурация для всех RTK Query API
 * Содержит общую логику авторизации и обработки токенов
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { tokenManager } from '../utils/tokenManager';
import type { RefreshTokenResponse } from '../types/auth';

// http://localhost:8091/api/v1  - local 
// http://158.160.173.155/api/v1 - server
const API_BASE_URL = 'http://158.160.173.155/api/v1'; 

/**
 * Custom base query с автоматическим добавлением токена и обработкой refresh
 * Используется для всех API endpoints в приложении
 */
export const baseQueryWithAuth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const baseQuery = fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = tokenManager.getAccessToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  });

  let result = await baseQuery(args, api, extraOptions);

  // Проверяем нужен ли refresh: 401 или сообщение об отсутствии аутентификации
  const errorData = result.error?.data as { message?: string } | undefined;
  const needsRefresh = result.error?.status === 401 ||
    errorData?.message === 'Full authentication is required to access this resource';

  // Если нужен refresh и есть refresh token, пробуем обновить токены
  if (result.error && needsRefresh) {
    const refreshToken = tokenManager.getRefreshToken();

    if (refreshToken && !tokenManager.isTokenExpired(refreshToken)) {
      // Пытаемся обновить токен
      const refreshResult = await baseQuery(
        {
          url: '/user/refresh',
          method: 'POST',
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        const { accessToken, refreshToken: newRefreshToken } = refreshResult.data as RefreshTokenResponse;

        // Сохраняем новые токены
        tokenManager.setTokens(accessToken, newRefreshToken);

        // Повторяем исходный запрос с новым токеном
        result = await baseQuery(args, api, extraOptions);
      } else {
        // Refresh запрос не удался - очищаем токены и редирект на /login
        tokenManager.clearTokens();
        window.location.href = '/login';
      }
    } else {
      // Нет валидного refresh token - очищаем токены и редирект на /login
      tokenManager.clearTokens();
      window.location.href = '/login';
    }
  }

  return result;
};

/**
 * Базовый API для расширения другими API
 * Все специфичные API (authApi, petApi, userApi) будут использовать этот базовый
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['User', 'Pet', 'City'],
  endpoints: () => ({}),
});
