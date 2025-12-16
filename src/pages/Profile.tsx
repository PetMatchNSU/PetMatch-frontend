import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { api } from '../services/api';
import type { CityLocation } from '../types/city';
import type { UserProfile, ContactInfo, VisibilitySettings } from '../types/user';
import Input, { LabelPosition } from '../components/Input/Input';
import Button from '../components/Button/Button';
import RadioButton from '../components/RadioButton/RadioButton';
import Select from '../components/Select/Select';
import Checkbox from '../components/Checkbox/Checkbox';
import PreferredTimeInput from '../components/PreferredTimeInput';
import RegistrationTable from '../components/RegistrationTable';
import type { SingleValue } from 'react-select';
import styles from './Profile.module.css';

const schema = yup.object({
  fullName: yup
    .string()
    .required('ФИО обязательно для заполнения')
    .matches(/^[a-zA-Zа-яА-ЯёЁ\s\-']+$/, 'ФИО должно содержать только буквы, пробелы, дефисы и апострофы')
    .test('min-words', 'ФИО должно содержать минимум 2 слова', (value) => {
      if (!value) return false;
      return value.trim().split(/\s+/).length >= 2;
    })
    .test('max-length', 'ФИО не должно превышать 100 символов', (value) => {
      return !value || value.length <= 100;
    }),
  city: yup
    .string()
    .required('Город обязателен для заполнения'),
  comment: yup
    .string()
    .max(500, 'Комментарий не должен превышать 500 символов'),
}).required();

interface SelectOption {
  value: string;
  label: string;
}

const Profile: React.FC = () => {
  const {
    register,
    handleSubmit,
    watch,
    trigger,
    setValue,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [selectedCity, setSelectedCity] = useState<SingleValue<SelectOption>>(null);
  const [preferredTime, setPreferredTime] = useState<string>('');
  const [cityOptions, setCityOptions] = useState<SelectOption[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [allCities, setAllCities] = useState<SelectOption[]>([]);
  const [filteredCities, setFilteredCities] = useState<SelectOption[]>([]);
  const [profileStatus, setProfileStatus] = useState<'active' | 'blocked'>('active');
  const [comment, setComment] = useState<string>('');
  
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: '',
    phone: '',
    telegram: '',
    vk: ''
  });
  
  const [visibility, setVisibility] = useState<VisibilitySettings>({
    email: true,
    phone: false,
    telegram: false,
    vk: false
  });

  const formData = watch();

  // Загрузка профиля при монтировании
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const userProfile = await api.getProfile();
        setProfile(userProfile);
        
        // Заполняем форму данными профиля
        reset({
          fullName: userProfile.fullName,
          city: userProfile.city,
          comment: userProfile.comment || '',
        });
        
        setGender(userProfile.gender);
        setPreferredTime(userProfile.preferredTime || '');
        setContactInfo(userProfile.contactInfo);
        setVisibility(userProfile.visibility);
        setProfileStatus(userProfile.status);
        setComment(userProfile.comment || '');
        
        // Устанавливаем выбранный город
        if (userProfile.city) {
          const cityOption = allCities.find(city => 
            city.value.includes(userProfile.city.split(',')[0])
          ) || { value: userProfile.city, label: userProfile.city };
          setSelectedCity(cityOption);
        }
        
      } catch (error) {
        console.error('Ошибка при загрузке профиля:', error);
        setServerError('Не удалось загрузить профиль');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [reset]);

  // Загрузка городов
  useEffect(() => {
    const loadAllCities = async () => {
      setIsLoadingCities(true);
      try {
        const response = await api.getCities('');
        
        const options: SelectOption[] = response.locations.map((location: CityLocation) => ({
          value: `${location.city}, ${location.region}`,
          label: `${location.city}, ${location.region}`
        }));

        setAllCities(options);
        setFilteredCities(options);
      } catch (error) {
        console.error('Ошибка при загрузке городов:', error);
        setAllCities([]);
        setFilteredCities([]);
      } finally {
        setIsLoadingCities(false);
      }
    };

    loadAllCities();
  }, []);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredCities(allCities);
      return;
    }

    const filtered = allCities.filter(city =>
      city.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCities(filtered);
  }, [searchQuery, allCities]);

  const handleCitySearch = (inputValue: string) => {
    setSearchQuery(inputValue);
  };

  const handleCityChange = (newValue: SingleValue<SelectOption>) => {
    setSelectedCity(newValue);
    setValue('city', newValue?.value || '', { shouldValidate: true });
  };

  const handleGenderChange = (selectedValue: string) => {
    setGender(selectedValue as 'male' | 'female');
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
    setValue('comment', e.target.value, { shouldValidate: true });
  };

  const genderOptions = [
    { value: 'female', label: 'Ж' },
    { value: 'male', label: 'М' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Активен' },
    { value: 'blocked', label: 'Заблокирован' }
  ];

  const onSubmit = async (data: any) => {
    setServerError(null);
    setSaveSuccess(false);
    
    try {
      const profileData: Partial<UserProfile> = {
        fullName: data.fullName,
        gender,
        city: selectedCity?.value || '',
        preferredTime: preferredTime || undefined,
        contactInfo,
        visibility,
        comment: data.comment || '',
        status: profileStatus,
      };

      await api.updateProfile(profileData);
      setSaveSuccess(true);
      setIsEditing(false);
      
      // Обновляем локальное состояние профиля
      if (profile) {
        setProfile({
          ...profile,
          ...profileData
        });
      }
      
      // Скрываем сообщение об успехе через 3 секунды
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
      
    } catch (error: any) {
      console.error('Ошибка при сохранении профиля:', error);
      setServerError('Не удалось сохранить изменения. Попробуйте еще раз.');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (profile) {
      reset({
        fullName: profile.fullName,
        city: profile.city,
        comment: profile.comment || '',
      });
      setGender(profile.gender);
      setPreferredTime(profile.preferredTime || '');
      setContactInfo(profile.contactInfo);
      setVisibility(profile.visibility);
      setProfileStatus(profile.status);
      setComment(profile.comment || '');
      
      if (profile.city) {
        const cityOption = allCities.find(city => 
          city.value.includes(profile.city.split(',')[0])
        ) || { value: profile.city, label: profile.city };
        setSelectedCity(cityOption);
      }
    }
    setIsEditing(false);
    setServerError(null);
    setSaveSuccess(false);
  };

  const handleStatusChange = (selectedValue: string) => {
    setProfileStatus(selectedValue as 'active' | 'blocked');
  };

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

  return (
    <div className={styles.profile}>
      <div className={styles.profile__container}>

        {saveSuccess && (
          <div className={styles.profile__success}>
            Изменения успешно сохранены!
          </div>
        )}

        {serverError && (
          <div className={styles.profile__error}>
            {serverError}
          </div>
        )}

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

        <form onSubmit={handleSubmit(onSubmit)} className={styles.profile__form}>
          <div className={styles.profile__section}>
            <h2 className={styles.profile__sectionTitle}>Основная информация</h2>
            
            <Input
              label="ФИО"
              placeholder="Введите ваше полное имя"
              {...register('fullName')}
              error={errors.fullName?.message}
              disabled={!isEditing}
              readOnly={!isEditing}
            />

            <RadioButton
              name="gender"
              label="Пол"
              options={genderOptions}
              selectedValue={gender}
              onChange={handleGenderChange}
              inline={true}
              labelPosition={LabelPosition.TOP}
              disabled={!isEditing}
            />

            <Select
              label="Город проживания"
              options={filteredCities}
              value={selectedCity}
              onChange={handleCityChange}
              onInputChange={handleCitySearch}
              placeholder="Выберите город..."
              isSearchable={true}
              isLoading={isLoadingCities}
              error={errors.city?.message}
              labelPosition={LabelPosition.TOP}
              isDisabled={!isEditing}
            />

            <PreferredTimeInput
              value={preferredTime}
              label='Предпочитаемое время связи'
              onChange={setPreferredTime}
              labelPosition={LabelPosition.TOP}
              isDisabled={!isEditing}
            />
          </div>

          <div className={styles.profile__section}>
            <h2 className={styles.profile__sectionTitle}>Контактная информация</h2>
            <RegistrationTable
              onContactInfoChange={setContactInfo}
              onVisibilityChange={setVisibility}
              contactInfo={contactInfo}
              visibility={visibility}
              disabled={!isEditing}
            />
          </div>

          <div className={styles.profile__section}>
            <h2 className={styles.profile__sectionTitle}>Дополнительно</h2>
            
            <div className={styles.profile__field}>
              <label className={styles.profile__label}>Статус профиля</label>
              <RadioButton
                name="status"
                options={statusOptions}
                selectedValue={profileStatus}
                onChange={handleStatusChange}
                inline={true}
                disabled={!isEditing}
              />
            </div>

            <div className={styles.profile__field}>
              <label className={styles.profile__label}>Комментарий</label>
              <textarea
                className={styles.profile__textarea}
                value={comment}
                onChange={handleCommentChange}
                placeholder="Введите комментарий..."
                disabled={!isEditing}
                maxLength={500}
              />
              {errors.comment?.message && (
                <div className={styles.profile__errorText}>{errors.comment.message}</div>
              )}
              <div className={styles.profile__charCount}>
                {comment.length}/500
              </div>
            </div>
          </div>

          {isEditing && (
            <div className={styles.profile__actions}>
              <Button
                type="button"
                size="large"
                onClick={handleCancel}
                className={styles.profile__cancelButton}
              >
                Отменить
              </Button>
              <Button
                type="submit"
                size="large"
                disabled={isSubmitting || !isDirty}
                className={styles.profile__saveButton}
              >
                {isSubmitting ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Profile;