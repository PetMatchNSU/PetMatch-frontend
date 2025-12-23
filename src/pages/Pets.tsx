/**
 * Pets - страница "Мои питомцы"
 *
 * Функционал:
 * - Загрузка карточек питомцев текущего пользователя
 * - Бесконечная прокрутка с пагинацией
 * - Загрузка фотографий через Files API
 * - Кнопка добавления нового питомца
 */

import React, { useEffect, useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimalCard from '../components/AnimalCard';
import Button from '../components/Button/Button';
import {
  useLazyGetAnimalsListQuery,
  useLazyGetFilesQuery,
  base64ToDataUrl,
  getMimeType,
} from '../services/animalsApi';
import { tokenManager } from '../utils/tokenManager';
import type { AnimalListItem, PaginationResponse } from '../types/animal';
import styles from './Pets.module.css';

const ITEMS_PER_PAGE = 20;

// Тип для хранения фотографий по animalId
type PhotosMap = Record<number, string>;

export const Pets: React.FC = () => {
  const navigate = useNavigate();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastCardRef = useRef<HTMLDivElement | null>(null);

  // Состояние
  const [animals, setAnimals] = useState<AnimalListItem[]>([]);
  const [pagination, setPagination] = useState<PaginationResponse | null>(null);
  const [photosMap, setPhotosMap] = useState<PhotosMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // RTK Query
  const [fetchAnimals] = useLazyGetAnimalsListQuery();
  const [fetchFiles] = useLazyGetFilesQuery();

  // Загрузка животных
  const loadAnimals = useCallback(async (page: number, isInitial: boolean = false) => {
    const userId = tokenManager.getUserId();
    console.log(userId);
    if (!userId) {
      setError('Не удалось получить данные пользователя');
      setIsLoading(false);
      return;
    }

    if (isInitial) {
      setIsLoading(true);
      setError(null);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const result = await fetchAnimals({
        filters: { userId },
        pagination: {
          page,
          limit: ITEMS_PER_PAGE,
        },
      }).unwrap();

      if (isInitial) {
        setAnimals(result.animalsList);
      } else {
        setAnimals((prev) => [...prev, ...result.animalsList]);
      }
      setPagination(result.pagination);

      // Загружаем фото для полученных животных
      const animalIds = result.animalsList.map((a) => a.animalId);
      if (animalIds.length > 0) {
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
      }
    } catch (err) {
      console.error('Failed to load animals:', err);
      setError('Не удалось загрузить питомцев');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [fetchAnimals, fetchFiles]);

  // Первоначальная загрузка
  useEffect(() => {
    loadAnimals(1, true);
  }, [loadAnimals]);

  // Обработчик достижения последней карточки
  const handleReachEnd = useCallback(() => {
    if (pagination?.hasNextPage && !isLoadingMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadAnimals(nextPage, false);
    }
  }, [pagination, isLoadingMore, currentPage, loadAnimals]);

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

  // Рендер карточки с ref для последней
  const renderCard = (animal: AnimalListItem, index: number) => {
    const isLast = index === animals.length - 1;
    const photoUrl = photosMap[animal.animalId] || null;

    return (
      <div
        key={animal.animalId}
        ref={isLast ? lastCardRef : null}
      >
        <AnimalCard animal={animal} photoUrl={photoUrl} />
      </div>
    );
  };

  const isEmpty = !isLoading && animals.length === 0;

  return (
    <div className={styles.pets}>
      <div className={styles.pets__container}>
        <div className={styles.pets__header}>
          <div className={styles.pets__headerContent}>
            <div className={styles.pets__actions}>
              <Button onClick={() => navigate('/animal/create')}>
                Добавить питомца
              </Button>
            </div>
          </div>
        </div>

        {/* Ошибка */}
        {error && (
          <div className={styles.pets__error}>
            {error}
          </div>
        )}

        {/* Загрузка */}
        {isLoading && (
          <div className={styles.pets__loading}>
            <div className={styles.pets__spinner}></div>
            <span>Загрузка...</span>
          </div>
        )}

        {/* Пустое состояние */}
        {isEmpty && !error && (
          <div className={styles.pets__empty}>
            У вас пока нет питомцев
          </div>
        )}

        {/* Карточки животных */}
        {!isLoading && animals.length > 0 && (
          <div className={styles.pets__cards}>
            {animals.map((animal, index) => renderCard(animal, index))}
          </div>
        )}

        {/* Загрузка дополнительных */}
        {isLoadingMore && (
          <div className={styles.pets__loadingMore}>
            <div className={styles.pets__spinner}></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pets;
