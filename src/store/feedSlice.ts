/**
 * Feed Slice - управление состоянием ленты животных
 */

import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  AnimalListItem,
  AnimalsFilters,
  PaginationResponse,
  SortDirection,
} from '../types/animal';

interface FeedState {
  // Список животных
  animals: AnimalListItem[];
  // Буфер для предзагрузки (следующие 10 карточек)
  bufferedAnimals: AnimalListItem[];
  // Пагинация
  pagination: PaginationResponse | null;
  currentPage: number;
  // Количество отображаемых карточек
  displayedCount: number;
  // Фильтры
  filters: AnimalsFilters;
  // Сортировка (desc - от новых к старым, asc - от старых к новым)
  sortDirection: SortDirection;
  // Статусы
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
}

const initialState: FeedState = {
  animals: [],
  bufferedAnimals: [],
  pagination: null,
  currentPage: 1,
  displayedCount: 10,
  filters: {},
  sortDirection: 'desc',
  isLoading: false,
  isLoadingMore: false,
  error: null,
};

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    // Установить животных (первая загрузка)
    setAnimals: (state, action: PayloadAction<{
      animals: AnimalListItem[];
      pagination: PaginationResponse;
    }>) => {
      const { animals, pagination } = action.payload;
      // Первые 10 для отображения, остальные в буфер
      state.animals = animals.slice(0, 10);
      state.bufferedAnimals = animals.slice(10);
      state.pagination = pagination;
      state.displayedCount = 10;
      state.isLoading = false;
      state.error = null;
    },

    // Добавить животных из буфера и загрузить новые в буфер
    showMoreAnimals: (state) => {
      // Перемещаем животных из буфера в основной список
      state.animals = [...state.animals, ...state.bufferedAnimals];
      state.displayedCount = state.animals.length;
      state.bufferedAnimals = [];
    },

    // Добавить животных в буфер
    addToBuffer: (state, action: PayloadAction<{
      animals: AnimalListItem[];
      pagination: PaginationResponse;
    }>) => {
      state.bufferedAnimals = action.payload.animals;
      state.pagination = action.payload.pagination;
      state.isLoadingMore = false;
    },

    // Сбросить ленту (при изменении фильтров/сортировки)
    resetFeed: (state) => {
      state.animals = [];
      state.bufferedAnimals = [];
      state.pagination = null;
      state.currentPage = 1;
      state.displayedCount = 10;
      state.error = null;
    },

    // Установить фильтры
    setFilters: (state, action: PayloadAction<AnimalsFilters>) => {
      state.filters = action.payload;
    },

    // Обновить один фильтр
    updateFilter: (state, action: PayloadAction<Partial<AnimalsFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    // Сбросить фильтры
    clearFilters: (state) => {
      state.filters = {};
    },

    // Установить направление сортировки
    setSortDirection: (state, action: PayloadAction<SortDirection>) => {
      state.sortDirection = action.payload;
    },

    // Переключить сортировку
    toggleSortDirection: (state) => {
      state.sortDirection = state.sortDirection === 'desc' ? 'asc' : 'desc';
    },

    // Увеличить страницу
    incrementPage: (state) => {
      state.currentPage += 1;
    },

    // Установить статус загрузки
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Установить статус загрузки дополнительных
    setLoadingMore: (state, action: PayloadAction<boolean>) => {
      state.isLoadingMore = action.payload;
    },

    // Установить ошибку
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
      state.isLoadingMore = false;
    },
  },
});

export const {
  setAnimals,
  showMoreAnimals,
  addToBuffer,
  resetFeed,
  setFilters,
  updateFilter,
  clearFilters,
  setSortDirection,
  toggleSortDirection,
  incrementPage,
  setLoading,
  setLoadingMore,
  setError,
} = feedSlice.actions;

export default feedSlice.reducer;
