/**
 * Profile Slice - управление состоянием профиля пользователя
 */

import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { UserProfileResponse, BondTime, ContactInfoItem, Gender, ReviewStatus } from '../types/user';

interface ProfileState {
  profile: UserProfileResponse | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  profile: null,
  isLoading: false,
  error: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    // Установить профиль
    setProfile: (state, action: PayloadAction<UserProfileResponse>) => {
      state.profile = action.payload;
      state.error = null;
    },

    // Обновить профиль частично
    updateProfile: (state, action: PayloadAction<Partial<UserProfileResponse>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },

    // Установить статус загрузки
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Установить ошибку
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Очистить профиль
    clearProfile: (state) => {
      state.profile = null;
      state.error = null;
    },

    // Обновить ФИО
    setFullName: (state, action: PayloadAction<string>) => {
      if (state.profile) {
        state.profile.fullName = action.payload;
      }
    },

    // Обновить пол
    setGender: (state, action: PayloadAction<Gender>) => {
      if (state.profile) {
        state.profile.gender = action.payload;
      }
    },

    // Обновить город
    setCity: (state, action: PayloadAction<{ region: string; city: string }>) => {
      if (state.profile) {
        state.profile.region = action.payload.region;
        state.profile.city = action.payload.city;
      }
    },

    // Обновить время связи
    setBondTime: (state, action: PayloadAction<BondTime[]>) => {
      if (state.profile) {
        state.profile.bondTime = action.payload;
      }
    },

    // Обновить контакты
    setContactInfo: (state, action: PayloadAction<ContactInfoItem[]>) => {
      if (state.profile) {
        state.profile.contactInfo = action.payload;
      }
    },

    // Обновить статус проверки
    setReviewStatus: (state, action: PayloadAction<{ status: ReviewStatus; comment?: string }>) => {
      if (state.profile) {
        state.profile.reviewStatus = action.payload.status;
        state.profile.reviewComment = action.payload.comment;
      }
    },
  },
});

export const {
  setProfile,
  updateProfile,
  setLoading,
  setError,
  clearProfile,
  setFullName,
  setGender,
  setCity,
  setBondTime,
  setContactInfo,
  setReviewStatus,
} = profileSlice.actions;

export default profileSlice.reducer;
