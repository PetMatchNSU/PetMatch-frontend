/**
 * Profile Selectors - селекторы для получения данных профиля из store
 */

import type { RootState } from './index';

export const selectProfile = (state: RootState) => state.profile.profile;
export const selectProfileLoading = (state: RootState) => state.profile.isLoading;
export const selectProfileError = (state: RootState) => state.profile.error;

// Отдельные поля профиля
export const selectFullName = (state: RootState) => state.profile.profile?.fullName;
export const selectGender = (state: RootState) => state.profile.profile?.gender;
export const selectRegion = (state: RootState) => state.profile.profile?.region;
export const selectCity = (state: RootState) => state.profile.profile?.city;
export const selectBondTime = (state: RootState) => state.profile.profile?.bondTime;
export const selectContactInfo = (state: RootState) => state.profile.profile?.contactInfo;
export const selectReviewStatus = (state: RootState) => state.profile.profile?.reviewStatus;
export const selectReviewComment = (state: RootState) => state.profile.profile?.reviewComment;

// Комбинированные селекторы
export const selectCityWithRegion = (state: RootState) => {
  const profile = state.profile.profile;
  if (!profile?.region || !profile?.city) return null;
  return `${profile.region}, ${profile.city}`;
};

export const selectIsProfileBlocked = (state: RootState) =>
  state.profile.profile?.reviewStatus === 'BLOCKED';

export const selectIsProfileOnChecking = (state: RootState) =>
  state.profile.profile?.reviewStatus === 'ON_CHECKING';
