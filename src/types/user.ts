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