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
  useLazyGetAnimalOwnerContactsQuery,
  base64ToDataUrl,
  getMimeType,
} from '../services/animalsApi';
import { selectIsAuthenticated } from '../store/authSelectors';
import type { AnimalOwnerContactsResponse } from '../types/animal';
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
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [filesLoading, setFilesLoading] = useState(true);

  // Состояние для контактов владельца
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [ownerContacts, setOwnerContacts] = useState<AnimalOwnerContactsResponse | null>(null);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactsError, setContactsError] = useState<string | null>(null);

  const animalId = id ? parseInt(id, 10) : 0;

  const { data: animal, isLoading, error } = useGetAnimalDetailQuery(animalId, {
    skip: !animalId,
  });

  const [getFiles] = useLazyGetFilesQuery();
  const [getOwnerContacts] = useLazyGetAnimalOwnerContactsQuery();

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

          // Обрабатываем документы (просто список без типов)
          const docDescriptors = filesResponse.descriptors.filter((f) => f.file_type === 'doc');
          const loadedDocs: DocumentItem[] = docDescriptors.map((doc) => {
            const mimeType = getMimeType(doc.original_filename);
            return {
              id: doc.file_id,
              url: base64ToDataUrl(doc.content, mimeType),
              filename: doc.original_filename,
            };
          });

          setDocuments(loadedDocs);
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

  // Обработчик клика на "Показать контактную информацию"
  const handleShowContacts = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Если контакты уже загружены - просто показываем модалку
    if (ownerContacts) {
      setShowContactsModal(true);
      return;
    }

    setContactsLoading(true);
    setContactsError(null);

    try {
      const contacts = await getOwnerContacts(animalId).unwrap();
      setOwnerContacts(contacts);
      setShowContactsModal(true);
    } catch (err: any) {
      if (err?.status === 401) {
        setContactsError('Необходима авторизация');
        navigate('/login');
      } else if (err?.status === 404) {
        setContactsError('Владелец не найден');
      } else {
        setContactsError('Не удалось загрузить контакты');
      }
    } finally {
      setContactsLoading(false);
    }
  };

  // Закрытие модалки контактов
  const closeContactsModal = () => {
    setShowContactsModal(false);
  };

  // Форматирование ФИО
  const formatFullName = (firstName: string, secondName: string, middleName?: string) => {
    return [secondName, firstName, middleName].filter(Boolean).join(' ');
  };

  // Маппинг типа контакта на русский
  const contactTypeLabels: Record<string, string> = {
    PHONE: 'Телефон',
    EMAIL: 'Email',
    TELEGRAM: 'Telegram',
    VK: 'ВКонтакте',
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
              <>
                <Button
                  onClick={handleShowContacts}
                  className={styles.contactButton}
                  disabled={contactsLoading}
                >
                  {contactsLoading ? 'Загрузка...' : 'Показать контактную информацию'}
                </Button>
                {contactsError && (
                  <div className={styles.contactsError}>{contactsError}</div>
                )}
              </>
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
              {documents.length > 0 ? (
                documents.map((doc) => (
                  <div
                    key={doc.id}
                    className={styles.documentItem}
                    onClick={() => downloadDocument(doc)}
                  >
                    <span className={styles.documentIcon}>📄</span>
                    <span>{doc.filename}</span>
                  </div>
                ))
              ) : (
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

      {/* Модальное окно с контактами владельца */}
      {showContactsModal && ownerContacts && (
        <div className={styles.contactsModal} onClick={closeContactsModal}>
          <div className={styles.contactsModalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.contactsModalClose} onClick={closeContactsModal}>
              &times;
            </button>

            <h2 className={styles.contactsModalTitle}>Контактная информация</h2>

            {/* ФИО */}
            <div className={styles.contactsSection}>
              <div className={styles.contactsLabel}>ФИО владельца:</div>
              <div className={styles.contactsValue}>
                {formatFullName(ownerContacts.firstName, ownerContacts.secondName, ownerContacts.middleName)}
              </div>
            </div>

            {/* Время для связи */}
            {ownerContacts.bondTime.length > 0 && (
              <div className={styles.contactsSection}>
                <div className={styles.contactsLabel}>Время для связи (МСК):</div>
                <div className={styles.contactsValue}>
                  {ownerContacts.bondTime.map((time, index) => (
                    <div key={index} className={styles.bondTimeItem}>
                      {time.bondTimeStart} - {time.bondTimeEnd}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Контакты */}
            {ownerContacts.contactInfo.length > 0 && (
              <div className={styles.contactsSection}>
                <div className={styles.contactsLabel}>Контакты для связи:</div>
                <div className={styles.contactsList}>
                  {ownerContacts.contactInfo.map((contact, index) => (
                    <div key={index} className={styles.contactItem}>
                      <span className={styles.contactType}>
                        {contactTypeLabels[contact.type] || contact.type}:
                      </span>
                      <span className={styles.contactValue}>
                        {contact.type === 'PHONE' ? (
                          <a href={`tel:${contact.contact}`}>{contact.contact}</a>
                        ) : contact.type === 'EMAIL' ? (
                          <a href={`mailto:${contact.contact}`}>{contact.contact}</a>
                        ) : contact.type === 'TELEGRAM' || contact.type === 'VK' ? (
                          <a href={contact.contact} target="_blank" rel="noopener noreferrer">
                            {contact.contact}
                          </a>
                        ) : (
                          contact.contact
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimalView;
