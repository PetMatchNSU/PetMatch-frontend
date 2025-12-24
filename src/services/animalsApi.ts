/**
 * Animals API - RTK Query endpoints для работы с животными
 */

import { baseApi } from './baseApi';
import type {
  AnimalsListRequest,
  AnimalsListResponse,
  BreedsResponse,
  SpeciesResponse,
  AnimalInfoResponse,
  CreateAnimalRequest,
  CreateAnimalResponse,
  AnimalDetailResponse,
  UpdateAnimalRequest,
  UpdateAnimalResponse,
  FileUploadMetadata,
  FileUploadResponse,
  FileGetRequest,
  FileGetResponse,
  FileDeleteRequest,
  FileDeleteResponse,
  UserAnimalsListResponse,
  AnimalOwnerContactsResponse,
} from '../types/animal';

// Base URL для файлов
const API_BASE_URL = 'http://158.160.173.155/api/v1';

/**
 * Генерация URL для загрузки фото по fileId (для списков/превью)
 * @deprecated Используйте getFilesQuery для получения файлов с base64 контентом
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

/**
 * Построить URL для запроса файлов по cardId
 * @param cardId - ID карточки
 * @param fileType - тип файлов (photo/doc)
 * @param isMain - только главное фото
 */
export const buildFilesQueryUrl = (
  cardId: number | string,
  fileType?: ('PHOTO' | 'DOC')[],
  isMain?: boolean
): string => {
  const request: Record<string, any> = {
    cardIds: [cardId.toString()],
  };

  if (fileType) {
    request.fileType = fileType;
  }

  if (isMain !== undefined) {
    request.isMain = isMain;
  }

  const base64Query = btoa(JSON.stringify(request));
  return `${API_BASE_URL}/files?query=${base64Query}`;
};

/**
 * Конвертировать base64 контент в data URL для отображения
 * @param content - base64 encoded content
 * @param mimeType - MIME тип (по умолчанию image/png)
 */
export const base64ToDataUrl = (content: string, mimeType: string = 'image/png'): string => {
  return `data:${mimeType};base64,${content}`;
};

/**
 * Определить MIME тип по имени файла
 */
export const getMimeType = (filename: string): string => {
  const ext = filename.toLowerCase().split('.').pop();
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpg',
    png: 'image/png',
    gif: 'image/gif',
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  };
  return mimeTypes[ext || ''] || 'application/octet-stream';
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

    // GET /api/v1/animals/info - Получить виды животных и цели размещения
    getAnimalInfo: builder.query<AnimalInfoResponse, void>({
      query: () => '/animals/info',
      providesTags: ['AnimalInfo'],
    }),

    // POST /api/v1/animals/create - Создать карточку животного
    createAnimal: builder.mutation<CreateAnimalResponse, CreateAnimalRequest>({
      query: (body) => ({
        url: '/animals/create',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Pet'],
    }),

    // GET /api/v1/animals/show/{animalId} - Получить информацию о животном
    getAnimalDetail: builder.query<AnimalDetailResponse, number>({
      query: (animalId) => `/animals/show/${animalId}`,
      providesTags: (result, error, animalId) => [{ type: 'Pet', id: animalId }],
    }),

    // PUT /api/v1/animals/update?animalId - Обновить карточку животного
    updateAnimal: builder.mutation<UpdateAnimalResponse, { animalId: number; data: UpdateAnimalRequest }>({
      query: ({ animalId, data }) => ({
        url: `/animals/update?animalId=${animalId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { animalId }) => [{ type: 'Pet', id: animalId }, 'Pet'],
    }),

    // POST /api/v1/files/upload - Загрузить файлы
    uploadFiles: builder.mutation<FileUploadResponse, { files: File[]; metadata: FileUploadMetadata, adId: number }>({
      query: ({ files, metadata, adId }) => {
        const formData = new FormData();

        // Добавляем все файлы
        files.forEach((file) => {
          formData.append('files', file);
        });

        // Добавляем метаданные как JSON строку
        formData.append('metadata', JSON.stringify(metadata));
        formData.append('adId', adId.toString());

        return {
          url: '/files/upload',
          method: 'POST',
          body: formData,
        };
      },
    }),

    // GET /api/v1/files?query=jsonModelInBase64 - Получить файлы
    getFiles: builder.query<FileGetResponse, FileGetRequest>({
      query: (request) => {
        const base64Query = btoa(JSON.stringify(request));
        return `/files?query=${base64Query}`;
      },
    }),

    // DELETE /api/v1/files - Удалить файлы
    deleteFiles: builder.mutation<FileDeleteResponse, FileDeleteRequest>({
      query: (request) => ({
        url: '/files',
        method: 'DELETE',
        body: request,
      }),
    }),

    // GET /api/v1/animals/show/{animalId}/contacts - Получить контакты владельца
    getAnimalOwnerContacts: builder.query<AnimalOwnerContactsResponse, number>({
      query: (animalId) => `/animals/show/${animalId}/contacts`,
    }),

    // GET /api/v1/user/animals/list - Получить список питомцев пользователя
    getUserAnimals: builder.query<UserAnimalsListResponse, void>({
      query: () => '/user/animals/list',
      providesTags: ['Pet'],
    }),

    // DELETE /api/v1/animals/{animalId} - Удалить карточку питомца
    deleteAnimal: builder.mutation<void, number>({
      query: (animalId) => ({
        url: `/animals/${animalId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Pet'],
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
  useGetAnimalInfoQuery,
  useCreateAnimalMutation,
  useGetAnimalDetailQuery,
  useLazyGetAnimalDetailQuery,
  useUpdateAnimalMutation,
  useUploadFilesMutation,
  useGetFilesQuery,
  useLazyGetFilesQuery,
  useDeleteFilesMutation,
  useLazyGetAnimalOwnerContactsQuery,
  useGetUserAnimalsQuery,
  useDeleteAnimalMutation,
} = animalsApi;
