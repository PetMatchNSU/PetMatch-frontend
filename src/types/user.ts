/**
 * Типы для профиля пользователя и связанных API
 */

// Базовые типы
export type Gender = 'M' | 'F';
export type ReviewStatus = 'ON_CHECKING' | 'OK' | 'BLOCKED';
export type ContactType = 'PHONE' | 'EMAIL' | 'TELEGRAM' | 'VK';

// Время связи
export interface BondTime {
  bondTimeStart: string; // HH:mm
  bondTimeEnd: string;   // HH:mm
}

// Контактная информация
export interface ContactInfoItem {
  type: ContactType;
  contact: string;
  visible: boolean;
}

// GET /api/v1/user - ответ
export interface UserProfileResponse {
  fullName: string;
  gender: Gender;
  region: string;
  city: string;
  bondTime: BondTime[];
  contactInfo: ContactInfoItem[];
  reviewStatus: ReviewStatus;
  reviewComment?: string;
}

// PUT /api/v1/user - запрос
export interface UpdateUserRequest {
  firstName: string;
  secondName: string;
  middleName: string;
  gender: Gender;
  region: string;
  city: string;
  bondTime: BondTime[];
  contactInfo: ContactInfoItem[];
}

// GET /api/v1/city - ответ
export interface CityLocation {
  region: string;
  city: string;
}

export interface CitiesResponse {
  locations: CityLocation[];
}

// GET /api/v1/user/contacts - ответ
export interface UserContactsResponse {
  contactInfo: Array<{
    type: ContactType;
    contact: string;
  }>;
}

// Для совместимости с auth типами
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    emailVerified: boolean;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface VerifyEmailRequest {
  code: string;
}

// Legacy types for api.ts compatibility
// TODO: Remove after migrating api.ts to RTK Query

export interface RegisterRequest {
  email: string;
  fullName: string;
  password: string;
  gender: 'male' | 'female';
  city: string;
  preferredTime?: string;
  contactInfo: LegacyContactInfo;
  visibility: LegacyVisibilitySettings;
}

export interface LegacyContactInfo {
  email: string;
  phone: string;
  telegram: string;
  vk: string;
}

export interface LegacyVisibilitySettings {
  email: boolean;
  phone: boolean;
  telegram: boolean;
  vk: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  gender: 'male' | 'female';
  city: string;
  preferredTime?: string;
  contactInfo: LegacyContactInfo;
  visibility: LegacyVisibilitySettings;
  status: 'active' | 'blocked';
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegistrationResponse {
  accessToken: string;
  refreshToken: string;
}

export interface UpdateProfileRequest {
  fullName: string;
  gender: 'M' | 'F';
  region: string;
  city: string;
  bondTime: BondTime[];
  contactInfo: ContactInfoItem[];
}

export interface UserContacts {
  contactInfo: Array<{
    type: ContactType;
    contact: string;
  }>;
}
