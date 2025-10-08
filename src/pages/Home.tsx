import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { fetchHello, selectHelloResponse, selectHelloLoading, selectHelloError } from '../store/helloSlice';
import type { AppDispatch } from '../store';
import Input, { LabelPosition } from '../components/Input';
import Button from '../components/Button';
import RadioButton from '../components/RadioButton';
import axios from 'axios';
import styles from './Home.module.css';

// Define the form schema with Yup
const schema = yup.object({
  textInput: yup.string().required('Text input is required').min(3, 'Must be at least 3 characters'),
  emailInput: yup.string().email('Invalid email').required('Email is required'),
  textareaInput: yup.string().required('Message is required').min(10, 'Message must be at least 10 characters'),
  passwordInput: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
}).required();

const Home: React.FC = () => {
  const helloResponse = useSelector(selectHelloResponse);
  const loading = useSelector(selectHelloLoading);
  const error = useSelector(selectHelloError);
  const dispatch: AppDispatch = useDispatch();

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onBlur', // Errors appear only on blur
    reValidateMode: 'onBlur',
  });

  // Watch all form fields for changes
  const formData = watch();

  // Track form validity separately from error display
  const [isFormValid, setIsFormValid] = React.useState(false);
  
  // State for RadioButton example
  const [selectedPetType, setSelectedPetType] = React.useState<string>('dog');

  // Validate form silently (without showing errors)
  React.useEffect(() => {
    // Debounce validation to prevent infinite loops
    const timeoutId = setTimeout(async () => {
      // Only validate when all fields have values
      if (formData.textInput && formData.emailInput && formData.textareaInput && formData.passwordInput) {
        // Temporarily disable error reporting
        const result = await trigger(undefined, { shouldFocus: false });
        setIsFormValid(result);
      } else {
        setIsFormValid(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [formData, trigger]);

  const handleHelloClick = () => {
    dispatch(fetchHello());
  };

  const onSubmit = async (data: any) => {
    try {
      const host = import.meta.env.VITE_API_HOST || 'http://localhost:3000';
      const response = await axios.post(`${host}/test`, data);
      console.log('Form submitted successfully:', response.data);
      // You can add success handling here, such as showing a success message
    } catch (error) {
      console.error('Form submission failed:', error);
      // You can add error handling here, such as showing an error message
    }
  };

  // RadioButton options for pet types
  const petTypeOptions = [
    { value: 'dog', label: 'Dog' },
    { value: 'cat', label: 'Cat' },
    { value: 'bird', label: 'Bird' },
    { value: 'fish', label: 'Fish' },
  ];

  return (
    <div className={styles.home}>
      <div className={styles.home__header}>
        <h1 className={styles.home__title}>Welcome to PetMatch</h1>
        <p className={styles.home__subtitle}>Find your perfect pet companion!</p>
      </div>
      
      {/* Hello Button Section */}
      <div className={styles.home__section}>
        <div>
          <h5 className={styles['home__section-title']}>Hello API Test</h5>
          <button
            className={`${styles.home__button} ${styles['home__button--primary']}`}
            onClick={handleHelloClick}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'hello'}
          </button>
          
          {helloResponse && (
            <div className={styles['home__response']}>
              <h6 className={styles['home__response-title']}>Response:</h6>
              <pre>{helloResponse}</pre>
            </div>
          )}
          
          {error && (
            <div className={styles['home__error']}>
              Error: {error}
            </div>
          )}
        </div>
      </div>

      {/* Input Component Examples with Validation */}
      <div className={`${styles.home__section} ${styles['home__section--input-examples']}`}>
        <div>
          <h5 className={styles['home__section-title']}>Input Component Examples with Validation</h5>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Text Input (Top)"
              placeholder="Enter some text (min 3 characters)"
              {...register('textInput')}
              error={errors.textInput?.message}
            />
            
            <Input
              label="Email Input (Left)"
              type="email"
              placeholder="Enter your email"
              {...register('emailInput')}
              error={errors.emailInput?.message}
              labelPosition={LabelPosition.LEFT}
            />
            
            <Input
              label="Textarea (Top)"
              type="textarea"
              placeholder="Enter a message (min 10 characters)"
              {...register('textareaInput')}
              error={errors.textareaInput?.message}
            />
            
            <Input
              label="Password (Left)"
              type="password"
              placeholder="Enter password (min 6 characters)"
              {...register('passwordInput')}
              error={errors.passwordInput?.message}
              labelPosition={LabelPosition.LEFT}
            />
            
            {/* RadioButton Example */}
            <RadioButton
              name="petType"
              label="Preferred Pet Type"
              options={petTypeOptions}
              selectedValue={selectedPetType}
              onChange={setSelectedPetType}
              inline={true}
              labelPosition="left"
            />
            
            <Button
              type="submit"
              size="large"
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Зарегистрироваться'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Home;