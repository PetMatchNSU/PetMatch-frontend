/**
 * Profile Page - страница профиля пользователя
 *
 * Функционал:
 * - Просмотр данных профиля
 * - Редактирование профиля
 * - Валидация данных
 * - Отображение статуса профиля (ON_CHECKING/BLOCKED)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSelector } from 'react-redux';
import type { SingleValue } from 'react-select';
import { selectUser } from '../store/authSelectors';
import { useGetUserProfileQuery, useUpdateUserProfileMutation, useLazySearchCitiesQuery } from '../services/userApi';
import type { BondTime, ContactInfoItem, Gender } from '../types/user';
import type { ContactInfo } from '../types/auth';
import Input, { LabelPosition } from '../components/Input/Input';
import Button from '../components/Button/Button';
import RadioButton from '../components/RadioButton/RadioButton';
import Select from '../components/Select/Select';
import PreferredTimeInput from '../components/PreferredTimeInput';
import RegistrationTable from '../components/RegistrationTable';
import styles from './Profile.module.css';
import { selectContactInfo } from '../store/profileSelectors';

// Префиксы для контактов (должны совпадать с RegistrationTable)
const CONTACT_PREFIXES: Record<string, string> = {
  PHONE: '+7',
  TELEGRAM: '@',
  VK: 'https://vk.com/',
};

// Удаление префикса из значения контакта (данные с сервера приходят с префиксами)
const stripContactPrefix = (type: string, value: string): string => {
  const prefix = CONTACT_PREFIXES[type];
  if (prefix && value.startsWith(prefix)) {
    return value.slice(prefix.length);
  }
  return value;
};

// Добавление префикса к значению контакта (для отправки на сервер)
const addContactPrefix = (type: string, value: string): string => {
  const prefix = CONTACT_PREFIXES[type];
  if (prefix && !value.startsWith(prefix)) {
    return prefix + value;
  }
  return value;
};

// Разделение ФИО на отдельные поля (Фамилия Имя Отчество)
const splitFullName = (fullName: string): { firstName: string; secondName: string; middleName: string } => {
  const parts = fullName.trim().split(/\s+/);
  return {
    secondName: (parts[0] || '').trim(),  // Фамилия
    firstName: (parts[1] || '').trim(),   // Имя
    middleName: (parts[2] || '').trim(),  // Отчество
  };
};

// Схема валидации профиля
const profileSchema = yup.object({
  fullName: yup
    .string()
    .required('ФИО обязательно для заполнения')
    .min(1, 'Минимум 1 символ')
    .max(64, 'Максимум 64 символа')
    .matches(/^[a-zA-Zа-яА-ЯёЁ\s\-']+$/, 'ФИО должно содержать только буквы, пробелы, дефисы и апострофы'),
  gender: yup
    .string()
    .oneOf(['M', 'F'], 'Выберите пол')
    .required('Пол обязателен для заполнения'),
  region: yup
    .string()
    .required('Регион обязателен для заполнения'),
  city: yup
    .string()
    .required('Город обязателен для заполнения'),
}).required();

interface CityOption {
  value: string;
  label: string;
  city: string;
  region: string;
}

interface ProfileFormData {
  fullName: string;
  gender: Gender;
  region: string;
  city: string;
}

const Profile: React.FC = () => {
  // Redux
  const user = useSelector(selectUser);
  const profileContactInfo = useSelector(selectContactInfo);
  console.log(user);
  console.log(profileContactInfo)
  const userEmail = user?.email || '';
  // const userContactEmail = profileContactInfo[0]?.contact || ''

  // RTK Query
  const { data: profile, isLoading, error: loadError, refetch } = useGetUserProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateUserProfileMutation();
  const [searchCities, { data: citiesData, isFetching: isLoadingCities }] = useLazySearchCitiesQuery();

  // Локальное состояние
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Состояние для полей формы
  const [selectedCity, setSelectedCity] = useState<SingleValue<CityOption>>(null);
  const [cityInputValue, setCityInputValue] = useState('');
  const [bondTime, setBondTime] = useState<BondTime[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo[]>([]);
  const [isContactInfoValid, setIsContactInfoValid] = useState(true);
  const [isBondTimeValid, setIsBondTimeValid] = useState(true);
  const [contactEmail, setContactEmail] = useState('');

  // React Hook Form
  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm<ProfileFormData>({
    resolver: yupResolver(profileSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      fullName: '',
      gender: 'M',
      region: '',
      city: '',
    },
  });

  // Опции для городов из API
  const cityOptions: CityOption[] = citiesData?.locations?.map((loc) => ({
    value: `${loc.region}, ${loc.city}`,
    label: `${loc.region}, ${loc.city}`,
    city: loc.city,
    region: loc.region,
  })) || [];

  // Заполнение формы данными профиля
  const populateForm = useCallback(() => {
    if (!profile) return;

    reset({
      fullName: profile.fullName,
      gender: profile.gender,
      region: profile.region,
      city: profile.city,
    });

    // Устанавливаем город
    if (profile.region && profile.city) {
      setSelectedCity({
        value: `${profile.region}, ${profile.city}`,
        label: `${profile.region}, ${profile.city}`,
        city: profile.city,
        region: profile.region,
      });
    }

    // Устанавливаем время связи
    setBondTime(profile.bondTime || []);
    setIsBondTimeValid(profile.bondTime && profile.bondTime.length > 0);

    // Конвертируем contactInfo в формат для RegistrationTable (убираем префиксы)
    const contacts: ContactInfo[] = profile.contactInfo?.map((item: ContactInfoItem) => ({
      type: item.type,
      contact: stripContactPrefix(item.type, item.contact),
      visible: item.visible,
    })) || [];
    setContactInfo(contacts);
    setIsContactInfoValid(contacts.length > 0);

    // Извлекаем email из контактов профиля
    const emailContact = profile.contactInfo?.find((item: ContactInfoItem) => item.type === 'EMAIL');
    setContactEmail(emailContact?.contact || userEmail || '');
  }, [profile, reset, userEmail]);

  // Загрузка данных профиля
  useEffect(() => {
    populateForm();
  }, [populateForm]);

  // Обработчик поиска городов
  const handleCitySearch = useCallback((inputValue: string) => {
    setCityInputValue(inputValue);
    if (inputValue.trim()) {
      searchCities(inputValue);
    }
  }, [searchCities]);

  // Обработчик выбора города
  const handleCityChange = (newValue: SingleValue<CityOption>) => {
    setSelectedCity(newValue);
    setCityInputValue('');
    if (newValue) {
      setValue('city', newValue.city, { shouldValidate: true });
      setValue('region', newValue.region, { shouldValidate: true });
    } else {
      setValue('city', '', { shouldValidate: true });
      setValue('region', '', { shouldValidate: true });
    }
  };

  // Обработчик изменения времени связи
  const handleBondTimeChange = (times: BondTime[], isValid: boolean) => {
    setBondTime(times);
    setIsBondTimeValid(isValid);
  };

  // Обработчик изменения контактной информации
  const handleContactInfoChange = (contacts: ContactInfo[], valid: boolean) => {
    setContactInfo(contacts);
    setIsContactInfoValid(valid);
  };

  // Начать редактирование
  const handleEdit = () => {
    setIsEditing(true);
    setSaveSuccess(false);
    setServerError(null);
  };

  // Отмена редактирования
  const handleCancelClick = () => {
    if (isDirty || bondTime !== profile?.bondTime || contactInfo.length !== profile?.contactInfo?.length) {
      setShowCancelModal(true);
    } else {
      handleCancelConfirm();
    }
  };

  // Подтверждение отмены
  const handleCancelConfirm = () => {
    setShowCancelModal(false);
    populateForm();
    setIsEditing(false);
    setServerError(null);
  };

  // Отправка формы
  const onSubmit = async (data: ProfileFormData) => {
    setServerError(null);
    setSaveSuccess(false);

    // Проверяем валидность всех полей
    if (!isBondTimeValid) {
      setServerError('Укажите хотя бы один интервал времени для связи');
      return;
    }

    if (!isContactInfoValid || contactInfo.length === 0) {
      setServerError('Укажите хотя бы один способ связи');
      return;
    }

    try {
      const { firstName, secondName, middleName } = splitFullName(data.fullName);

      await updateProfile({
        firstName,
        secondName,
        middleName,
        gender: data.gender,
        region: data.region,
        city: data.city,
        bondTime: bondTime,
        contactInfo: contactInfo.map((c) => ({
          type: c.type,
          contact: addContactPrefix(c.type, c.contact),
          visible: c.visible,
        })),
      }).unwrap();

      setSaveSuccess(true);
      setIsEditing(false);
      refetch();

      // Скрываем сообщение об успехе через 3 секунды
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err: unknown) {
      console.error('Ошибка при сохранении профиля:', err);
      const error = err as { data?: { error?: string } };
      setServerError(error?.data?.error || 'Не удалось сохранить изменения. Попробуйте еще раз.');
    }
  };

  // Форматирование города для отображения
  const formatCityDisplay = (): string => {
    if (!profile?.region || !profile?.city) return '-';
    return `${profile.region}, ${profile.city}`;
  };

  // Форматирование пола для отображения
  const formatGenderDisplay = (gender: Gender): string => {
    return gender === 'M' ? 'М' : 'Ж';
  };

  // Проверка можно ли сохранить форму
  const canSave = isValid && isContactInfoValid && isBondTimeValid && !isUpdating;

  // Загрузка
  if (isLoading) {
    return (
      <div className={styles.profile}>
        <div className={styles.profile__container}>
          <div className={styles.profile__loading}>
            Загрузка профиля...
          </div>
        </div>
      </div>
    );
  }

  // Ошибка загрузки
  if (loadError) {
    return (
      <div className={styles.profile}>
        <div className={styles.profile__container}>
          <div className={styles.profile__error}>
            Не удалось загрузить профиль. Попробуйте обновить страницу.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.profile}>
      <div className={styles.profile__container}>
        {/* Сообщение об успехе */}
        {saveSuccess && (
          <div className={styles.profile__success}>
            Изменения успешно сохранены!
          </div>
        )}

        {/* Ошибка сервера */}
        {serverError && (
          <div className={styles.profile__error}>
            {serverError}
          </div>
        )}

        {/* Статус профиля */}
        {profile && (profile.reviewStatus === 'ON_CHECKING' || profile.reviewStatus === 'BLOCKED') && (
          <div className={`${styles.profile__status} ${styles[`profile__status--${profile.reviewStatus.toLowerCase()}`]}`}>
            <div className={styles.profile__statusLabel}>
              {profile.reviewStatus === 'ON_CHECKING' ? 'Профиль на проверке' : 'Профиль заблокирован'}
            </div>
            {profile.reviewComment && (
              <div className={styles.profile__statusComment}>
                Комментарий: {profile.reviewComment}
              </div>
            )}
          </div>
        )}

        {/* Заголовок */}
        <div className={styles.profile__header}>
          <h1>Профиль пользователя</h1>
          {!isEditing && (
            <Button
              type="button"
              size="medium"
              onClick={handleEdit}
              className={styles.profile__editButton}
            >
              Редактировать
            </Button>
          )}
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit(onSubmit)} className={styles.profile__form}>
          {/* Основная информация */}
          <div className={styles.profile__section}>
            <h2 className={styles.profile__sectionTitle}>Основная информация</h2>

            {/* ФИО */}
            {isEditing ? (
              <Input
                label="ФИО"
                placeholder="Введите ваше полное имя"
                {...register('fullName')}
                error={errors.fullName?.message}
              />
            ) : (
              <div className={styles.profile__field}>
                <label className={styles.profile__label}>ФИО</label>
                <div className={styles.profile__value}>{profile?.fullName || '-'}</div>
              </div>
            )}

            {/* Пол */}
            {isEditing ? (
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <RadioButton
                    label="Пол"
                    name="gender"
                    options={[
                      { value: 'M', label: 'М' },
                      { value: 'F', label: 'Ж' },
                    ]}
                    selectedValue={field.value}
                    onChange={field.onChange}
                    inline={true}
                    labelPosition={LabelPosition.TOP}
                  />
                )}
              />
            ) : (
              <div className={styles.profile__field}>
                <label className={styles.profile__label}>Пол</label>
                <div className={styles.profile__value}>
                  {profile?.gender ? formatGenderDisplay(profile.gender) : '-'}
                </div>
              </div>
            )}

            {/* Город */}
            {isEditing ? (
              <Select
                label="Город проживания"
                options={cityOptions}
                value={selectedCity}
                inputValue={cityInputValue}
                onChange={(newValue) => handleCityChange(newValue as SingleValue<CityOption>)}
                onInputChange={(value, actionMeta) => {
                  if (actionMeta.action === 'input-change') {
                    handleCitySearch(value);
                  }
                }}
                filterOption={() => true}
                isLoading={isLoadingCities}
                placeholder="Начните вводить название города"
                error={errors.city?.message || errors.region?.message}
                labelPosition={LabelPosition.TOP}
              />
            ) : (
              <div className={styles.profile__field}>
                <label className={styles.profile__label}>Город проживания</label>
                <div className={styles.profile__value}>{formatCityDisplay()}</div>
              </div>
            )}

            {/* Время связи */}
            <PreferredTimeInput
              label="Предпочитаемое время связи"
              value={bondTime}
              onChange={handleBondTimeChange}
              labelPosition={LabelPosition.TOP}
              viewMode={!isEditing}
              disabled={!isEditing}
              error={!isBondTimeValid && isEditing ? 'Укажите хотя бы один интервал времени' : undefined}
            />
          </div>

          {/* Контактная информация */}
          <div className={styles.profile__section}>
            <h2 className={styles.profile__sectionTitle}>Контактная информация</h2>
            <RegistrationTable
              contactInfo={contactInfo}
              onChange={handleContactInfoChange}
              userEmail={contactEmail}
              viewMode={!isEditing}
              disabled={!isEditing}
              error={!isContactInfoValid && isEditing ? 'Укажите хотя бы один способ связи' : undefined}
            />
          </div>

          {/* Кнопки действий */}
          {isEditing && (
            <div className={styles.profile__actions}>
              <Button
                type="button"
                size="large"
                onClick={handleCancelClick}
                className={styles.profile__cancelButton}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                size="large"
                disabled={!canSave}
                className={styles.profile__saveButton}
              >
                {isUpdating ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </div>
          )}
        </form>

        {/* Модальное окно подтверждения отмены */}
        {showCancelModal && (
          <div className={styles.modal__overlay}>
            <div className={styles.modal__content}>
              <h3 className={styles.modal__title}>Отменить изменения?</h3>
              <p className={styles.modal__text}>
                Все несохранённые изменения будут потеряны.
              </p>
              <div className={styles.modal__actions}>
                <Button
                  type="button"
                  size="medium"
                  onClick={() => setShowCancelModal(false)}
                >
                  Продолжить редактирование
                </Button>
                <Button
                  type="button"
                  size="medium"
                  onClick={handleCancelConfirm}
                  className={styles.modal__confirmButton}
                >
                  Отменить изменения
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
