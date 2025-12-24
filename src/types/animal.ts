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

// Цель размещения (из API)
export interface Goal {
  id: number;
  name: AnimalGoal;
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

// ===========================================
// API: GET /api/v1/animals/info
// ===========================================

// Ответ на запрос информации о видах и целях
export interface AnimalInfoResponse {
  species: Species[];
  goals: Goal[];
}

// ===========================================
// API: POST /api/v1/animals/create
// ===========================================

// Запрос на создание животного
export interface CreateAnimalRequest {
  name: string;
  speciesId: number;
  goal: AnimalGoal;
  cost?: number | null; // только если goal = 'SELL'
  hasBreed: boolean;
  breed?: string; // только если hasBreed = true
  gender: AnimalGender;
  birthday: string; // формат YYYY-MM-DD
  weight?: number | null;
  color: string;
  geneticDiseases: string;
  description?: string;
}

// Ответ на создание животного
export interface CreateAnimalResponse {
  animalId: number;
  status: string;
}

// ===========================================
// API: GET /api/v1/animals/show/{animalId}
// ===========================================

// Фотографии животного
export interface AnimalPhotos {
  mainPhotoId: number | null;
  additionalIds: number[];
}

// Документы животного
export interface AnimalDocuments {
  vetPassportId: number | null;
  pedigreeId: number | null;
  vetCertificatesId: number | null;
  diplomasId: number | null;
  otherDocumentsId: number | null;
}

// Полная информация о животном (ответ GET /api/v1/animals/show/{id})
export interface AnimalDetailResponse {
  canEdit: boolean;
  name: string;
  species: Species;
  goal: AnimalGoal;
  cost?: number | null;
  hasBreed: boolean;
  breed?: string | null;
  gender: AnimalGender;
  birthday: string; // формат YYYY-MM-DD
  weight?: number | null;
  color: string;
  geneticDiseases: string;
  description?: string;
  reviewStatus: AnimalReviewStatus;
  photos: AnimalPhotos;
  documents: AnimalDocuments;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

// ===========================================
// API: PUT /api/v1/animals/update?animalId
// ===========================================

// Запрос на обновление животного (аналогичен CreateAnimalRequest)
export interface UpdateAnimalRequest {
  name: string;
  speciesId: number;
  goal: AnimalGoal;
  cost?: number | null;
  hasBreed: boolean;
  breed?: string;
  gender: AnimalGender;
  birthday: string;
  weight?: number | null;
  color: string;
  geneticDiseases: string;
  description?: string;
}

// Ответ на обновление животного
export interface UpdateAnimalResponse {
  animal_id: number;
  status: string;
}

// ===========================================
// API: Файлы (POST /api/v1/files/upload)
// ===========================================

// Тип файла
export type FileType = 'doc' | 'photo' | 'DOC' | 'PHOTO';

// Дескриптор файла для загрузки
export interface FileUploadDescriptor {
  originalFilename: string;
  isMain: boolean;
  fileType: FileType;
}

// Метаданные для загрузки файлов
export interface FileUploadMetadata {
  // cardId: number;
  descriptors: FileUploadDescriptor[];
}

// Статус загрузки
export type UploadingStatus = 'ok' | 'not_valid' | 'internal_error';

// Дескриптор результата загрузки
export interface FileUploadResultDescriptor {
  originalFilename: string;
  uploadingStatus: UploadingStatus;
  fileId?: string;
}

// Ответ на загрузку файлов
export interface FileUploadResponse {
  descriptors: FileUploadResultDescriptor[];
}

// ===========================================
// API: Файлы (GET /api/v1/files?query=...)
// ===========================================

// Запрос на получение файлов
export interface FileGetRequest {
  fileIds?: string[];
  cardIds?: string[];
  isMain?: boolean;
  fileType?: FileType[];
}

// Дескриптор файла в ответе (API возвращает snake_case)
export interface FileDescriptor {
  file_id: string;
  file_type: FileType;
  is_main: boolean;
  original_filename: string;
  card_id: string;
  content: string; // Base64
}

// Ответ на получение файлов
export interface FileGetResponse {
  descriptors: FileDescriptor[];
}

// ===========================================
// API: Файлы (DELETE /api/v1/files)
// ===========================================

// Запрос на удаление файлов
export interface FileDeleteRequest {
  fileIds?: string[];
  cardIds?: string[];
}

// Статус удаления
export type DeletingStatus = 'deleted' | 'internal_error';

// Дескриптор результата удаления
export interface FileDeleteResultDescriptor {
  fileId: string;
  deletingStatus: DeletingStatus;
}

// Ответ на удаление файлов
export interface FileDeleteResponse {
  descriptors: FileDeleteResultDescriptor[];
}

// ===========================================
// API: GET /api/v1/user/animals/list
// ===========================================

// Питомец пользователя (для страницы "Мои питомцы")
export interface UserAnimalItem {
  id: number;
  name: string;
  speciesName: string;
  goal: AnimalGoal;
  breed?: string | null;
  gender: AnimalGender;
  birthday: string; // YYYY-MM-DD
  mainPhotoId: number | null;
  reviewStatus: 'ON_CHECKING' | 'OK' | 'BLOCKED';
  reviewComment?: string;
}

// Ответ на запрос списка питомцев пользователя
export interface UserAnimalsListResponse {
  animalsList: UserAnimalItem[];
}

// ===========================================
// API: GET /api/v1/animals/show/{animalId}/contacts
// ===========================================

// Время для связи
export interface OwnerBondTime {
  bondTimeStart: string; // HH:mm
  bondTimeEnd: string;   // HH:mm
}

// Контакт владельца
export interface OwnerContactInfo {
  type: 'PHONE' | 'EMAIL' | 'TELEGRAM' | 'VK';
  contact: string;
}

// Ответ на запрос контактов владельца
export interface AnimalOwnerContactsResponse {
  firstName: string;
  secondName: string;
  middleName?: string;
  bondTime: OwnerBondTime[];
  contactInfo: OwnerContactInfo[];
}

// ===========================================
// Локальные типы для формы
// ===========================================

// Типы документов (для UI)
export type DocumentType = 'vetPassport' | 'pedigree' | 'vetCertificate' | 'diplomas' | 'other';

// Локальный файл (для формы)
export interface LocalFile {
  id: string; // fileId от сервера или временный ID
  file: File | null;
  url: string; // URL для превью (blob: или data:)
  isDeleted: boolean;
  isNew: boolean; // true если файл только что загружен и ещё не на сервере
  originalFilename?: string;
}

// Локальный документ (для формы)
export interface LocalDocument extends LocalFile {
  type: DocumentType;
}
