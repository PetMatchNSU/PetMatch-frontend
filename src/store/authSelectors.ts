/**
 * Auth Selectors - селекторы для получения данных авторизации из store
 * Вынесены в отдельный файл чтобы избежать циклических импортов
 */

import type { RootState } from './index';

export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectEmailVerified = (state: RootState) => state.auth.emailVerified;
export const selectIsInitialized = (state: RootState) => state.auth.isInitialized;
