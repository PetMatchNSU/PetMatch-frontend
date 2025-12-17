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
const API_BASE_URL = 'http://localhost:8091/api/v1'; 


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
      if (token && !tokenManager.isTokenExpired(token)) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  });

  let result = await baseQuery(args, api, extraOptions);

  // Если получили 401 и есть refresh token, пробуем обновить токены
  if (result.error && result.error.status === 401) {
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
        // Refresh token истек или невалиден - очищаем токены
        tokenManager.clearTokens();

        // Можно добавить редирект на /login или dispatch action
        // window.location.href = '/login';
      }
    } else {
      // Нет валидного refresh token
      tokenManager.clearTokens();
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
