export interface RegisterRequest {
  email: string;
  fullName: string;
  password: string;
  gender: 'male' | 'female';
  city: string;
  preferredTime?: string;
  contactInfo: ContactInfo;
  visibility: VisibilitySettings;
}

export interface ContactInfo {
  email: string;
  phone: string;
  telegram: string;
  vk: string;
}

export interface VisibilitySettings {
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
  contactInfo: ContactInfo;
  visibility: VisibilitySettings;
  status: 'active' | 'blocked';
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegistrationResponse {
  accessToken: string;
  refreshToken: string;
}

export type ReviewStatus = 'ON_CHECKING' | 'OK' | 'BLOCKED';

export type ContactType = 'email' | 'phone' | 'telegram' | 'vk';

export interface ContactInfoItem {
  type: ContactType;
  contact: string;
  isVisible: boolean;
}

export interface BondTime {
  day: string;
  timeRange: string;
}

export interface UserProfile {
  fullName: string;
  gender: 'M' | 'F';
  region: string;
  city: string;
  bondTime: BondTime[];
  contactInfo: ContactInfoItem[];
  reviewStatus: ReviewStatus;
  reviewComment?: string;
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