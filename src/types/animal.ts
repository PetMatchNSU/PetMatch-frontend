/**
 * Типы для API животных
 */

// Местоположение
export interface AnimalLocation {
  region: string;
  city: string;
}

// Вид животного
export interface Species {
  id: number;
  name: string;
}

// Порода
export interface Breed {
  id: number;
  name: string;
}

// Порода для фильтра
export interface BreedFilter {
  idBreed: number;
  breedName: string;
}

// Цели размещения
export type AnimalGoal = 'SELL' | 'FREE' | 'BUY' | 'PAIRING';

// Пол животного
export type AnimalGender = 'M' | 'F';

// Статус проверки
export type AnimalReviewStatus = 'ON_CHECKING' | 'PUBLISHED' | 'BLOCKED';

// Направление сортировки
export type SortDirection = 'desc' | 'asc';

// Животное в списке (краткая информация для карточки)
export interface AnimalListItem {
  animalId: number;
  name: string;
  speciesName: string;
  goal: AnimalGoal;
  hasBreed: boolean;
  breed: string | null;
  gender: AnimalGender;
  birthday: string; // YYYY-MM-DD
  location: AnimalLocation;
  mainPhotoId: number | null;
  createdAt: string; // ISO date string
}

// Фильтры для запроса списка животных
export interface AnimalsFilters {
  userId?: number;
  species?: Species;
  hasBreed?: boolean;
  breeds?: BreedFilter[];
  gender?: AnimalGender;
  goals?: AnimalGoal[];
  vetPassport?: boolean;
  pedigree?: boolean;
  location?: AnimalLocation;
}

// Пагинация для запроса
export interface PaginationRequest {
  page: number;
  limit: number;
}

// Пагинация в ответе
export interface PaginationResponse {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// POST /api/v1/animals/list - запрос
export interface AnimalsListRequest {
  filters?: AnimalsFilters;
  pagination: PaginationRequest;
  sortDirection?: SortDirection;
}

// POST /api/v1/animals/list - ответ
export interface AnimalsListResponse {
  animalsList: AnimalListItem[];
  pagination: PaginationResponse;
}

// GET /api/v1/animals/breeds/{speciesId} - ответ
export interface BreedsResponse {
  breeds: Breed[];
}

// GET /api/v1/animals/species - ответ (если понадобится)
export interface SpeciesResponse {
  species: Species[];
}

// Параметры для загрузки фото
export interface FileQueryParams {
  fileId: number;
  width?: number;
  height?: number;
}
