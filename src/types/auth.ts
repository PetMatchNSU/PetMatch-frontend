/**
 * Типы для авторизации и регистрации
 */

export interface LoginRequest {
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

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  secondName: string;
  middleName?: string;
  gender: 'M' | 'F';
  region: string;
  city: string;
  bondTime: BondTime[];
  contactInfo: ContactInfo[];
}

export interface BondTime {
  bondTimeStart: string; // HH:mm
  bondTimeEnd: string; // HH:mm
}

export interface ContactInfo {
  type: 'PHONE' | 'EMAIL' | 'TELEGRAM' | 'VK';
  contact: string;
  visible: boolean;
}

export interface RegisterResponse {
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

export interface OAuthRequest {
  code: string;
  redirectUri: string;
}

export interface OAuthResponse {
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
}

export interface OAuthRegisterRequest {
  email: string;
  gender: 'M' | 'F';
  region: string;
  city: string;
  bondTime: BondTime[];
  contactInfo: ContactInfo[];
}

export interface ApiError {
  message: string;
}

export interface User {
  email: string;
  isEmailVerified: boolean;
  firstName?: string;
  secondName?: string;
  middleName?: string;
  gender?: 'M' | 'F';
  region?: string;
  city?: string;
}
