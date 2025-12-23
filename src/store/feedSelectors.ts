/**
 * Feed Selectors - селекторы для получения данных ленты из store
 */

import type { RootState } from './index';

// Основные селекторы
export const selectFeed = (state: RootState) => state.feed;
export const selectAnimals = (state: RootState) => state.feed.animals;
export const selectBufferedAnimals = (state: RootState) => state.feed.bufferedAnimals;
export const selectPagination = (state: RootState) => state.feed.pagination;
export const selectCurrentPage = (state: RootState) => state.feed.currentPage;
export const selectDisplayedCount = (state: RootState) => state.feed.displayedCount;

// Фильтры и сортировка
export const selectFilters = (state: RootState) => state.feed.filters;
export const selectSortDirection = (state: RootState) => state.feed.sortDirection;

// Статусы
export const selectIsLoading = (state: RootState) => state.feed.isLoading;
export const selectIsLoadingMore = (state: RootState) => state.feed.isLoadingMore;
export const selectFeedError = (state: RootState) => state.feed.error;

// Комбинированные селекторы
export const selectHasMoreAnimals = (state: RootState) => {
  const pagination = state.feed.pagination;
  return pagination ? pagination.hasNextPage : false;
};

export const selectHasBufferedAnimals = (state: RootState) => {
  return state.feed.bufferedAnimals.length > 0;
};

export const selectTotalAnimals = (state: RootState) => {
  return state.feed.pagination?.totalItems ?? 0;
};

export const selectIsEmpty = (state: RootState) => {
  return !state.feed.isLoading && state.feed.animals.length === 0;
};
