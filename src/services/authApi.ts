/**
 * Auth API - RTK Query endpoints для авторизации и регистрации
 */

import { baseApi } from './baseApi';
import { tokenManager } from '../utils/tokenManager';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  VerifyEmailRequest,
} from '../types/auth';

/**
 * Auth API - расширение базового API с эндпоинтами авторизации
 */
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Авторизация через email
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/user/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          tokenManager.setTokens(data.accessToken, data.refreshToken);
        } catch (error) {
          console.error('Login failed:', error);
        }
      },
      invalidatesTags: ['User'],
    }),

    // Регистрация через email
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (userData) => ({
        url: '/user/register',
        method: 'POST',
        body: userData,
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          tokenManager.setTokens(data.accessToken, data.refreshToken);
        } catch (error) {
          console.error('Registration failed:', error);
        }
      },
      invalidatesTags: ['User'],
    }),

    // Обновление токена
    refreshToken: builder.mutation<RefreshTokenResponse, RefreshTokenRequest>({
      query: (body) => ({
        url: '/user/refresh',
        method: 'POST',
        body,
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          tokenManager.setTokens(data.accessToken, data.refreshToken);
        } catch (error) {
          console.error('Token refresh failed:', error);
          tokenManager.clearTokens();
        }
      },
    }),

    // Подтверждение email
    verifyEmail: builder.mutation<void, VerifyEmailRequest>({
      query: (body) => ({
        url: '/user/verify-email',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    // Logout (клиентский)
    logout: builder.mutation<void, void>({
      queryFn: () => {
        tokenManager.clearTokens();
        return { data: undefined };
      },
      invalidatesTags: ['User'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useRefreshTokenMutation,
  useVerifyEmailMutation,
  useLogoutMutation,
} = authApi;
