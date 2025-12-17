import React, { useState, useEffect } from 'react';
import styles from './PreferredTimeInput.module.css';
import type { BondTime } from '../../types/auth';

export const LabelPosition = {
  TOP: 'top',
  LEFT: 'left',
} as const;

type LabelPositionType = typeof LabelPosition[keyof typeof LabelPosition];

interface TimeSlot {
  bondTimeStart: string;
  bondTimeEnd: string;
  error?: string;
}

interface PreferredTimeInputProps {
  label?: string;
  value?: BondTime[];
  labelPosition?: LabelPositionType;
  onChange?: (value: BondTime[]) => void;
  error?: string;
}

const MAX_INTERVALS = 4;

const PreferredTimeInput: React.FC<PreferredTimeInputProps> = ({
  label = 'Предпочитаемое время связи',
  labelPosition = LabelPosition.TOP,
  value = [],
  onChange,
  error
}) => {
  const [slots, setSlots] = useState<TimeSlot[]>([{ bondTimeStart: '', bondTimeEnd: '' }]);

  // Синхронизация с входящим value
  useEffect(() => {
    if (value && value.length > 0) {
      const newSlots = value.map((v) => ({
        bondTimeStart: v.bondTimeStart || '',
        bondTimeEnd: v.bondTimeEnd || '',
      }));
      setSlots(newSlots);
    }
  }, []);

  // Форматирование времени (HH:MM)
  const formatTime = (val: string): string => {
    if (!val) return '';
    const digits = val.replace(/\D/g, '');
    const cleanValue = digits.substring(0, 4);

    if (cleanValue.length >= 3) {
      const hours = cleanValue.substring(0, 2);
      const minutes = cleanValue.substring(2, 4);
      return `${hours}:${minutes}`;
    } else if (cleanValue.length > 0) {
      return cleanValue;
    }
    return '';
  };

  // Проверка валидности времени (HH:MM)
  const isValidTime = (time: string): boolean => {
    if (!time || time.length !== 5) return false;
    const [hours, minutes] = time.split(':').map(Number);
    return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
  };

  // Сравнение времени: возвращает true если start <= end
  const isStartBeforeEnd = (start: string, end: string): boolean => {
    if (!isValidTime(start) || !isValidTime(end)) return true;
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    return startH < endH || (startH === endH && startM <= endM);
  };

  // Проверка заполненности слота
  const isSlotComplete = (slot: TimeSlot): boolean => {
    return isValidTime(slot.bondTimeStart) && isValidTime(slot.bondTimeEnd);
  };

  // Обновление слотов и вызов onChange
  const updateSlots = (newSlots: TimeSlot[]) => {
    // Валидация каждого слота
    const validatedSlots = newSlots.map((slot) => {
      if (isValidTime(slot.bondTimeStart) && isValidTime(slot.bondTimeEnd)) {
        if (!isStartBeforeEnd(slot.bondTimeStart, slot.bondTimeEnd)) {
          return { ...slot, error: 'Время "с" должно быть раньше времени "по"' };
        }
      }
      return { ...slot, error: undefined };
    });

    // Удаляем пустые слоты в конце (кроме первого)
    let trimmedSlots = [...validatedSlots];
    while (
      trimmedSlots.length > 1 &&
      !trimmedSlots[trimmedSlots.length - 1].bondTimeStart &&
      !trimmedSlots[trimmedSlots.length - 1].bondTimeEnd
    ) {
      trimmedSlots.pop();
    }

    // Добавляем новый слот если последний заполнен и не достигнут лимит
    const lastSlot = trimmedSlots[trimmedSlots.length - 1];
    if (isSlotComplete(lastSlot) && !lastSlot.error && trimmedSlots.length < MAX_INTERVALS) {
      trimmedSlots.push({ bondTimeStart: '', bondTimeEnd: '', error: undefined });
    }

    setSlots(trimmedSlots);

    // Вызываем onChange только с полностью заполненными валидными слотами
    if (onChange) {
      const validSlots = trimmedSlots
        .filter((slot) => isSlotComplete(slot) && !slot.error)
        .map(({ bondTimeStart, bondTimeEnd }) => ({ bondTimeStart, bondTimeEnd }));
      onChange(validSlots);
    }
  };

  // Обработчик изменения времени
  const handleTimeChange = (index: number, field: 'bondTimeStart' | 'bondTimeEnd', val: string) => {
    const formattedValue = formatTime(val);
    const newSlots = [...slots];
    newSlots[index] = { ...newSlots[index], [field]: formattedValue };
    updateSlots(newSlots);
  };

  // Удаление интервала
  const handleRemoveSlot = (index: number) => {
    if (slots.length === 1) {
      // Если это единственный слот, просто очищаем его
      updateSlots([{ bondTimeStart: '', bondTimeEnd: '' }]);
    } else {
      const newSlots = slots.filter((_, i) => i !== index);
      updateSlots(newSlots);
    }
  };

  return (
    <div className={`${styles['preferred-time-input']} ${styles[`preferred-time-input--${labelPosition}`]}`}>
      <div className={styles['preferred-time-input__container']}>
        {label && (
          <label className={`${styles['preferred-time-input__label']} ${styles[`preferred-time-input__label--${labelPosition}`]}`}>
            {label}
          </label>
        )}

        <div className={styles['preferred-time-input__slots']}>
          {slots.map((slot, index) => (
            <div key={index} className={styles['preferred-time-input__slot']}>
              <div className={styles['preferred-time-input__wrapper']}>
                <div className={styles['preferred-time-input__first-half']}>
                  <span className={styles['preferred-time-input__prefix']}>с</span>
                  <div className={styles['preferred-time-input__time-wrapper']}>
                    <input
                      type="text"
                      value={slot.bondTimeStart}
                      onChange={(e) => handleTimeChange(index, 'bondTimeStart', e.target.value)}
                      placeholder="__:__"
                      maxLength={5}
                      className={`${styles['preferred-time-input__time']} ${slot.error ? styles['preferred-time-input__time--error'] : ''}`}
                    />
                  </div>
                </div>

                <div className={styles['preferred-time-input__second-half']}>
                  <span className={styles['preferred-time-input__separator']}>по</span>
                  <div className={styles['preferred-time-input__time-wrapper']}>
                    <input
                      type="text"
                      value={slot.bondTimeEnd}
                      onChange={(e) => handleTimeChange(index, 'bondTimeEnd', e.target.value)}
                      placeholder="__:__"
                      maxLength={5}
                      className={`${styles['preferred-time-input__time']} ${slot.error ? styles['preferred-time-input__time--error'] : ''}`}
                    />
                  </div>
                </div>

                {(slots.length > 1 || slot.bondTimeStart || slot.bondTimeEnd) && (
                  <button
                    type="button"
                    className={styles['preferred-time-input__remove']}
                    onClick={() => handleRemoveSlot(index)}
                    aria-label="Удалить интервал"
                  >
                    ×
                  </button>
                )}
              </div>
              {slot.error && <div className={styles['preferred-time-input__slot-error']}>{slot.error}</div>}
            </div>
          ))}
        </div>
      </div>

      {error && <div className={styles['preferred-time-input__error']}>{error}</div>}
    </div>
  );
};

export default PreferredTimeInput;
