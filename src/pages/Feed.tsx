/**
 * Feed Page - лента животных
 *
 * Функционал:
 * - Загрузка карточек животных с сервера
 * - Бесконечная прокрутка с предзагрузкой
 * - Сортировка (от новых к старым и наоборот)
 * - Фильтрация (TODO: отдельный Use Case)
 */

import React, { useEffect, useCallback, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FeedAnimalCard from '../components/FeedAnimalCard/FeedAnimalCard';
import {
  useLazyGetAnimalsListQuery,
  useLazyGetFilesQuery,
  base64ToDataUrl,
  getMimeType,
} from '../services/animalsApi';
import {
  setAnimals,
  showMoreAnimals,
  addToBuffer,
  resetFeed,
  setLoading,
  setLoadingMore,
  setError,
  toggleSortDirection,
  incrementPage,
} from '../store/feedSlice';
import {
  selectAnimals,
  selectBufferedAnimals,
  selectIsLoading,
  selectIsLoadingMore,
  selectFeedError,
  selectIsEmpty,
  selectHasMoreAnimals,
  selectHasBufferedAnimals,
  selectSortDirection,
  selectFilters,
  selectCurrentPage,
} from '../store/feedSelectors';
import type { AppDispatch } from '../store';
import styles from './Feed.module.css';

const ITEMS_PER_PAGE = 20; // Загружаем по 20, показываем по 10

// Тип для хранения фотографий по animalId
type PhotosMap = Record<number, string>; // animalId -> dataUrl

export const Feed: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastCardRef = useRef<HTMLDivElement | null>(null);

  // Состояние для фотографий
  const [photosMap, setPhotosMap] = useState<PhotosMap>({});

  // Selectors
  const animals = useSelector(selectAnimals);
  const bufferedAnimals = useSelector(selectBufferedAnimals);
  const isLoading = useSelector(selectIsLoading);
  const isLoadingMore = useSelector(selectIsLoadingMore);
  const error = useSelector(selectFeedError);
  const isEmpty = useSelector(selectIsEmpty);
  const hasMoreAnimals = useSelector(selectHasMoreAnimals);
  const hasBufferedAnimals = useSelector(selectHasBufferedAnimals);
  const sortDirection = useSelector(selectSortDirection);
  const filters = useSelector(selectFilters);
  const currentPage = useSelector(selectCurrentPage);

  // RTK Query
  const [fetchAnimals] = useLazyGetAnimalsListQuery();
  const [fetchFiles] = useLazyGetFilesQuery();

  // Загрузка животных
  const loadAnimals = useCallback(async (page: number, isInitial: boolean = false) => {
    if (isInitial) {
      dispatch(setLoading(true));
    } else {
      dispatch(setLoadingMore(true));
    }

    try {
      const result = await fetchAnimals({
        filters: Object.keys(filters).length > 0 ? filters : undefined,
        pagination: {
          page,
          limit: ITEMS_PER_PAGE,
        },
        // sortDirection,
      }).unwrap();

      if (isInitial) {
        dispatch(setAnimals({
          animals: result.animalsList,
          pagination: result.pagination,
        }));
      } else {
        dispatch(addToBuffer({
          animals: result.animalsList,
          pagination: result.pagination,
        }));
      }

      // Загружаем фото для полученных животных
      const animalIds = result.animalsList.map((a) => a.animalId);
      // Вызываем loadPhotos напрямую, не добавляя в зависимости
      fetchFiles({
        cardIds: animalIds.map((id) => id.toString()),
      }).unwrap().then((filesResponse) => {
        if (filesResponse.descriptors) {
          const newPhotos: PhotosMap = {};
          const photosByCard: Record<string, typeof filesResponse.descriptors> = {};

          for (const desc of filesResponse.descriptors) {
            if (desc.file_type === 'photo') {
              if (!photosByCard[desc.card_id]) {
                photosByCard[desc.card_id] = [];
              }
              photosByCard[desc.card_id].push(desc);
            }
          }

          for (const [cardId, photos] of Object.entries(photosByCard)) {
            const mainPhoto = photos.find((p) => p.is_main) || photos[0];
            if (mainPhoto) {
              const mimeType = getMimeType(mainPhoto.original_filename);
              newPhotos[parseInt(cardId)] = base64ToDataUrl(mainPhoto.content, mimeType);
            }
          }

          setPhotosMap((prev) => ({ ...prev, ...newPhotos }));
        }
      }).catch((err) => {
        console.error('Failed to load photos:', err);
      });
    } catch (err) {
      console.error('Failed to load animals:', err);
      dispatch(setError('Не удалось загрузить животных'));
    }
  }, [dispatch, fetchAnimals, fetchFiles, filters, sortDirection]);

  // Первоначальная загрузка
  useEffect(() => {
    dispatch(resetFeed());
    loadAnimals(1, true);
  }, [dispatch, loadAnimals]);

  // Обработчик достижения последней карточки
  const handleReachEnd = useCallback(() => {
    if (hasBufferedAnimals) {
      // Показываем карточки из буфера
      dispatch(showMoreAnimals());

      // Загружаем следующую порцию в буфер
      if (hasMoreAnimals && !isLoadingMore) {
        dispatch(incrementPage());
        loadAnimals(currentPage + 1, false);
      }
    } else if (hasMoreAnimals && !isLoadingMore) {
      // Буфер пуст, загружаем напрямую
      dispatch(incrementPage());
      loadAnimals(currentPage + 1, false);
    }
  }, [
    dispatch,
    hasBufferedAnimals,
    hasMoreAnimals,
    isLoadingMore,
    currentPage,
    loadAnimals,
  ]);

  // Intersection Observer для бесконечной прокрутки
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && !isLoadingMore) {
          handleReachEnd();
        }
      },
      { threshold: 0.1 }
    );

    if (lastCardRef.current) {
      observerRef.current.observe(lastCardRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleReachEnd, isLoading, isLoadingMore, animals.length]);

  // Переключение сортировки
  const handleSortToggle = () => {
    dispatch(toggleSortDirection());
    dispatch(resetFeed());
    loadAnimals(1, true);
  };

  // Рендер карточки с ref для последней
  const renderCard = (animal: typeof animals[0], index: number) => {
    const isLast = index === animals.length - 1;
    const photoUrl = photosMap[animal.animalId] || null;

    return (
      <div
        key={animal.animalId}
        ref={isLast ? lastCardRef : null}
      >
        <FeedAnimalCard animal={animal} photoUrl={photoUrl} />
      </div>
    );
  };

  return (
    <div className={styles.feed}>
      <div className={styles.feed__container}>
        {/* Заголовок и сортировка */}
        <div className={styles.feed__header}>
          <h1 className={styles.feed__title}>Лента</h1>
          {/* <button
            className={styles.feed__sortButton}
            onClick={handleSortToggle}
            disabled={isLoading}
          >
            {sortDirection === 'desc' ? 'Сначала новые ↓' : 'Сначала старые ↑'}
          </button> */}
        </div>

        {/* Ошибка */}
        {error && (
          <div className={styles.feed__error}>
            {error}
          </div>
        )}

        {/* Загрузка */}
        {isLoading && (
          <div className={styles.feed__loading}>
            <div className={styles.feed__spinner}></div>
            <span>Загрузка...</span>
          </div>
        )}

        {/* Пустое состояние */}
        {isEmpty && !error && (
          <div className={styles.feed__empty}>
            Пока что тут ничего нет
          </div>
        )}

        {/* Карточки животных */}
        {!isLoading && animals.length > 0 && (
          <div className={styles.feed__cards}>
            {animals.map((animal, index) => renderCard(animal, index))}
          </div>
        )}

        {/* Загрузка дополнительных */}
        {isLoadingMore && (
          <div className={styles.feed__loadingMore}>
            <div className={styles.feed__spinner}></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
