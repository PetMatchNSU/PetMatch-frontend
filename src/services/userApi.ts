/**
 * User API - RTK Query endpoints для работы с профилем пользователя
 */

import { baseApi } from './baseApi';
import { setProfile, setError } from '../store/profileSlice';
import type {
  UserProfileResponse,
  UpdateUserRequest,
  CitiesResponse,
  UserContactsResponse,
} from '../types/user';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/v1/user - Получить профиль пользователя
    getUserProfile: builder.query<UserProfileResponse, void>({
      query: () => '/user',
      providesTags: ['User'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setProfile(data));
        } catch (error) {
          dispatch(setError('Не удалось загрузить профиль'));
        }
      },
    }),

    // PUT /api/v1/user - Обновить профиль пользователя
    updateUserProfile: builder.mutation<void, UpdateUserRequest>({
      query: (data) => ({
        url: '/user',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    // GET /api/v1/city?name= - Поиск городов
    searchCities: builder.query<CitiesResponse, string>({
      query: (name) => `/city?name=${encodeURIComponent(name)}`,
      providesTags: ['City'],
    }),

    // GET /api/v1/user/contacts - Получить контакты для отображения
    getUserContacts: builder.query<UserContactsResponse, void>({
      query: () => '/user/contacts',
    }),
  }),
});

export const {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useSearchCitiesQuery,
  useLazySearchCitiesQuery,
  useGetUserContactsQuery,
} = userApi;
