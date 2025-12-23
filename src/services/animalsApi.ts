/**
 * Animals API - RTK Query endpoints для работы с животными
 */

import { baseApi } from './baseApi';
import type {
  AnimalsListRequest,
  AnimalsListResponse,
  BreedsResponse,
  SpeciesResponse,
} from '../types/animal';

// Base URL для файлов
const API_BASE_URL = 'http://158.160.173.155/api/v1';

/**
 * Генерация URL для загрузки фото
 * @param fileId - ID файла
 * @param width - ширина (опционально)
 * @param height - высота (опционально)
 */
export const getPhotoUrl = (fileId: number | null, width?: number, height?: number): string | null => {
  if (!fileId) return null;

  const params: Record<string, number> = { fileId };
  if (width) params.width = width;
  if (height) params.height = height;

  const base64Query = btoa(JSON.stringify(params));
  return `${API_BASE_URL}/files?query=${base64Query}`;
};

export const animalsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // POST /api/v1/animals/list - Получить список животных
    getAnimalsList: builder.query<AnimalsListResponse, AnimalsListRequest>({
      query: (body) => ({
        url: '/animals/list',
        method: 'POST',
        body,
      }),
      providesTags: ['Pet'],
    }),

    // GET /api/v1/animals/breeds/{speciesId} - Получить список пород
    getBreeds: builder.query<BreedsResponse, number>({
      query: (speciesId) => `/animals/breeds/${speciesId}`,
    }),

    // GET /api/v1/animals/species - Получить список видов животных
    getSpecies: builder.query<SpeciesResponse, void>({
      query: () => '/animals/species',
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAnimalsListQuery,
  useLazyGetAnimalsListQuery,
  useGetBreedsQuery,
  useLazyGetBreedsQuery,
  useGetSpeciesQuery,
} = animalsApi;
