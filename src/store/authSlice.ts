/**
 * Auth Slice - управление состоянием авторизации
 * Хранит информацию о текущем пользователе и статусе авторизации
 */

import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../types/auth';
import { tokenManager } from '../utils/tokenManager';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  emailVerified: boolean;
  isInitialized: boolean; // Флаг для проверки, что приложение инициализировано
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  emailVerified: false,
  isInitialized: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Установить пользователя после успешной авторизации/регистрации
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.emailVerified = action.payload.emailVerified;
    },

    // Установить статус верификации email
    setEmailVerified: (state, action: PayloadAction<boolean>) => {
      state.emailVerified = action.payload;
      if (state.user) {
        state.user.emailVerified = action.payload;
      }
    },

    // Обновить данные пользователя
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },

    // Выход из системы
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.emailVerified = false;
      tokenManager.clearTokens();
    },

    // Инициализация приложения (проверка токенов при загрузке)
    initializeAuth: (state) => {
      const hasTokens = tokenManager.hasValidTokens();
      state.isAuthenticated = hasTokens;
      state.isInitialized = true;

      // Если токены валидны, но пользователя нет - нужно будет загрузить профиль
      if (hasTokens && !state.user) {
        // Здесь можно триггерить загрузку профиля через RTK Query
        // Это будет в useAuth хуке
      }
    },

    // Сброс флага инициализации (для тестов)
    resetInitialization: (state) => {
      state.isInitialized = false;
    },
  },
});

export const { setUser, setEmailVerified, updateUser, clearAuth, initializeAuth, resetInitialization } =
  authSlice.actions;

export default authSlice.reducer;
