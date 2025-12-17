import { configureStore } from '@reduxjs/toolkit'
import exampleReducer from './exampleSlice'
import helloReducer from './helloSlice'
import authReducer from './authSlice'
import { baseApi } from '../services/baseApi'

/**
 * Redux Store - централизованное хранилище состояния приложения
 *
 * Включает:
 * - authReducer: управление состоянием авторизации и пользователя
 * - baseApi: RTK Query API для работы с backend (auth, pets, users и т.д.)
 * - example/hello: демо-редьюсеры (можно удалить позже)
 */
export const store = configureStore({
  reducer: {
    example: exampleReducer,
    hello: helloReducer,
    auth: authReducer,
    // RTK Query API reducer
    [baseApi.reducerPath]: baseApi.reducer,
  },
  // Добавляем middleware для RTK Query (кэширование, инвалидация, refetching)
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch