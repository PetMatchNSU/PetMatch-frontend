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

export interface RegistrationResponse {
  accessToken: string;
  refreshToken: string;
}

export type ReviewStatus = 'ON_CHECKING' | 'OK' | 'BLOCKED';

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
    isEmailVerified: boolean;
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