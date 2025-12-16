import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { api } from '../services/api';
import type { 
  CityLocation, 
} from '../types/city';
import type { 
  RegisterRequest, 
  ContactInfo, 
  VisibilitySettings, 
} from '../types/user';
import Input, { LabelPosition } from '../components/Input/Input';
import Button from '../components/Button/Button';
import LinksBlock from '../components/LinksBlock/LinksBlock';
import RadioButton from '../components/RadioButton/RadioButton';
import Select from '../components/Select/Select';
import Checkbox from '../components/Checkbox/Checkbox';
import PreferredTimeInput from '../components/PreferredTimeInput';
import RegistrationTable from '../components/RegistrationTable';
import type { SingleValue } from 'react-select';
import styles from './Registration.module.css';

const schema = yup.object({
  email: yup
    .string()
    .email('Введите корректный email')
    .required('Email обязателен для заполнения'),
  fullName: yup
    .string()
    .required('ФИО обязательно для заполнения')
    .matches(/^[a-zA-Zа-яА-ЯёЁ\s\-']+$/, 'ФИО должно содержать только русские и латинские буквы, пробелы, дефисы и апострофы')
    .test('min-words', 'ФИО должно содержать минимум 2 слова', (value) => {
      if (!value) return false;
      return value.trim().split(/\s+/).length >= 2;
    })
    .test('max-length', 'ФИО не должно превышать 100 символов', (value) => {
      return !value || value.length <= 100;
    }),
  password: yup
    .string()
    .required('Пароль обязателен для заполнения')
    .min(8, 'Пароль должен содержать минимум 8 символов')
    .max(50, 'Пароль не должен превышать 50 символов')
    .matches(/[A-Z]/, 'Пароль должен содержать хотя бы одну заглавную букву')
    .matches(/[a-z]/, 'Пароль должен содержать хотя бы одну строчную букву')
    .matches(/\d/, 'Пароль должен содержать хотя бы одну цифру')
    .matches(/^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]*$/, 'Пароль содержит недопустимые символы'),
  confirmPassword: yup
    .string()
    .required('Подтверждение пароля обязательно')
    .oneOf([yup.ref('password')], 'Пароли должны совпадать'),
  agreedToTerms: yup
    .boolean()
    .oneOf([true], 'Вы должны согласиться с условиями использования'),
  city: yup
    .string()
    .required('Город обязателен для заполнения'),
}).required();

interface SelectOption {
  value: string;
  label: string;
}

const Registration: React.FC = () => {
  const {
    register,
    handleSubmit,
    watch,
    trigger,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const [isFormValid, setIsFormValid] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [selectedCity, setSelectedCity] = useState<SingleValue<SelectOption>>(null);
  const [preferredTime, setPreferredTime] = useState<string>('');
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);
  const [isLoadingCities, setIsLoadingCities] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [allCities, setAllCities] = useState<SelectOption[]>([]);
  const [filteredCities, setFilteredCities] = useState<SelectOption[]>([]);
  
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

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      const hasRequiredFields = 
        formData?.email && 
        formData?.fullName && 
        formData?.password && 
        formData?.confirmPassword && 
        selectedCity && 
        agreedToTerms;

      if (hasRequiredFields) {
        const result = await trigger(undefined, { shouldFocus: false });
        setIsFormValid(result);
      } else {
        setIsFormValid(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [formData, selectedCity, agreedToTerms, trigger]);

  const handleCityChange = (newValue: SingleValue<SelectOption>) => {
    setSelectedCity(newValue);
    setValue('city', newValue?.value || '', { shouldValidate: true });
  };

  const handleGenderChange = (selectedValue: string) => {
    setGender(selectedValue as 'male' | 'female');
  };

  const genderOptions = [
    { value: 'female', label: 'Ж' },
    { value: 'male', label: 'М' }
  ];

  const onSubmit = async (data: any) => {
    setServerError(null);
    
    try {

      const registrationData: RegisterRequest = {
        email: data.email,
        fullName: data.fullName,
        password: data.password,
        gender,
        city: selectedCity?.value || '',
        preferredTime: preferredTime || undefined,
        contactInfo,
        visibility,
      };

      const result = await api.registerUser(registrationData);
      setRegistrationSuccess(true);
      
    } catch (error: any) {
      if (error.response?.status === 409) {
        setServerError('Пользователь с такой почтой уже существует');
      } else {
        setServerError('Сервис временно недоступен, приносим извинения за неудобства');
      }
    }
  };

  if (registrationSuccess) {
    return (
      <div className={styles.registration}>
        <div className={styles.registration__container}>
          <div className={styles.registration__success}>
            <h1 className={styles.registration__title}>Регистрация</h1>
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
          <Input
            label="Email"
            type="email"
            placeholder="Введите ваш email"
            {...register('email')}
            error={errors.email?.message}
          />

          <Input
            label="ФИО"
            placeholder="Введите ваше полное имя"
            {...register('fullName')}
            error={errors.fullName?.message}
          />

          <RadioButton
              name="petType"
              label="Пол"
              options={genderOptions}
              selectedValue={gender}
              onChange={handleGenderChange}
              inline={true}
              labelPosition={LabelPosition.TOP}
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
          />

          <PreferredTimeInput
            value={preferredTime}
            label='Предпочитаемое время связи'
            onChange={setPreferredTime}
            labelPosition={LabelPosition.TOP}
          />
          <RegistrationTable
            onContactInfoChange={setContactInfo}
            onVisibilityChange={setVisibility}
            contactInfo={contactInfo}
            visibility={visibility}
          />

          <Input
            label="Пароль"
            type="password"
            placeholder="Введите пароль"
            {...register('password')}
            error={errors.password?.message}
          />

          <Input
            label="Подтверждение пароля"
            type="password"
            placeholder="Повторите пароль"
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
          />

          <Checkbox 
            label={
              <LinksBlock 
                title="Согласен с условием пользования"
                links={[
                    { text: "Пользовательское соглашение", to: "/terms/tos" },
                    { text: "Политика обработки персональных данных", to: "/terms/toa" }
                ]}
                />
            }
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            error={errors.agreedToTerms?.message}
          />

          <Button
            type="submit"
            size="large"
            disabled={!isFormValid || isSubmitting}
            className={styles.registration__submit}
          >
            {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
          </Button>

          <div className={styles.registration__login}>
            <LinksBlock 
              title="Уже есть аккаунт?"
              links={[
                { text: "Войти", to: "/login" }
              ]}
              layout = 'horizontal'
            />
          </div>
        </form>
    </div>
    </div>
  );
};

export default Registration;