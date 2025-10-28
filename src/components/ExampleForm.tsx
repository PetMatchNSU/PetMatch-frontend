import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Select from './Select/Select';
import type { SingleValue, MultiValue } from 'react-select';

// Define the form schema with Yup
const schema = yup.object({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  email: yup.string().email('Invalid email').required('Email is required'),
  age: yup.number().positive('Age must be positive').integer('Age must be an integer').required('Age is required'),
  country: yup.string().required('Country is required'),
  city: yup.string().required('City is required'),
}).required();

interface SelectOption {
  value: string;
  label: string;
}

type FormData = yup.InferType<typeof schema>;

const ExampleForm: React.FC = () => {
  const [country, setCountry] = useState<SingleValue<SelectOption> | MultiValue<SelectOption>>(null);
  const [city, setCity] = useState<SingleValue<SelectOption> | MultiValue<SelectOption>>(null);
  const [searchableCity, setSearchableCity] = useState<SingleValue<SelectOption> | MultiValue<SelectOption>>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  // Sample data for select options
  const countryOptions: SelectOption[] = [
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'de', label: 'Germany' },
    { value: 'fr', label: 'France' },
  ];

  const cityOptions: SelectOption[] = [
    { value: 'ny', label: 'New York' },
    { value: 'la', label: 'Los Angeles' },
    { value: 'ch', label: 'Chicago' },
    { value: 'to', label: 'Toronto' },
    { value: 'va', label: 'Vancouver' },
    { value: 'lo', label: 'London' },
    { value: 'pa', label: 'Paris' },
    { value: 'be', label: 'Berlin' },
  ];

  const onSubmit = (data: FormData) => {
    console.log({
      ...data,
      country: (country as SingleValue<SelectOption>)?.value,
      city: (city as SingleValue<SelectOption>)?.value,
      searchableCity: (searchableCity as SingleValue<SelectOption>)?.value
    });
    // Handle form submission
  };

  return (
    <div className="container">
      <h2>Example Form</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Name</label>
          <input
            id="name"
            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
            {...register('name')}
          />
          {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
        </div>

        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            id="email"
            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
            {...register('email')}
          />
          {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
        </div>

        <div className="mb-3">
          <label htmlFor="age" className="form-label">Age</label>
          <input
            type="number"
            id="age"
            className={`form-control ${errors.age ? 'is-invalid' : ''}`}
            {...register('age', { valueAsNumber: true })}
          />
          {errors.age && <div className="invalid-feedback">{errors.age.message}</div>}
        </div>

        {/* Regular Select */}
        <div className="mb-3">
          <Select
            label="Country"
            options={countryOptions}
            value={country}
            onChange={setCountry}
            error={errors.country?.message}
            placeholder="Select a country"
          />
        </div>

        {/* Select with search */}
        <div className="mb-3">
          <Select
            label="City (with search)"
            options={cityOptions}
            value={searchableCity}
            onChange={setSearchableCity}
            error={errors.city?.message}
            placeholder="Select a city"
            isSearchable={true}
          />
        </div>

        {/* Horizontal label positioning */}
        <div className="mb-3">
          <Select
            label="City"
            options={cityOptions}
            value={city}
            onChange={setCity}
            error={errors.city?.message}
            placeholder="Select a city"
            labelPosition="left"
          />
        </div>

        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
};

export default ExampleForm;