/**
 * FeedAnimalCard - карточка животного в ленте
 *
 * Отображает:
 * - Основная фотография
 * - Кличка
 * - Вид животного
 * - Порода (если есть)
 * - Дата рождения (ДД.ММ.ГГГГ)
 * - Пол
 * - Город проживания
 * - Дата создания объявления
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPhotoUrl } from '../../services/animalsApi';
import type { AnimalListItem } from '../../types/animal';
import styles from './FeedAnimalCard.module.css';

interface FeedAnimalCardProps {
  animal: AnimalListItem;
}

export const FeedAnimalCard: React.FC<FeedAnimalCardProps> = ({ animal }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  // Форматирование даты в ДД.ММ.ГГГГ
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
  };

  // Получение текста цели
  const getGoalText = () => {
    switch (animal.goal) {
      case 'SELL':
        return 'Продажа';
      case 'FREE':
        return 'Бесплатно';
      case 'BUY':
      case 'PAIRING':
        return 'Вязка';
      default:
        return '';
    }
  };

  // URL фотографии
  const photoUrl = getPhotoUrl(animal.mainPhotoId, 400, 400);

  // Обработчик клика на карточку
  const handleClick = () => {
    navigate(`/animal/${animal.animalId}`);
  };

  // Обработчик ошибки загрузки изображения
  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className={styles.card} onClick={handleClick}>
      {/* Фотография */}
      <div className={styles.card__photo}>
        {photoUrl && !imageError ? (
          <img
            src={photoUrl}
            alt={animal.name}
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className={styles.card__photoPlaceholder}>
            <span>🐾</span>
          </div>
        )}
        {/* Бейдж цели */}
        {getGoalText() && (
          <div className={styles.card__goalBadge}>
            {getGoalText()}
          </div>
        )}
      </div>

      {/* Заголовок с полом */}
      <div className={styles.card__header}>
        <div className={styles.card__name}>{animal.name}</div>
        <div className={`${styles.card__gender} ${animal.gender === 'M' ? styles['card__gender--male'] : styles['card__gender--female']}`}>
          {animal.gender === 'M' ? '♂' : '♀'}
        </div>
      </div>

      {/* Информация */}
      <div className={styles.card__info}>
        <div className={styles.card__species}>{animal.speciesName}</div>
        <div className={styles.card__breed}>
          {animal.breed || 'Без породы'}
        </div>
        <div className={styles.card__birthday}>
          {formatDate(animal.birthday)}
        </div>
      </div>

      {/* Футер */}
      <div className={styles.card__footer}>
        <div className={styles.card__city}>
          {animal.location.city}
        </div>
        <div className={styles.card__date}>
          {formatDate(animal.createdAt)}
        </div>
      </div>
    </div>
  );
};

export default FeedAnimalCard;
