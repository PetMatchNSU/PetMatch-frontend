import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AnimalCard.module.css';

import type { AnimalListItem } from '../../types/animal';

interface AnimalCardProps {
  animal: AnimalListItem & { reviewStatus?: string };
  photoUrl: string | null;
}

export const AnimalCard: React.FC<AnimalCardProps> = ({ animal, photoUrl }) => {
  const [showActions, setShowActions] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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
      case 'PUBLISHED':
        return 'Опубликовано';
      case 'BLOCKED':
        return 'Заблокировано';
      case 'ON_MODERATION':
        return 'На модерации';
      default:
        return 'Неизвестно';
    }
  };

  // Function to get goal text
  const getGoalText = () => {
    switch (animal.goal) {
      case 'SELL':
        return 'Продажа';
      case 'FREE':
        return 'Отдам даром';
      case 'BUY':
        return 'Случка';
      default:
        return '';
    }
  };

  // Обработчик клика на карточку
  const handleCardClick = () => {
    navigate(`/animal/${animal.animalId}`);
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
        <div className={`${styles.card__status} ${animal.reviewStatus === 'PUBLISHED' ? styles.card__status_published : ''}`}>
          {getStatusText()}
        </div>
        <div className={styles.card__gender}>
          {animal.gender === 'M' ? '♂' : '♀'}
        </div>
      </div>

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
                onClick={() => navigate(`/animal/update/${animal.animalId}`)}
              >
                редактировать
              </button>
              <button className={styles['card__delete-button']}>
                удалить
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnimalCard;