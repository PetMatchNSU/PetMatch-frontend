import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeleteAnimalMutation, useDeleteFilesMutation } from '../../services/animalsApi';
import styles from './AnimalCard.module.css';

import type { AnimalListItem } from '../../types/animal';

interface AnimalCardProps {
  animal: AnimalListItem & {
    reviewStatus?: string;
    reviewComment?: string;
  };
  photoUrl: string | null;
  onDeleted?: () => void;
}

export const AnimalCard: React.FC<AnimalCardProps> = ({ animal, photoUrl, onDeleted }) => {
  const [showActions, setShowActions] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [deleteAnimal, { isLoading: isDeletingAnimal }] = useDeleteAnimalMutation();
  const [deleteFiles, { isLoading: isDeletingFiles }] = useDeleteFilesMutation();
  const isDeleting = isDeletingAnimal || isDeletingFiles;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) {
        setShowActions(false);
      }
    };

    if (showActions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActions]);

  // Function to get status text based on reviewStatus
  const getStatusText = () => {
    switch (animal.reviewStatus) {
      case 'OK':
      case 'PUBLISHED':
        return 'Опубликовано';
      case 'BLOCKED':
        return 'Заблокировано';
      case 'ON_CHECKING':
      case 'ON_MODERATION':
        return 'На проверке';
      default:
        return 'Неизвестно';
    }
  };

  // Получить CSS класс для статуса
  const getStatusClass = () => {
    switch (animal.reviewStatus) {
      case 'OK':
      case 'PUBLISHED':
        return styles.card__status_published;
      case 'BLOCKED':
        return styles.card__status_blocked;
      case 'ON_CHECKING':
      case 'ON_MODERATION':
        return styles.card__status_checking;
      default:
        return '';
    }
  };

  // Function to get goal text
  const getGoalText = () => {
    switch (animal.goal) {
      case 'SELL':
        return 'Продажа';
      case 'FREE':
        return 'Отдам даром';
      case 'PAIRING':
        return 'Вязка';
      default:
        return '';
    }
  };

  // Обработчик клика на карточку
  const handleCardClick = () => {
    navigate(`/animal/${animal.animalId}`);
  };

  // Обработчик удаления
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // Сначала удаляем все файлы связанные с карточкой
      await deleteFiles({ cardIds: [animal.animalId.toString()] }).unwrap();
      // Затем удаляем саму карточку
      await deleteAnimal(animal.animalId).unwrap();
      setShowActions(false);
      onDeleted?.();
    } catch (error) {
      console.error('Ошибка при удалении:', error);
    }
  };

  return (
    <div className={styles.card} onClick={handleCardClick}>
      {/* Фотография */}
      <div className={styles.card__photo}>
        {photoUrl ? (
          <img src={photoUrl} alt={animal.name} />
        ) : (
          <div className={styles.card__photoPlaceholder}>
            <span>🐾</span>
          </div>
        )}
      </div>

      {/* Status and gender in one row */}
      <div className={styles.card__header}>
        <div className={`${styles.card__status} ${getStatusClass()}`}>
          {getStatusText()}
        </div>
        <div className={styles.card__gender}>
          {animal.gender === 'M' ? '♂' : '♀'}
        </div>
      </div>

      {/* Комментарий модератора (если заблокировано) */}
      {animal.reviewStatus === 'BLOCKED' && animal.reviewComment && (
        <div className={styles.card__reviewComment}>
          {animal.reviewComment}
        </div>
      )}

      {/* Name */}
      <div className={styles.card__name}>
        {animal.name}
      </div>

      {/* Species */}
      <div className={styles.card__species}>
        {animal.speciesName}
      </div>

      {/* Breed */}
      <div className={styles.card__breed}>
        {animal.breed || 'Без породы'}
      </div>

      {/* Birthday */}
      <div className={styles.card__birthday}>
        {animal.birthday}
      </div>

      {/* Divider line */}
      <hr className={styles.card__divider} />

      {/* Goal and actions in one row */}
      <div className={styles.card__footer}>
        <div className={styles.card__goal}>
          {getGoalText()}
        </div>
        <div className={styles.card__actions} ref={actionsRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(!showActions);
            }}
            className={styles['card__actions-button']}
          >
            ...
          </button>

          {/* Actions dropdown */}
          {showActions && (
            <div className={styles['card__actions-dropdown']}>
              <button
                className={styles['card__edit-button']}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/animal/update/${animal.animalId}`);
                }}
              >
                редактировать
              </button>
              <button
                className={styles['card__delete-button']}
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'удаление...' : 'удалить'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnimalCard;