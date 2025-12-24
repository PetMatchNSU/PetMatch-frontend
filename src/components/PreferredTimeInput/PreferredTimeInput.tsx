import React, { useState, useEffect, useRef } from 'react';
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
  isDisabled?: boolean;
}

interface PreferredTimeInputProps {
  label?: string;
  value?: BondTime[];
  labelPosition?: LabelPositionType;
  onChange?: (value: BondTime[], isValid: boolean) => void;
  error?: string;
  /** Отключить редактирование */
  disabled?: boolean;
  /** Режим только просмотра */
  viewMode?: boolean;
}

const MAX_INTERVALS = 4;

// Нормализация времени: "HH:mm:ss" -> "HH:mm"
const normalizeTime = (time: string): string => {
  if (!time) return '';
  // Если формат HH:mm:ss, обрезаем секунды
  if (time.length === 8 && time.split(':').length === 3) {
    return time.substring(0, 5);
  }
  return time;
};

const PreferredTimeInput: React.FC<PreferredTimeInputProps> = ({
  label = 'Предпочитаемое время связи',
  labelPosition = LabelPosition.TOP,
  value = [],
  onChange,
  error,
  disabled = false,
  viewMode = false,
}) => {
  const [slots, setSlots] = useState<TimeSlot[]>([{ bondTimeStart: '', bondTimeEnd: '' }]);
  const prevViewModeRef = useRef(viewMode);
  const isInitialMount = useRef(true);

  // Синхронизация с входящим value только при:
  // 1. Первоначальной загрузке (если есть данные)
  // 2. Переходе из режима просмотра в режим редактирования
  useEffect(() => {
    const wasViewMode = prevViewModeRef.current;
    prevViewModeRef.current = viewMode;

    // Синхронизируем при первой загрузке или при переходе viewMode: true -> false
    const shouldSync = isInitialMount.current || (wasViewMode && !viewMode);
    isInitialMount.current = false;

    if (!shouldSync) return;

    if (value && value.length > 0) {
      const newSlots: TimeSlot[] = value.map((v) => ({
        bondTimeStart: normalizeTime(v.bondTimeStart),
        bondTimeEnd: normalizeTime(v.bondTimeEnd),
      }));
      // Добавляем пустой слот для ввода нового интервала (если не достигнут лимит)
      if (!viewMode && newSlots.length < MAX_INTERVALS) {
        newSlots.push({ bondTimeStart: '', bondTimeEnd: '' });
      }
      setSlots(newSlots);
    } else if (!viewMode) {
      // В режиме редактирования без значений - показываем пустой слот
      setSlots([{ bondTimeStart: '', bondTimeEnd: '' }]);
    }
  }, [value, viewMode]);

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

  // Преобразование времени в минуты для сравнения
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Проверка пересечения двух интервалов
  const doIntervalsOverlap = (
    slot1: TimeSlot,
    slot2: TimeSlot
  ): boolean => {
    if (!isSlotComplete(slot1) || !isSlotComplete(slot2)) return false;

    const start1 = timeToMinutes(slot1.bondTimeStart);
    const end1 = timeToMinutes(slot1.bondTimeEnd);
    const start2 = timeToMinutes(slot2.bondTimeStart);
    const end2 = timeToMinutes(slot2.bondTimeEnd);

    // Интервалы пересекаются если один начинается до окончания другого
    return start1 < end2 && start2 < end1;
  };

  // Проверка пересечения слота с другими слотами
  const findOverlappingSlotIndex = (slots: TimeSlot[], currentIndex: number): number | null => {
    const currentSlot = slots[currentIndex];
    if (!isSlotComplete(currentSlot)) return null;

    for (let i = 0; i < slots.length; i++) {
      if (i === currentIndex) continue;
      if (doIntervalsOverlap(currentSlot, slots[i])) {
        return i;
      }
    }
    return null;
  };

  // Проверка заполненности слота
  const isSlotComplete = (slot: TimeSlot): boolean => {
    return isValidTime(slot.bondTimeStart) && isValidTime(slot.bondTimeEnd);
  };

  // Обновление слотов и вызов onChange
  const updateSlots = (newSlots: TimeSlot[]) => {
    // Первый проход: базовая валидация (start < end)
    const validatedSlots = newSlots.map((slot) => {
      if (isValidTime(slot.bondTimeStart) && isValidTime(slot.bondTimeEnd)) {
        if (!isStartBeforeEnd(slot.bondTimeStart, slot.bondTimeEnd)) {
          return { ...slot, error: 'Время "с" должно быть раньше времени "по"' };
        }
      }
      return { ...slot, error: undefined };
    });

    // Второй проход: проверка на пересечения интервалов
    for (let i = 0; i < validatedSlots.length; i++) {
      // Пропускаем слоты с уже существующими ошибками или неполные слоты
      if (validatedSlots[i].error || !isSlotComplete(validatedSlots[i])) continue;

      const overlappingIndex = findOverlappingSlotIndex(validatedSlots, i);
      if (overlappingIndex !== null) {
        // Помечаем оба пересекающихся слота ошибкой
        validatedSlots[i] = { ...validatedSlots[i], error: 'Интервалы пересекаются' };
        if (!validatedSlots[overlappingIndex].error) {
          validatedSlots[overlappingIndex] = { ...validatedSlots[overlappingIndex], error: 'Интервалы пересекаются' };
        }
      }
    }

    // Удаляем пустые слоты в конце (кроме первого)
    const trimmedSlots = [...validatedSlots];
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

      // Проверяем есть ли ошибки в заполненных слотах
      const hasErrors = trimmedSlots.some((slot) => isSlotComplete(slot) && slot.error);
      const isFormValid = validSlots.length > 0 && !hasErrors;

      onChange(validSlots, isFormValid);
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

  const isInputDisabled = disabled || viewMode;

  // Форматирование для режима просмотра
  const formatViewValue = (start: string, end: string): string => {
    const normalizedStart = normalizeTime(start);
    const normalizedEnd = normalizeTime(end);
    if (!normalizedStart && !normalizedEnd) return '-';
    return `С ${normalizedStart || '--:--'} по ${normalizedEnd || '--:--'}`;
  };

  return (
    <div className={`${styles['preferred-time-input']} ${styles[`preferred-time-input--${labelPosition}`]}`}>
      <div className={styles['preferred-time-input__container']}>
        {label && (
          <label className={`${styles['preferred-time-input__label']} ${styles[`preferred-time-input__label--${labelPosition}`]}`}>
            {label}
          </label>
        )}

        {viewMode ? (
          <div className={styles['preferred-time-input__view-list']}>
            {value && value.length > 0 ? (
              value.map((slot, index) => (
                <div key={index} className={styles['preferred-time-input__view-item']}>
                  {formatViewValue(slot.bondTimeStart, slot.bondTimeEnd)}
                </div>
              ))
            ) : (
              <div className={styles['preferred-time-input__view-item']}>Не указано</div>
            )}
          </div>
        ) : (
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
                        disabled={isInputDisabled}
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
                        disabled={isInputDisabled}
                      />
                    </div>
                  </div>

                  {!isInputDisabled && (slots.length > 1 || slot.bondTimeStart || slot.bondTimeEnd) && (
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
        )}
      </div>

      {error && <div className={styles['preferred-time-input__error']}>{error}</div>}
    </div>
  );
};

export default PreferredTimeInput;
