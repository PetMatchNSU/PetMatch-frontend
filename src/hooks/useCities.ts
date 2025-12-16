/**
 * useCities - хук для работы с городами
 * Загружает список городов по поисковому запросу
 */

import { useState, useCallback, useRef } from 'react';
import { api } from '../services/api';
import type { CityLocation } from '../types/city';

export interface CityOption {
  value: string; // "Новосибирск, Новосибирская область"
  label: string; // "Новосибирск, Новосибирская область"
  city: string; // "Новосибирск"
  region: string; // "Новосибирская область"
}

export const useCities = () => {
  const [cities, setCities] = useState<CityOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Для отмены предыдущего запроса при быстром вводе
  const abortControllerRef = useRef<AbortController | null>(null);

  // Поиск городов по запросу
  const searchCities = useCallback(async (query: string) => {
    // Если запрос пустой, очищаем список
    if (!query || query.trim().length === 0) {
      setCities([]);
      return;
    }

    // Отменяем предыдущий запрос
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.getCities(query.trim());

      const options: CityOption[] = response.locations.map((location: CityLocation) => ({
        value: `${location.city}, ${location.region}`,
        label: `${location.city}, ${location.region}`,
        city: location.city,
        region: location.region,
      }));

      setCities(options);
    } catch (err: any) {
      // Игнорируем ошибки отмены
      if (err?.name === 'AbortError' || err?.name === 'CanceledError') {
        return;
      }
      console.error('Ошибка при загрузке городов:', err);
      setError('Не удалось загрузить список городов');
      setCities([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    cities,
    isLoading,
    error,
    searchCities,
  };
};
