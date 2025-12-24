/**
 * Pets - страница "Мои питомцы"
 *
 * Функционал:
 * - Загрузка карточек питомцев текущего пользователя
 * - Загрузка фотографий через Files API
 * - Кнопка добавления нового питомца
 * - Отображение статуса модерации
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimalCard from '../components/AnimalCard';
import Button from '../components/Button/Button';
import {
  useGetUserAnimalsQuery,
  useLazyGetFilesQuery,
  base64ToDataUrl,
  getMimeType,
} from '../services/animalsApi';
import type { UserAnimalItem } from '../types/animal';
import styles from './Pets.module.css';

// Тип для хранения фотографий по animalId
type PhotosMap = Record<number, string>;

export const Pets: React.FC = () => {
  const navigate = useNavigate();

  // Состояние для фотографий
  const [photosMap, setPhotosMap] = useState<PhotosMap>({});

  // RTK Query
  const { data, isLoading, error } = useGetUserAnimalsQuery();
  const [fetchFiles] = useLazyGetFilesQuery();

  const animals = data?.animalsList || [];

  // Загрузка фотографий после получения списка питомцев
  useEffect(() => {
    if (animals.length === 0) return;

    const animalIds = animals.map((a) => a.id);

    // Создаём карту mainPhotoId для каждого животного
    const mainPhotoIdMap: Record<string, number | null> = {};
    for (const animal of animals) {
      mainPhotoIdMap[animal.id.toString()] = animal.mainPhotoId ?? null;
    }

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
          // Приоритет: 1) mainPhotoId из списка животных, 2) is_main из файла, 3) первое фото
          const expectedMainPhotoId = mainPhotoIdMap[cardId];
          let mainPhoto = expectedMainPhotoId
            ? photos.find((p) => p.file_id === expectedMainPhotoId.toString())
            : null;

          if (!mainPhoto) {
            mainPhoto = photos.find((p) => p.is_main) || photos[0];
          }

          if (mainPhoto) {
            const mimeType = getMimeType(mainPhoto.original_filename);
            newPhotos[parseInt(cardId)] = base64ToDataUrl(mainPhoto.content, mimeType);
          }
        }

        setPhotosMap(newPhotos);
      }
    }).catch((err) => {
      console.error('Failed to load photos:', err);
    });
  }, [animals, fetchFiles]);

  // Преобразование UserAnimalItem в формат для AnimalCard
  const mapAnimalForCard = (animal: UserAnimalItem) => ({
    animalId: animal.id,
    name: animal.name,
    speciesName: animal.speciesName,
    goal: animal.goal,
    hasBreed: !!animal.breed,
    breed: animal.breed || null,
    gender: animal.gender,
    birthday: animal.birthday,
    location: { region: '', city: '' }, // Не используется в карточке "Мои питомцы"
    mainPhotoId: animal.mainPhotoId,
    createdAt: '', // Не используется
    reviewStatus: animal.reviewStatus,
    reviewComment: animal.reviewComment,
  });

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
            Не удалось загрузить питомцев
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
            {animals.map((animal) => (
              <div key={animal.id}>
                <AnimalCard
                  animal={mapAnimalForCard(animal)}
                  photoUrl={photosMap[animal.id] || null}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Pets;
