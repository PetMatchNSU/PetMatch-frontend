import React from 'react';
import styles from './FeedAnimalCard.module.css';

interface Animal {
  animalId: number;
  name: string;
  speciesName: string;
  goal: string;
  hasBreed: boolean;
  breed: string | null;
  gender: string;
  birthday: string;
  location: {
    region: string;
    city: string;
  };
  mainPhotoId: number;
  createdAt: string;
}

interface FeedAnimalCardProps {
  animal: Animal;
}

export const FeedAnimalCard: React.FC<FeedAnimalCardProps> = ({ animal }) => {
  // Function to format the date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
  };

  // Function to get goal text
  const getGoalText = () => {
    switch (animal.goal) {
      case 'SELL':
        return 'Продажа';
      case 'FREE':
        return '';
      case 'BUY':
        return 'Случка';
      default:
        return '';
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.card__photo}>
        <span>Фото ID: {animal.mainPhotoId}</span>
      </div>

      <div className={styles.card__header}>
        <div className={styles.card__gender}>
          {animal.gender === 'M' ? '♂' : '♀'}
        </div>
      </div>

      <div className={styles.card__name}>
        {animal.name}
      </div>

      <div className={styles.card__species}>
        {animal.speciesName}
      </div>

      <div className={styles.card__breed}>
        {animal.breed || 'Без породы'}
      </div>

      <div className={styles.card__birthday}>
        {animal.birthday}
      </div>

      <hr className={styles.card__divider} />

      <div className={styles.card__footer}>
        <div className={styles.card__city_footer}>
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