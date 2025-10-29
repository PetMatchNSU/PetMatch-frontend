import React from 'react';
import { useNavigate } from 'react-router-dom';
import AnimalCard from '../components/AnimalCard';
import Button from '../components/Button/Button';
import styles from './Pets.module.css';

// Mock data based on API response
const mockAnimals = [
  {
    animalId: 1111,
    name: "Кличка",
    speciesName: "Кошка",
    goal: "BUY",
    hasBreed: true,
    breed: "Абиссинская",
    gender: "M",
    birthday: "2023-11-15",
    location: {
      region: "Московская область",
      city: "Москва"
    },
    mainPhotoId: 1324325,
    createdAt: "2023-11-15T12:00:00Z",
    reviewStatus: "PUBLISHED" // Adding this field for display purposes
  },
  {
    animalId: 1112,
    name: "Дружок",
    speciesName: "Собака",
    goal: "FREE",
    hasBreed: false,
    breed: null,
    gender: "F",
    birthday: "2023-11-10",
    location: {
      region: "Московская область",
      city: "Москва"
    },
    mainPhotoId: 1324326,
    createdAt: "2023-11-10T14:20:00Z",
    reviewStatus: "PUBLISHED"
  },
  {
    animalId: 1113,
    name: "Барсик",
    speciesName: "Кошка",
    goal: "SELL",
    hasBreed: true,
    breed: "Сиамская",
    gender: "M",
    birthday: "2023-10-20",
    location: {
      region: "Ленинградская область",
      city: "Санкт-Петербург"
    },
    mainPhotoId: 1324327,
    createdAt: "2023-10-20T10:15:00Z",
    reviewStatus: "PUBLISHED"
  },
  {
    animalId: 1114,
    name: "Рекс",
    speciesName: "Собака",
    goal: "BUY",
    hasBreed: true,
    breed: "Немецкая овчарка",
    gender: "M",
    birthday: "2023-09-05",
    location: {
      region: "Московская область",
      city: "Москва"
    },
    mainPhotoId: 1324328,
    createdAt: "2023-09-05T16:30:00Z",
    reviewStatus: "PUBLISHED"
  },
  {
    animalId: 1115,
    name: "Мурка",
    speciesName: "Кошка",
    goal: "FREE",
    hasBreed: false,
    breed: null,
    gender: "F",
    birthday: "2023-12-01",
    location: {
      region: "Новосибирская область",
      city: "Новосибирск"
    },
    mainPhotoId: 1324329,
    createdAt: "2023-12-01T09:45:00Z",
    reviewStatus: "PUBLISHED"
  }
];

export const Pets: React.FC = () => {
  const navigate = useNavigate();
  
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
        <div className={styles.pets__cards}>
          {mockAnimals.map(animal => (
            <AnimalCard key={animal.animalId} animal={animal} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pets;