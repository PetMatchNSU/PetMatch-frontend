/**
 * AnimalView - страница просмотра карточки животного
 *
 * Функционал:
 * - Отображение полной информации о животном
 * - Галерея фотографий
 * - Скачивание документов
 * - Кнопка "Редактировать" для владельца
 * - Кнопка "Связаться" для других пользователей
 * - Отображение статуса карточки для владельца
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  useGetAnimalDetailQuery,
  useLazyGetFilesQuery,
  base64ToDataUrl,
  getMimeType,
} from '../services/animalsApi';
import { selectIsAuthenticated } from '../store/authSelectors';
import Button from '../components/Button/Button';
import styles from './AnimalView.module.css';

// Маппинг целей на русский
const goalLabels: Record<string, string> = {
  SELL: 'Продажа',
  PAIRING: 'Вязка',
  FREE: 'Отдам бесплатно',
  BUY: 'Покупка',
};

// Маппинг статусов на русский
const statusLabels: Record<string, string> = {
  ON_CHECKING: 'На проверке',
  PUBLISHED: 'Опубликовано',
  BLOCKED: 'Заблокировано',
};

// Маппинг статусов на стили
const statusStyles: Record<string, string> = {
  ON_CHECKING: styles.statusChecking,
  PUBLISHED: styles.statusPublished,
  BLOCKED: styles.statusBlocked,
};

// Интерфейс для фото
interface PhotoItem {
  id: string;
  url: string;
  isMain: boolean;
}

// Интерфейс для документа
interface DocumentItem {
  id: string;
  url: string;
  filename: string;
}

export const AnimalView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [documents, setDocuments] = useState<Record<string, DocumentItem | null>>({
    vetPassport: null,
    pedigree: null,
    vetCertificate: null,
    diplomas: null,
    other: null,
  });
  const [filesLoading, setFilesLoading] = useState(true);

  const animalId = id ? parseInt(id, 10) : 0;

  const { data: animal, isLoading, error } = useGetAnimalDetailQuery(animalId, {
    skip: !animalId,
  });

  const [getFiles] = useLazyGetFilesQuery();

  // Загрузка файлов через API
  useEffect(() => {
    if (!animal || !animalId) {
      setFilesLoading(false);
      return;
    }

    const loadFiles = async () => {
      try {
        const filesResponse = await getFiles({
          cardIds: [animalId.toString()],
        }).unwrap();

        if (filesResponse.descriptors) {
          // Обрабатываем фото
          const photoDescriptors = filesResponse.descriptors.filter((f) => f.file_type === 'photo');

          // Определяем главное фото по mainPhotoId из animal
          const mainPhotoId = animal.photos.mainPhotoId?.toString();

          const loadedPhotos: PhotoItem[] = photoDescriptors.map((photo) => {
            const mimeType = getMimeType(photo.original_filename);
            return {
              id: photo.file_id,
              url: base64ToDataUrl(photo.content, mimeType),
              isMain: photo.file_id === mainPhotoId,
            };
          });

          // Сортируем так, чтобы главное фото было первым
          loadedPhotos.sort((a, b) => (b.isMain ? 1 : 0) - (a.isMain ? 1 : 0));
          setPhotos(loadedPhotos);

          // Обрабатываем документы
          const docDescriptors = filesResponse.descriptors.filter((f) => f.file_type === 'doc');
          const docMap: Record<string, DocumentItem | null> = {
            vetPassport: null,
            pedigree: null,
            vetCertificate: null,
            diplomas: null,
            other: null,
          };

          const animalDocs = animal.documents;
          docDescriptors.forEach((doc) => {
            const mimeType = getMimeType(doc.original_filename);
            const docItem: DocumentItem = {
              id: doc.file_id,
              url: base64ToDataUrl(doc.content, mimeType),
              filename: doc.original_filename,
            };

            if (animalDocs.vetPassportId?.toString() === doc.file_id) {
              docMap.vetPassport = docItem;
            } else if (animalDocs.pedigreeId?.toString() === doc.file_id) {
              docMap.pedigree = docItem;
            } else if (animalDocs.vetCertificatesId?.toString() === doc.file_id) {
              docMap.vetCertificate = docItem;
            } else if (animalDocs.diplomasId?.toString() === doc.file_id) {
              docMap.diplomas = docItem;
            } else if (animalDocs.otherDocumentsId?.toString() === doc.file_id) {
              docMap.other = docItem;
            }
          });

          setDocuments(docMap);
        }
      } catch (err) {
        console.error('Failed to load files:', err);
      } finally {
        setFilesLoading(false);
      }
    };

    loadFiles();
  }, [animal, animalId, getFiles]);

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Форматирование даты и времени
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Обработчик клика на "Редактировать"
  const handleEdit = () => {
    navigate(`/animal/update/${animalId}`);
  };

  // Обработчик клика на "Связаться"
  const handleContact = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // TODO: Переход на экран связи с пользователем
    console.log('Contact owner for animal:', animalId);
  };

  // Открытие галереи
  const openGallery = (index: number) => {
    setSelectedPhotoIndex(index);
  };

  // Закрытие галереи
  const closeGallery = () => {
    setSelectedPhotoIndex(null);
  };

  // Навигация по галерее
  const navigateGallery = (direction: 'prev' | 'next') => {
    if (selectedPhotoIndex === null) return;

    if (direction === 'prev') {
      setSelectedPhotoIndex(selectedPhotoIndex > 0 ? selectedPhotoIndex - 1 : photos.length - 1);
    } else {
      setSelectedPhotoIndex(selectedPhotoIndex < photos.length - 1 ? selectedPhotoIndex + 1 : 0);
    }
  };

  // Скачивание документа
  const downloadDocument = (doc: DocumentItem | null) => {
    if (!doc) return;
    const link = document.createElement('a');
    link.href = doc.url;
    link.download = doc.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading || filesLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <span>Загрузка...</span>
        </div>
      </div>
    );
  }

  if (error || !animal) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          Не удалось загрузить информацию о животном
        </div>
        <Button onClick={() => navigate(-1)}>Назад</Button>
      </div>
    );
  }

  const mainPhotoUrl = photos.length > 0 ? photos[0].url : null;

  return (
    <div className={styles.container}>
      {/* Заголовок */}
      <div className={styles.header}>
        <h1 className={styles.title}>{animal.name}</h1>
        {animal.canEdit && (
          <div className={`${styles.status} ${statusStyles[animal.reviewStatus]}`}>
            {statusLabels[animal.reviewStatus]}
          </div>
        )}
      </div>

      <div className={styles.content}>
        {/* Левая колонка - фото */}
        <div className={styles.photoSection}>
          {/* Основное фото */}
          <div className={styles.mainPhoto} onClick={() => photos.length > 0 && openGallery(0)}>
            {mainPhotoUrl ? (
              <img src={mainPhotoUrl} alt={animal.name} />
            ) : (
              <div className={styles.photoPlaceholder}>
                <span>Нет фото</span>
              </div>
            )}
          </div>

          {/* Дополнительные фото */}
          {photos.length > 1 && (
            <div className={styles.additionalPhotos}>
              {photos.slice(1).map((photo, index) => (
                <div
                  key={photo.id}
                  className={styles.additionalPhoto}
                  onClick={() => openGallery(index + 1)}
                >
                  <img src={photo.url} alt={`${animal.name} - фото ${index + 2}`} />
                </div>
              ))}
            </div>
          )}

          {/* Кнопки действий */}
          <div className={styles.actions}>
            {animal.canEdit ? (
              <Button onClick={handleEdit} className={styles.editButton}>
                Редактировать
              </Button>
            ) : (
              <Button onClick={handleContact} className={styles.contactButton}>
                Связаться
              </Button>
            )}
          </div>
        </div>

        {/* Правая колонка - информация */}
        <div className={styles.infoSection}>
          {/* Основная информация */}
          <div className={styles.infoBlock}>
            <h2>Основная информация</h2>

            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Вид животного:</span>
              <span className={styles.infoValue}>{animal.species.name}</span>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Порода:</span>
              <span className={styles.infoValue}>
                {animal.hasBreed ? animal.breed : 'Без породы'}
              </span>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Пол:</span>
              <span className={styles.infoValue}>
                {animal.gender === 'M' ? 'Мужской' : 'Женский'}
              </span>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Дата рождения:</span>
              <span className={styles.infoValue}>{formatDate(animal.birthday)}</span>
            </div>

            {animal.weight && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Вес:</span>
                <span className={styles.infoValue}>{animal.weight} кг</span>
              </div>
            )}

            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Окрас:</span>
              <span className={styles.infoValue}>{animal.color}</span>
            </div>
          </div>

          {/* Здоровье */}
          <div className={styles.infoBlock}>
            <h2>Здоровье</h2>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Наследственные заболевания:</span>
              <span className={styles.infoValue}>{animal.geneticDiseases}</span>
            </div>
          </div>

          {/* Описание */}
          {animal.description && (
            <div className={styles.infoBlock}>
              <h2>Описание</h2>
              <p className={styles.description}>{animal.description}</p>
            </div>
          )}

          {/* Цель размещения */}
          <div className={styles.infoBlock}>
            <h2>Информация об объявлении</h2>

            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Цель:</span>
              <span className={styles.infoValue}>{goalLabels[animal.goal] || animal.goal}</span>
            </div>

            {animal.goal === 'SELL' && animal.cost && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Цена:</span>
                <span className={styles.infoValue}>{animal.cost.toLocaleString('ru-RU')} руб.</span>
              </div>
            )}

            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Дата публикации:</span>
              <span className={styles.infoValue}>{formatDateTime(animal.createdAt)}</span>
            </div>

            {animal.updatedAt !== animal.createdAt && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Дата обновления:</span>
                <span className={styles.infoValue}>{formatDateTime(animal.updatedAt)}</span>
              </div>
            )}
          </div>

          {/* Документы */}
          <div className={styles.infoBlock}>
            <h2>Документы</h2>
            <div className={styles.documents}>
              {documents.vetPassport && (
                <div
                  className={styles.documentItem}
                  onClick={() => downloadDocument(documents.vetPassport)}
                >
                  <span className={styles.documentIcon}>📄</span>
                  <span>Ветеринарный паспорт</span>
                </div>
              )}

              {documents.pedigree && (
                <div
                  className={styles.documentItem}
                  onClick={() => downloadDocument(documents.pedigree)}
                >
                  <span className={styles.documentIcon}>📄</span>
                  <span>Родословная (метрика)</span>
                </div>
              )}

              {documents.vetCertificate && (
                <div
                  className={styles.documentItem}
                  onClick={() => downloadDocument(documents.vetCertificate)}
                >
                  <span className={styles.documentIcon}>📄</span>
                  <span>Ветеринарная справка</span>
                </div>
              )}

              {documents.diplomas && (
                <div
                  className={styles.documentItem}
                  onClick={() => downloadDocument(documents.diplomas)}
                >
                  <span className={styles.documentIcon}>📄</span>
                  <span>Дипломы</span>
                </div>
              )}

              {documents.other && (
                <div
                  className={styles.documentItem}
                  onClick={() => downloadDocument(documents.other)}
                >
                  <span className={styles.documentIcon}>📄</span>
                  <span>Другие документы</span>
                </div>
              )}

              {!documents.vetPassport &&
                !documents.pedigree &&
                !documents.vetCertificate &&
                !documents.diplomas &&
                !documents.other && (
                  <p className={styles.noDocuments}>Документы не загружены</p>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* Галерея */}
      {selectedPhotoIndex !== null && (
        <div className={styles.gallery} onClick={closeGallery}>
          <div className={styles.galleryContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.galleryClose} onClick={closeGallery}>
              &times;
            </button>

            {photos.length > 1 && (
              <button
                className={`${styles.galleryNav} ${styles.galleryPrev}`}
                onClick={() => navigateGallery('prev')}
              >
                &#8249;
              </button>
            )}

            <img
              src={photos[selectedPhotoIndex].url}
              alt={`${animal.name} - фото ${selectedPhotoIndex + 1}`}
              className={styles.galleryImage}
            />

            {photos.length > 1 && (
              <button
                className={`${styles.galleryNav} ${styles.galleryNext}`}
                onClick={() => navigateGallery('next')}
              >
                &#8250;
              </button>
            )}

            <div className={styles.galleryCounter}>
              {selectedPhotoIndex + 1} / {photos.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimalView;
