/**
 * EditPet - страница создания/редактирования карточки животного
 *
 * Use Cases:
 * - Создание новой карточки (/animal/create)
 * - Редактирование существующей (/animal/update/:id)
 *
 * Функционал:
 * - Валидация полей формы
 * - Загрузка/удаление фото и документов
 * - Защита от потери несохраненных данных
 * - Toast уведомления
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  useGetAnimalInfoQuery,
  useGetAnimalDetailQuery,
  useCreateAnimalMutation,
  useUpdateAnimalMutation,
  useUploadFilesMutation,
  useDeleteFilesMutation,
  useLazyGetFilesQuery,
  base64ToDataUrl,
  getMimeType,
} from '../services/animalsApi';
import type {
  AnimalGender,
  AnimalGoal,
  CreateAnimalRequest,
  UpdateAnimalRequest,
  LocalFile,
  FileUploadDescriptor,
} from '../types/animal';
import Input from '../components/Input/Input';
import CustomSelect from '../components/Select/Select';
import RadioButton from '../components/RadioButton/RadioButton';
import Button from '../components/Button/Button';
import Toast from '../components/Toast/Toast';
import styles from './EditPet.module.css';

// Маппинг целей на русский
const goalLabels: Record<string, string> = {
  SELL: 'Продажа',
  PAIRING: 'Вязка',
  FREE: 'Отдам бесплатно',
};

// Интерфейс формы
interface FormData {
  name: string;
  speciesId: number | null;
  goal: AnimalGoal | '';
  cost: number | null;
  hasBreed: boolean | null;
  breed: string;
  gender: AnimalGender | '';
  birthday: string;
  weight: string;
  color: string;
  geneticDiseases: string;
  description: string;
}

// Начальное состояние формы
const initialFormData: FormData = {
  name: '',
  speciesId: null,
  goal: '',
  cost: null,
  hasBreed: null,
  breed: '',
  gender: 'M',
  birthday: '',
  weight: '',
  color: '',
  geneticDiseases: '',
  description: '',
};

// Валидация
const validateName = (name: string): string | null => {
  if (!name.trim()) return 'Кличка обязательна';
  if (name.length < 1) return 'Минимум 1 символ';
  if (name.length > 64) return 'Максимум 64 символа';
  if (!/^[a-zA-Zа-яА-ЯёЁ0-9\s\-\/]+$/.test(name)) {
    return 'Только буквы, цифры, пробелы, дефис, слеш';
  }
  return null;
};

const validateBreed = (breed: string): string | null => {
  if (!breed.trim()) return 'Порода обязательна';
  if (breed.length < 3) return 'Минимум 3 символа';
  if (breed.length > 64) return 'Максимум 64 символа';
  if (!/^[a-zA-Zа-яА-ЯёЁ\s\-\/]+$/.test(breed)) {
    return 'Только буквы, пробелы, дефис, слеш';
  }
  return null;
};

const validateBirthday = (birthday: string): string | null => {
  if (!birthday) return 'Дата рождения обязательна';
  const date = new Date(birthday);
  const minDate = new Date('1980-01-01');
  const today = new Date();
  if (date < minDate) return 'Минимальная дата: 01.01.1980';
  if (date > today) return 'Дата не может быть в будущем';
  return null;
};

const validateWeight = (weight: string): string | null => {
  if (!weight) return null; // опционально
  if (weight.length > 7) return 'Максимум 7 символов';
  const num = parseFloat(weight.replace(',', '.'));
  if (isNaN(num) || num <= 0) return 'Должно быть положительным числом';
  return null;
};

const validateColor = (color: string): string | null => {
  if (!color.trim()) return 'Окрас обязателен';
  if (color.length < 3) return 'Минимум 3 символа';
  if (color.length > 200) return 'Максимум 200 символов';
  return null;
};

const validateGeneticDiseases = (diseases: string): string | null => {
  if (!diseases.trim()) return 'Поле обязательно';
  if (diseases.length < 3) return 'Минимум 3 символа';
  if (diseases.length > 2000) return 'Максимум 2000 символов';
  return null;
};

const validateDescription = (description: string): string | null => {
  if (description.length > 2000) return 'Максимум 2000 символов';
  return null;
};

const validateCost = (cost: number | null): string | null => {
  if (cost === null) return 'Цена обязательна';
  if (!Number.isInteger(cost)) return 'Цена должна быть целым числом';
  if (cost < 0) return 'Цена не может быть отрицательной';
  if (cost > 1000000) return 'Максимум 1 000 000';
  return null;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.png', '.pdf'];
const ALLOWED_DOC_EXTENSIONS = ['.pdf', '.jpg', '.png'];

const EditPet: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Определяем режим: создание или редактирование
  const isEditMode = location.pathname.includes('/update/');
  const animalId = id ? parseInt(id, 10) : 0;

  // RTK Query
  const { data: animalInfo, isLoading: isInfoLoading } = useGetAnimalInfoQuery();
  const { data: animalData, isLoading: isAnimalLoading } = useGetAnimalDetailQuery(animalId, {
    skip: !isEditMode || !animalId,
  });

  const [createAnimal, { isLoading: isCreating }] = useCreateAnimalMutation();
  const [updateAnimal, { isLoading: isUpdating }] = useUpdateAnimalMutation();
  const [uploadFiles] = useUploadFilesMutation();
  const [deleteFiles] = useDeleteFilesMutation();
  const [getFiles] = useLazyGetFilesQuery();

  // Состояние формы
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  // Фото
  const [mainPhoto, setMainPhoto] = useState<LocalFile | null>(null);
  const [additionalPhotos, setAdditionalPhotos] = useState<LocalFile[]>([]);

  // Документы (теперь просто массив)
  const [documents, setDocuments] = useState<LocalFile[]>([]);

  // UI состояния
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Опции для селектов
  const speciesOptions = useMemo(() => {
    if (!animalInfo) return [];
    return animalInfo.species.map((s) => ({
      value: s.id.toString(),
      label: s.name,
    }));
  }, [animalInfo]);

  const goalOptions = useMemo(() => {
    if (!animalInfo) return [];
    return animalInfo.goals.map((g) => ({
      value: g.name,
      label: goalLabels[g.name] || g.name,
    }));
  }, [animalInfo]);

  // Инициализация данных при редактировании
  useEffect(() => {
    if (isEditMode && animalData) {
      setFormData({
        name: animalData.name,
        speciesId: animalData.species.id,
        goal: animalData.goal,
        cost: animalData.cost || null,
        hasBreed: animalData.hasBreed,
        breed: animalData.breed || '',
        gender: animalData.gender,
        birthday: animalData.birthday,
        weight: animalData.weight?.toString() || '',
        color: animalData.color,
        geneticDiseases: animalData.geneticDiseases,
        description: animalData.description || '',
      });

      // Загружаем файлы через API
      const loadFiles = async () => {
        try {
          const filesResponse = await getFiles({
            cardIds: [animalId.toString()],
          }).unwrap();

          if (filesResponse.descriptors) {
            // Фильтруем только файлы, принадлежащие текущему животному
            const animalIdStr = animalId.toString();
            const validDescriptors = filesResponse.descriptors.filter(
              (f) => f.card_id === animalIdStr
            );

            // Обрабатываем фото
            const photos = validDescriptors.filter((f) => f.file_type === 'photo');

            // Определяем главное фото по mainPhotoId из animalData
            const mainPhotoId = animalData.photos.mainPhotoId?.toString();
            const mainPhotoDesc = photos.find((p) => p.file_id === mainPhotoId);
            const additionalPhotosDesc = photos.filter((p) => p.file_id !== mainPhotoId);

            if (mainPhotoDesc) {
              const mimeType = getMimeType(mainPhotoDesc.original_filename);
              setMainPhoto({
                id: mainPhotoDesc.file_id,
                file: null,
                url: base64ToDataUrl(mainPhotoDesc.content, mimeType),
                isDeleted: false,
                isNew: false,
                originalFilename: mainPhotoDesc.original_filename,
              });
            }

            if (additionalPhotosDesc.length > 0) {
              setAdditionalPhotos(
                additionalPhotosDesc.map((photo) => {
                  const mimeType = getMimeType(photo.original_filename);
                  return {
                    id: photo.file_id,
                    file: null,
                    url: base64ToDataUrl(photo.content, mimeType),
                    isDeleted: false,
                    isNew: false,
                    originalFilename: photo.original_filename,
                  };
                })
              );
            }

            // Обрабатываем документы (просто список без типов)
            const docs = validDescriptors.filter((f) => f.file_type === 'doc');
            const loadedDocs: LocalFile[] = docs.map((doc) => {
              const mimeType = getMimeType(doc.original_filename);
              return {
                id: doc.file_id,
                file: null,
                url: base64ToDataUrl(doc.content, mimeType),
                isDeleted: false,
                isNew: false,
                originalFilename: doc.original_filename,
              };
            });

            setDocuments(loadedDocs);
          }
        } catch (err) {
          console.error('Failed to load files:', err);
        }
      };

      loadFiles();
    }
  }, [isEditMode, animalData, animalId, getFiles]);

  // Отслеживание изменений
  useEffect(() => {
    if (isEditMode && animalData) {
      // Сравниваем с исходными данными
      const hasChanges =
        formData.name !== animalData.name ||
        formData.speciesId !== animalData.species.id ||
        formData.goal !== animalData.goal;
      setHasUnsavedChanges(hasChanges);
    } else if (!isEditMode) {
      // При создании - любое заполнение = изменения
      const hasAnyData =
        formData.name.trim() !== '' ||
        formData.speciesId !== null ||
        formData.color.trim() !== '';
      setHasUnsavedChanges(hasAnyData);
    }
  }, [formData, isEditMode, animalData]);

  // Защита от ухода со страницы
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Обработчик изменения полей
  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Очищаем ошибку при изменении
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Валидация файла
  const validateFile = (file: File, allowedExtensions: string[]): string | null => {
    const fileName = file.name.toLowerCase();
    const hasAllowedExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    if (!hasAllowedExtension) {
      return 'Недопустимый формат файла';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'Размер файла должен быть до 5 Мб';
    }
    return null;
  };

  // Загрузка основного фото
  const handleMainPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateFile(file, ALLOWED_IMAGE_EXTENSIONS);
    if (error) {
      setToast({ message: error, type: 'error' });
      return;
    }

    setMainPhoto({
      id: Date.now().toString(),
      file,
      url: URL.createObjectURL(file),
      isDeleted: false,
      isNew: true,
    });
  };

  // Удаление основного фото
  const removeMainPhoto = () => {
    if (mainPhoto) {
      if (mainPhoto.isNew) {
        setMainPhoto(null);
      } else {
        setMainPhoto({ ...mainPhoto, isDeleted: true });
      }
    }
  };

  // Загрузка дополнительного фото
  const handleAdditionalPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (additionalPhotos.filter((p) => !p.isDeleted).length >= 10) {
      setToast({ message: 'Максимум 10 дополнительных фото', type: 'error' });
      return;
    }

    const error = validateFile(file, ALLOWED_IMAGE_EXTENSIONS);
    if (error) {
      setToast({ message: error, type: 'error' });
      return;
    }

    setAdditionalPhotos((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        file,
        url: URL.createObjectURL(file),
        isDeleted: false,
        isNew: true,
      },
    ]);
  };

  // Удаление дополнительного фото
  const removeAdditionalPhoto = (photoId: string) => {
    setAdditionalPhotos((prev) =>
      prev.map((photo) =>
        photo.id === photoId
          ? { ...photo, isDeleted: true }
          : photo
      )
    );
  };

  // Загрузка документа
  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateFile(file, ALLOWED_DOC_EXTENSIONS);
    if (error) {
      setToast({ message: error, type: 'error' });
      return;
    }

    setDocuments((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        file,
        url: URL.createObjectURL(file),
        isDeleted: false,
        isNew: true,
        originalFilename: file.name,
      },
    ]);
  };

  // Удаление документа
  const removeDocument = (docId: string) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === docId
          ? doc.isNew
            ? { ...doc, isDeleted: true }
            : { ...doc, isDeleted: true }
          : doc
      ).filter((doc) => !(doc.isNew && doc.isDeleted))
    );
  };

  // Валидация формы
  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    const nameError = validateName(formData.name);
    if (nameError) newErrors.name = nameError;

    if (!formData.speciesId) newErrors.speciesId = 'Выберите вид животного';

    if (formData.hasBreed === null) newErrors.hasBreed = 'Выберите ответ';

    if (formData.hasBreed === true) {
      const breedError = validateBreed(formData.breed);
      if (breedError) newErrors.breed = breedError;
    }

    if (!formData.gender) newErrors.gender = 'Выберите пол';

    const birthdayError = validateBirthday(formData.birthday);
    if (birthdayError) newErrors.birthday = birthdayError;

    const weightError = validateWeight(formData.weight);
    if (weightError) newErrors.weight = weightError;

    const colorError = validateColor(formData.color);
    if (colorError) newErrors.color = colorError;

    const diseasesError = validateGeneticDiseases(formData.geneticDiseases);
    if (diseasesError) newErrors.geneticDiseases = diseasesError;

    const descError = validateDescription(formData.description);
    if (descError) newErrors.description = descError;

    if (!formData.goal) newErrors.goal = 'Выберите цель размещения';

    if (formData.goal === 'SELL') {
      const costError = validateCost(formData.cost);
      if (costError) newErrors.cost = costError;
    }

    // Проверка основного фото
    if (!mainPhoto || mainPhoto.isDeleted) {
      setToast({ message: 'Необходимо загрузить основное фото', type: 'error' });
      setErrors(newErrors);
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, mainPhoto]);

  // Проверка валидности формы для кнопки
  const isFormValid = useMemo(() => {
    return (
      formData.name.trim() !== '' &&
      formData.speciesId !== null &&
      formData.hasBreed !== null &&
      (formData.hasBreed === false || formData.breed.trim() !== '') &&
      formData.gender !== '' &&
      formData.birthday !== '' &&
      formData.color.trim() !== '' &&
      formData.geneticDiseases.trim() !== '' &&
      formData.goal !== '' &&
      (formData.goal !== 'SELL' || formData.cost !== null) &&
      mainPhoto !== null &&
      !mainPhoto.isDeleted
    );
  }, [formData, mainPhoto]);

  // Сохранение
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const requestData: CreateAnimalRequest | UpdateAnimalRequest = {
        name: formData.name.trim(),
        speciesId: formData.speciesId!,
        goal: formData.goal as AnimalGoal,
        cost: formData.goal === 'SELL' ? formData.cost : undefined,
        hasBreed: formData.hasBreed!,
        breed: formData.hasBreed ? formData.breed.trim() : undefined,
        gender: formData.gender as AnimalGender,
        birthday: formData.birthday,
        weight: formData.weight ? parseFloat(formData.weight.replace(',', '.')) : undefined,
        color: formData.color.trim(),
        geneticDiseases: formData.geneticDiseases.trim(),
        description: formData.description.trim() || undefined,
      };

      let savedAnimalId: number;

      if (isEditMode) {
        await updateAnimal({
          animalId,
          data: requestData as UpdateAnimalRequest,
        }).unwrap();
        // При редактировании используем существующий animalId
        savedAnimalId = animalId;
      } else {
        const result = await createAnimal(requestData as CreateAnimalRequest).unwrap();
        savedAnimalId = result.animalId;
      }

      // Собираем все новые файлы для batch загрузки
      const filesToUpload: File[] = [];
      const descriptors: FileUploadDescriptor[] = [];

      // Главное фото
      if (mainPhoto?.isNew && mainPhoto.file) {
        filesToUpload.push(mainPhoto.file);
        descriptors.push({
          originalFilename: mainPhoto.file.name,
          isMain: true,
          fileType: 'PHOTO',
        });
      }

      // Дополнительные фото
      for (const photo of additionalPhotos) {
        if (photo.isNew && photo.file && !photo.isDeleted) {
          filesToUpload.push(photo.file);
          descriptors.push({
            originalFilename: photo.file.name,
            isMain: false,
            fileType: 'PHOTO',
          });
        }
      }

      // Документы
      for (const doc of documents) {
        if (doc.isNew && doc.file && !doc.isDeleted) {
          filesToUpload.push(doc.file);
          descriptors.push({
            originalFilename: doc.file.name,
            isMain: false,
            fileType: 'DOC',
          });
        }
      }

      // Batch загрузка файлов
      if (filesToUpload.length > 0) {
        await uploadFiles({
          files: filesToUpload,
          metadata: {
            descriptors,
          },
          adId: savedAnimalId,
        }).unwrap();
      }

      // Собираем ID файлов для удаления
      const fileIdsToDelete: string[] = [];

      // Удаленное главное фото
      if (mainPhoto?.isDeleted && !mainPhoto.isNew) {
        fileIdsToDelete.push(mainPhoto.id);
      }

      // Удаленные дополнительные фото
      for (const photo of additionalPhotos) {
        if (photo.isDeleted && !photo.isNew) {
          fileIdsToDelete.push(photo.id);
        }
      }

      // Удаленные документы
      for (const doc of documents) {
        if (doc.isDeleted && !doc.isNew) {
          fileIdsToDelete.push(doc.id);
        }
      }

      // Batch удаление файлов
      if (fileIdsToDelete.length > 0) {
        await deleteFiles({ fileIds: fileIdsToDelete }).unwrap();
      }

      setHasUnsavedChanges(false);

      const successMessage = isEditMode
        ? 'Карточка животного успешно обновлена, ожидает проверки модератором перед публикацией'
        : 'Карточка животного успешно добавлена, ожидает проверки модератором перед публикацией';

      setToast({ message: successMessage, type: 'success' });

      // Переход на страницу просмотра
      setTimeout(() => {
        navigate(`/animal/${savedAnimalId}`);
      }, 1500);
    } catch (err) {
      console.error('Save error:', err);
      setToast({ message: 'При сохранении возникла ошибка, попробуйте позже', type: 'error' });
    }
  };

  // Отмена
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowCancelModal(true);
    } else {
      navigate(-1);
    }
  };

  const confirmCancel = () => {
    setShowCancelModal(false);
    setHasUnsavedChanges(false);
    navigate(-1);
  };

  // Загрузка
  const isLoading = isInfoLoading || (isEditMode && isAnimalLoading);
  const isSaving = isCreating || isUpdating;

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Загрузка...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Toast уведомления */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={true}
          onClose={() => setToast(null)}
        />
      )}

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
      >
        <div className={styles.header}>
          <h1>{isEditMode ? 'Редактирование питомца' : 'Добавление питомца'}</h1>
        </div>

        <div className={styles.form}>
          <div className={styles.formColumns}>
            <div className={styles.formColumn}>
              {/* Кличка */}
              <div className={styles.formGroup}>
                <div className={styles.label}>Кличка *</div>
                <div className={styles.inputWrapper}>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Введите кличку питомца"
                    maxLength={64}
                  />
                  {errors.name && <div className={styles.fieldError}>{errors.name}</div>}
                </div>
              </div>

              {/* Вид животного */}
              <div className={styles.formGroup}>
                <div className={styles.label}>Вид животного *</div>
                <div className={styles.inputWrapper}>
                  <CustomSelect
                    options={speciesOptions}
                    value={speciesOptions.find((o) => o.value === formData.speciesId?.toString()) || null}
                    onChange={(selected: any) =>
                      handleInputChange('speciesId', selected ? parseInt(selected.value) : null)
                    }
                    placeholder="Не выбрано"
                  />
                  {errors.speciesId && <div className={styles.fieldError}>{errors.speciesId}</div>}
                </div>
              </div>

              {/* Известна ли порода */}
              <div className={styles.formGroup}>
                <div className={styles.label}>Известна ли порода? *</div>
                <div className={styles.inputWrapper}>
                  <RadioButton
                    name="hasBreed"
                    options={[
                      { value: 'true', label: 'Да' },
                      { value: 'false', label: 'Нет' },
                    ]}
                    selectedValue={formData.hasBreed === null ? undefined : formData.hasBreed.toString()}
                    onChange={(value) => handleInputChange('hasBreed', value === 'true')}
                    inline
                  />
                  {errors.hasBreed && <div className={styles.fieldError}>{errors.hasBreed}</div>}
                </div>
              </div>

              {/* Порода (если известна) */}
              {formData.hasBreed === true && (
                <div className={styles.formGroup}>
                  <div className={styles.label}>Порода *</div>
                  <div className={styles.inputWrapper}>
                    <Input
                      value={formData.breed}
                      onChange={(e) => handleInputChange('breed', e.target.value)}
                      placeholder="Введите породу питомца"
                      maxLength={64}
                    />
                    {errors.breed && <div className={styles.fieldError}>{errors.breed}</div>}
                  </div>
                </div>
              )}

              {/* Пол */}
              <div className={styles.formGroup}>
                <div className={styles.label}>Пол *</div>
                <div className={styles.inputWrapper}>
                  <RadioButton
                    name="gender"
                    options={[
                      { value: 'M', label: 'Мужской' },
                      { value: 'F', label: 'Женский' },
                    ]}
                    selectedValue={formData.gender || 'M'}
                    onChange={(value) => handleInputChange('gender', value)}
                    inline
                  />
                  {errors.gender && <div className={styles.fieldError}>{errors.gender}</div>}
                </div>
              </div>

              {/* Дата рождения */}
              <div className={styles.formGroup}>
                <div className={styles.label}>Дата рождения *</div>
                <div className={styles.inputWrapper}>
                  <Input
                    type="date"
                    value={formData.birthday}
                    onChange={(e) => handleInputChange('birthday', e.target.value)}
                    min="1980-01-01"
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {errors.birthday && <div className={styles.fieldError}>{errors.birthday}</div>}
                </div>
              </div>

              {/* Вес */}
              <div className={styles.formGroup}>
                <div className={styles.label}>Вес (кг)</div>
                <div className={styles.inputWrapper}>
                  <Input
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    placeholder="Например: 4,5"
                    maxLength={7}
                  />
                  {errors.weight && <div className={styles.fieldError}>{errors.weight}</div>}
                </div>
              </div>

              {/* Окрас */}
              <div className={styles.formGroup}>
                <div className={styles.label}>Окрас *</div>
                <div className={styles.inputWrapper}>
                  <Input
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    placeholder="Опишите окрас питомца"
                    maxLength={200}
                  />
                  {errors.color && <div className={styles.fieldError}>{errors.color}</div>}
                </div>
              </div>

              {/* Наследственные заболевания */}
              <div className={styles.formGroup}>
                <div className={styles.label}>Наследственные заболевания *</div>
                <div className={styles.inputWrapper}>
                  <textarea
                    className={styles.textarea}
                    value={formData.geneticDiseases}
                    onChange={(e) => handleInputChange('geneticDiseases', e.target.value)}
                    placeholder="Опишите наследственные заболевания или напишите 'Нет'"
                    maxLength={2000}
                    rows={4}
                  />
                  {errors.geneticDiseases && (
                    <div className={styles.fieldError}>{errors.geneticDiseases}</div>
                  )}
                </div>
              </div>

              {/* Описание */}
              <div className={styles.formGroup}>
                <div className={styles.label}>Описание</div>
                <div className={styles.inputWrapper}>
                  <textarea
                    className={styles.textarea}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Опишите питомца"
                    maxLength={2000}
                    rows={4}
                  />
                  {errors.description && <div className={styles.fieldError}>{errors.description}</div>}
                </div>
              </div>
            </div>

            <div className={styles.formColumn}>
              {/* Основное фото */}
              <div className={styles.section}>
                <div className={styles.formGroup}>
                  <div className={styles.label}>Основное фото *</div>
                  <div className={styles.inputWrapper}>
                    <div className={styles.photoUpload}>
                      {mainPhoto && !mainPhoto.isDeleted ? (
                        <div className={styles.photoPreview}>
                          <img src={mainPhoto.url} alt="Основное фото" />
                          <button
                            type="button"
                            className={styles.removePhoto}
                            onClick={removeMainPhoto}
                          >
                            &times;
                          </button>
                        </div>
                      ) : (
                        <div className={styles.photoPlaceholder}>
                          <input
                            type="file"
                            accept="image/jpg,image/png"
                            onChange={handleMainPhotoUpload}
                            style={{ display: 'none' }}
                            id="main-photo-upload"
                          />
                          <label htmlFor="main-photo-upload" className={styles.uploadButton}>
                            Загрузить основное фото
                          </label>
                        </div>
                      )}
                    </div>
                    <div className={styles.formatHint}>Поддерживаемые форматы: JPG, PNG. Максимальный размер: 5MB.</div>
                  </div>
                </div>

                {/* Дополнительные фото */}
                <div className={styles.formGroup}>
                  <div className={styles.label}>Дополнительные фото (до 10)</div>
                  <div className={styles.inputWrapper}>
                    <div className={styles.additionalPhotos}>
                      {additionalPhotos
                        .filter((photo) => !photo.isDeleted)
                        .map((photo) => (
                          <div key={photo.id} className={styles.photoPreview}>
                            <img src={photo.url} alt="Доп. фото" />
                            <button
                              type="button"
                              className={styles.removePhoto}
                              onClick={() => removeAdditionalPhoto(photo.id)}
                            >
                              &times;
                            </button>
                          </div>
                        ))}

                      {additionalPhotos.filter((p) => !p.isDeleted).length < 10 && (
                        <div className={styles.photoPlaceholder}>
                          <input
                            type="file"
                            accept="image/jpg,image/png"
                            onChange={handleAdditionalPhotoUpload}
                            style={{ display: 'none' }}
                            id="additional-photo-upload"
                          />
                          <label htmlFor="additional-photo-upload" className={styles.uploadButton}>
                            + Добавить
                          </label>
                        </div>
                      )}
                    </div>
                    <div className={styles.formatHint}>Поддерживаемые форматы: JPG, PNG. Максимальный размер: 5MB.</div>
                  </div>
                </div>
              </div>

              {/* Документы */}
              <div className={styles.section}>
                <div className={styles.formGroup}>
                  <div className={styles.label}>Документы</div>
                  <div className={styles.inputWrapper}>
                    <div className={styles.documentSection}>
                      {/* Список загруженных документов */}
                      {documents
                        .filter((doc) => !doc.isDeleted)
                        .map((doc) => (
                          <div key={doc.id} className={styles.documentItem}>
                            <div className={styles.documentUpload}>
                              <div className={styles.documentPreview}>
                                <div className={styles.documentName}>
                                  {doc.file?.name || doc.originalFilename || 'document'}
                                </div>
                                <button
                                  type="button"
                                  className={styles.removeDocument}
                                  onClick={() => removeDocument(doc.id)}
                                >
                                  &times;
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}

                      {/* Кнопка добавления документа */}
                      <div className={styles.documentItem}>
                        <div className={styles.documentUpload}>
                          <div className={styles.documentPlaceholder}>
                            <input
                              type="file"
                              onChange={handleDocumentUpload}
                              style={{ display: 'none' }}
                              id="document-upload"
                              accept=".pdf,.jpg,.png"
                            />
                            <label htmlFor="document-upload" className={styles.uploadButton}>
                              + Добавить документ
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={styles.formatHint}>Поддерживаемые форматы: JPG, PNG, PDF. Максимальный размер: 5MB.</div>
                  </div>
                </div>
              </div>

              {/* Цель размещения */}
              <div className={styles.formGroup}>
                <div className={styles.label}>Цель размещения *</div>
                <div className={styles.inputWrapper}>
                  <CustomSelect
                    options={goalOptions}
                    value={goalOptions.find((o) => o.value === formData.goal) || null}
                    onChange={(selected: any) => handleInputChange('goal', selected?.value || '')}
                    placeholder="Не выбрано"
                  />
                  {errors.goal && <div className={styles.fieldError}>{errors.goal}</div>}
                </div>
              </div>

              {/* Цена (если продажа) */}
              {formData.goal === 'SELL' && (
                <div className={styles.formGroup}>
                  <div className={styles.label}>Цена *</div>
                  <div className={styles.inputWrapper}>
                    <Input
                      type="number"
                      value={formData.cost || ''}
                      onChange={(e) =>
                        handleInputChange('cost', e.target.value ? parseInt(e.target.value) : null)
                      }
                      placeholder="Введите цену"
                      min={0}
                      max={1000000}
                    />
                    {errors.cost && <div className={styles.fieldError}>{errors.cost}</div>}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Кнопки */}
          <div className={styles.buttons}>
            <Button type="submit" disabled={!isFormValid || isSaving} title={!isFormValid ? 'Необходимо заполнить все обязательные поля, которые отмечены *' : ''}>
              {isSaving ? 'Сохранение...' : 'Сохранить'}
            </Button>
            <Button type="button" onClick={handleCancel}>
              Отменить
            </Button>
          </div>
        </div>
      </form>

      {/* Модальное окно отмены */}
      {showCancelModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Вы уверены, что хотите покинуть режим редактирования?</h3>
            <p>Несохраненные изменения будут утеряны</p>
            <div className={styles.modalButtons}>
              <Button onClick={confirmCancel}>Да</Button>
              <Button onClick={() => setShowCancelModal(false)}>Нет</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditPet;
