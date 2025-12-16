/**
 * Registration Page - страница регистрации
 *
 * Функционал:
 * - Регистрация по email и паролю
 * - Заполнение профиля (ФИО, пол, город, время связи, контакты)
 * - Валидация всех полей
 * - Обработка ошибок сервера
 * - Показ сообщения о необходимости подтверждения email
 */

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import type { SingleValue } from 'react-select';
import { useAuth } from '../hooks/useAuth';
import { useCities, type CityOption } from '../hooks/useCities';
import { registrationSchema } from '../validation/registrationSchema';
import type { RegisterRequest, BondTime, ContactInfo } from '../types/auth';
import Input from '../components/Input/Input';
import Button from '../components/Button/Button';
import LinksBlock from '../components/LinksBlock/LinksBlock';
import RadioButton from '../components/RadioButton/RadioButton';
import Select from '../components/Select/Select';
import Checkbox from '../components/Checkbox/Checkbox';
import PreferredTimeInput from '../components/PreferredTimeInput';
import RegistrationTable from '../components/RegistrationTable';
import styles from './Registration.module.css';

export const Registration: React.FC = () => {
  const { register: registerUser, isRegisterLoading } = useAuth();
  const { cities, isLoading: isLoadingCities, searchCities } = useCities();

  const [serverError, setServerError] = useState<string | null>(null);
  const [showEmailVerification, setShowEmailVerification] = useState(false);

  // Локальное состояние для полей, не управляемых react-hook-form
  const [selectedCity, setSelectedCity] = useState<SingleValue<CityOption>>(null);
  const [cityInputValue, setCityInputValue] = useState('');
  const [bondTime, setBondTime] = useState<BondTime[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo[]>([]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(registrationSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
      firstName: '',
      secondName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
      gender: 'M' as 'M' | 'F',
      city: '',
      region: '',
      bondTime: [],
      contactInfo: [],
      agreedToTerms: false,
    },
  });

  const genderValue = watch('gender');

  const onSubmit = async (data: any) => {
    setServerError(null);
    setShowEmailVerification(false);

    // Формируем данные для отправки
    const registrationData: RegisterRequest = {
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      secondName: data.secondName,
      lastName: data.lastName,
      gender: data.gender,
      region: data.region,
      city: data.city,
      bondTime: data.bondTime,
      contactInfo: data.contactInfo,
    };

    const result = await registerUser(registrationData);

    if (!result.success) {
      setServerError(result.error || 'Ошибка регистрации');
      return;
    }

    // Показываем сообщение о необходимости подтверждения email
    setShowEmailVerification(true);
  };

  // Обработчик изменения города
  const handleCityChange = (newValue: SingleValue<CityOption>) => {
    setSelectedCity(newValue);
    setCityInputValue(''); // Сбрасываем инпут при выборе
    if (newValue) {
      setValue('city', newValue.city, { shouldValidate: true });
      setValue('region', newValue.region, { shouldValidate: true });
    } else {
      setValue('city', '', { shouldValidate: true });
      setValue('region', '', { shouldValidate: true });
    }
  };

  // Обработчик изменения времени связи
  const handleBondTimeChange = (times: BondTime[]) => {
    setBondTime(times);
    setValue('bondTime', times, { shouldValidate: true });
  };

  // Обработчик изменения контактной информации
  const handleContactInfoChange = (contacts: ContactInfo[]) => {
    setContactInfo(contacts);
    setValue('contactInfo', contacts, { shouldValidate: true });
  };

  // Показываем сообщение о необходимости подтверждения email
  if (showEmailVerification) {
    return (
      <div className={styles.registration}>
        <div className={styles.registration__container}>
          <div className={styles.registration__verification}>
            <h1 className={styles.registration__title}>Подтвердите email</h1>
            <div className={styles.registration__message}>
              Пройдите по ссылке в отправленном письме для подтверждения почты.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.registration}>
      <div className={styles.registration__container}>
        {serverError && (
          <div className={styles.registration__error}>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className={styles.registration__form}>
          <h1>Регистрация</h1>

          {/* Email */}
          <Input
            label="Email"
            type="email"
            placeholder="Введите ваш email"
            {...register('email')}
            error={errors.email?.message}
          />

          {/* ФИО */}
          <Input
            label="Имя"
            type="text"
            placeholder="Введите ваше имя"
            {...register('firstName')}
            error={errors.firstName?.message}
          />

          <Input
            label="Фамилия"
            type="text"
            placeholder="Введите вашу фамилию"
            {...register('secondName')}
            error={errors.secondName?.message}
          />

          <Input
            label="Отчество"
            type="text"
            placeholder="Введите ваше отчество"
            {...register('lastName')}
            error={errors.lastName?.message}
          />

          {/* Пол */}
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <RadioButton
                label="Пол"
                name='Пол'
                options={[
                  { value: 'M', label: 'М' },
                  { value: 'F', label: 'Ж' },
                ]}
                selectedValue={field.value}
                onChange={field.onChange}
              />
            )}
          />

          {/* Город проживания */}
          <Select
            label="Город проживания"
            options={cities}
            value={selectedCity}
            inputValue={cityInputValue}
            onChange={handleCityChange}
            onInputChange={(value, actionMeta) => {
              if (actionMeta.action === 'input-change') {
                setCityInputValue(value);
                searchCities(value);
              }
            }}
            filterOption={() => true}
            isLoading={isLoadingCities}
            placeholder="Начните вводить название города"
            error={errors.city?.message || errors.region?.message}
          />

          {/* Предпочитаемое время связи */}
          <PreferredTimeInput
            value={bondTime}
            onChange={handleBondTimeChange}
            error={errors.bondTime?.message}
          />

          {/* Способы связи */}
          <RegistrationTable
            contactInfo={contactInfo}
            onChange={handleContactInfoChange}
            error={errors.contactInfo?.message}
          />

          {/* Пароль */}
          <Input
            label="Пароль"
            type="password"
            placeholder="Введите пароль"
            {...register('password')}
            error={errors.password?.message}
          />

          {/* Подтверждение пароля */}
          <Input
            label="Подтверждение пароля"
            type="password"
            placeholder="Повторите пароль"
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
          />

          {/* Согласие с условиями */}
          <Controller
            name="agreedToTerms"
            control={control}
            render={({ field }) => (
              <Checkbox
                label={
                  <span>
                    Я согласен с{' '}
                    <a href="/terms/tos" target="_blank" rel="noopener noreferrer">
                      Пользовательским соглашением
                    </a>{' '}
                    и{' '}
                    <a href="/terms/toa" target="_blank" rel="noopener noreferrer">
                      Политикой обработки персональных данных
                    </a>
                  </span>
                }
                checked={field.value}
                onChange={field.onChange}
                error={errors.agreedToTerms?.message}
              />
            )}
          />

          {/* Кнопка регистрации */}
          <Button
            type="submit"
            size="large"
            disabled={!isValid || isRegisterLoading}
            className={styles.registration__submit}
          >
            {isRegisterLoading ? 'Регистрация...' : 'Зарегистрироваться'}
          </Button>

          {/* Ссылка на авторизацию */}
          <div className={styles.registration__login}>
            <LinksBlock
              title="Уже есть аккаунт?"
              links={[
                { text: 'Войти', to: '/login' }
              ]}
              layout="horizontal"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

// export default Registration;
