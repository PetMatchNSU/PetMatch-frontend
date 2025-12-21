import axios from 'axios';
import type { 
  CityApiResponse 
} from '../types/city';
import type { 
  RegisterRequest,
  RegistrationResponse,
  UserContacts,
  UserProfile,
  UpdateProfileRequest,
  VerifyEmailRequest,
} from '../types/user';

const API_BASE_URL = 'http://localhost:8091/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock delay function for simulating API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data for species and goals
const mockSpecies = [
  { id: 1, name: "Кошка" },
  { id: 2, name: "Собака" },
  { id: 3, name: "Грызун" },
  { id: 4, name: "Ящерица" },
  { id: 5, name: "Птица" },
  { id: 6, name: "Другое" }
];

const mockGoals = ["SELL", "PAIRING", "FREE"];

// Mock pet data
const mockPets: any[] = [
  {
    animalId: 1,
    canEdit: true,
    name: "Барсик",
    species: { id: 1, name: "кошка" },
    goal: "SELL",
    cost: 10000,
    hasBreed: true,
    breed: "Сиамская",
    gender: "М",
    birthday: "2022-05-15",
    weight: 4.5,
    color: "бежевый с коричневыми отметинами",
    geneticDiseases: "Нет",
    description: "Очень игривый и ласковый кот. Хорошо ладит с детьми.",
    reviewStatus: "PUBLISHED",
    photos: {
      mainPhotoId: 101,
      additionalIds: [102, 103]
    },
    documents: {
      vetPassportId: 201,
      pedigreeId: 202,
      vetCertificatesId: null,
      diplomasId: null,
      otherDocumentsId: null
    },
    createdAt: "2023-01-15T10:00:00Z",
    updatedAt: "2023-01-15T10:00:00Z"
  },
  // Additional mock data for animals shown in Pets page
  {
    animalId: 1111,
    canEdit: true,
    name: "Кличка",
    species: { id: 1, name: "Кошка" },
    goal: "BUY",
    cost: null,
    hasBreed: true,
    breed: "Абиссинская",
    gender: "М",
    birthday: "2023-11-15",
    weight: 3.2,
    color: "Рыжий",
    geneticDiseases: "Нет",
    description: "Активная и игривая кошка. Любит внимание.",
    reviewStatus: "PUBLISHED",
    photos: {
      mainPhotoId: 1324325,
      additionalIds: [1324326, 1324327]
    },
    documents: {
      vetPassportId: 301,
      pedigreeId: 302,
      vetCertificatesId: null,
      diplomasId: null,
      otherDocumentsId: null
    },
    createdAt: "2023-11-15T12:00:00Z",
    updatedAt: "2023-11-15T12:00:00Z"
  },
  {
    animalId: 1112,
    canEdit: true,
    name: "Дружок",
    species: { id: 2, name: "Собака" },
    goal: "FREE",
    cost: null,
    hasBreed: false,
    breed: "",
    gender: "Ж",
    birthday: "2023-11-10",
    weight: 12.5,
    color: "Черный",
    geneticDiseases: "Нет",
    description: "Спокойная собака, хорошо подходит для семьи с детьми.",
    reviewStatus: "PUBLISHED",
    photos: {
      mainPhotoId: 1324326,
      additionalIds: []
    },
    documents: {
      vetPassportId: 401,
      pedigreeId: null,
      vetCertificatesId: null,
      diplomasId: null,
      otherDocumentsId: null
    },
    createdAt: "2023-11-10T14:20:00Z",
    updatedAt: "2023-11-10T14:20:00Z"
  },
  {
    animalId: 1113,
    canEdit: true,
    name: "Барсик",
    species: { id: 1, name: "Кошка" },
    goal: "SELL",
    cost: 15000,
    hasBreed: true,
    breed: "Сиамская",
    gender: "М",
    birthday: "2023-10-20",
    weight: 4.0,
    color: "Кремовый",
    geneticDiseases: "Нет",
    description: "Красивая сиамская кошка с отличной родословной.",
    reviewStatus: "PUBLISHED",
    photos: {
      mainPhotoId: 1324327,
      additionalIds: [1324328]
    },
    documents: {
      vetPassportId: 501,
      pedigreeId: 502,
      vetCertificatesId: null,
      diplomasId: null,
      otherDocumentsId: null
    },
    createdAt: "2023-10-20T10:15:00Z",
    updatedAt: "2023-10-20T10:15:00Z"
  },
  {
    animalId: 1114,
    canEdit: true,
    name: "Рекс",
    species: { id: 2, name: "Собака" },
    goal: "BUY",
    cost: null,
    hasBreed: true,
    breed: "Немецкая овчарка",
    gender: "М",
    birthday: "2023-09-05",
    weight: 30.0,
    color: "Черно-коричневый",
    geneticDiseases: "Дисплазия тазобедренных суставов",
    description: "Тренированная служебная собака, отлично слушается команд.",
    reviewStatus: "PUBLISHED",
    photos: {
      mainPhotoId: 1324328,
      additionalIds: [1324329, 1324330]
    },
    documents: {
      vetPassportId: 601,
      pedigreeId: 602,
      vetCertificatesId: 603,
      diplomasId: null,
      otherDocumentsId: null
    },
    createdAt: "2023-09-05T16:30:00Z",
    updatedAt: "2023-09-05T16:30:00Z"
  },
  {
    animalId: 1115,
    canEdit: true,
    name: "Мурка",
    species: { id: 1, name: "Кошка" },
    goal: "FREE",
    cost: null,
    hasBreed: false,
    breed: "",
    gender: "Ж",
    birthday: "2023-12-01",
    weight: 3.8,
    color: "Серый",
    geneticDiseases: "Нет",
    description: "Ласковая кошка, любит ласку и тепло.",
    reviewStatus: "PUBLISHED",
    photos: {
      mainPhotoId: 1324329,
      additionalIds: []
    },
    documents: {
      vetPassportId: 701,
      pedigreeId: null,
      vetCertificatesId: null,
      diplomasId: null,
      otherDocumentsId: null
    },
    createdAt: "2023-12-01T09:45:00Z",
    updatedAt: "2023-12-01T09:45:00Z"
  }
];

export const api = {
  // Get cities
  getCities: async (name: string): Promise<CityApiResponse> => {
    try {
      const response = await apiClient.get('/city', {
        params: { name: name }
      });
      return response.data;
    } catch (error: any) {
      console.error('Get cities error:', error);
      if (error.response?.data) {
        throw error.response.data;
      }
      throw error;
    }
  },

  // User registration
  registerUser: async (requestBody: RegisterRequest): Promise<RegistrationResponse> => {
    try {
      const response = await apiClient.post<RegistrationResponse>('/user/register', requestBody);
      if (response.data.accessToken && response.data.refreshToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
      return response.data;
    } catch (error: any) {
      console.error('User registration error:', error);
      if (error.response?.data) {
        throw error.response.data;
      }
      throw error;
    }
  },

  // Logout
  logout: (): void => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  // Verify email
  verifyEmail: async (verifyData: VerifyEmailRequest): Promise<void> => {
    try {
      await apiClient.post('/user/verify-email', verifyData);
    } catch (error: any) {
      console.error('Verify email error:', error);
      if (error.response?.data) {
        throw error.response.data;
      }
      throw error;
    }
  },

  // User login
  loginUser: async (credentials: any): Promise<any> => {
    try {
      const response = await apiClient.post('/user/login', credentials);
      return response.data;
    } catch (error: any) {
      console.error('User login error:', error);
      if (error.response?.data) {
        throw error.response.data;
      }
      throw error;
    }
  },

  // Get user profile
  getUserProfile: async (): Promise<UserProfile> => {
    try {
      const response = await apiClient.get<UserProfile>('/user/profile');
      return response.data;
    } catch (error: any) {
      console.error('Get user profile error:', error);
      if (error.response?.data) {
        throw error.response.data;
      }
      throw error;
    }
  },

  // Update user profile
  updateUserProfile: async (profileData: UpdateProfileRequest): Promise<void> => {
    try {
      const response = await apiClient.put('/user/profile', profileData);
      return response.data;
    } catch (error: any) {
      console.error('Update user profile error:', error);
      if (error.response?.data) {
        throw error.response.data;
      }
      throw error;
    }
  },

  // Get user contacts
  getUserContacts: async (): Promise<UserContacts> => {
    try {
      const response = await apiClient.get<UserContacts>('/user/contacts');
      return response.data;
    } catch (error: any) {
      console.error('Get user contacts error:', error);
      if (error.response?.data) {
        throw error.response.data;
      }
      throw error;
    }
  },

  // Get animal info (species and goals)
  getAnimalInfo: async (): Promise<any> => {
    await delay(500); // Simulate network delay
    return {
      species: mockSpecies,
      goals: mockGoals
    };
  },

  // Get animal by ID
  getAnimal: async (id: number): Promise<any> => {
    await delay(500); // Simulate network delay
    const pet = mockPets.find(p => p.animalId === id);
    if (!pet) {
      throw new Error('Pet not found');
    }
    return pet;
  },

  // Update animal
  updateAnimal: async (animalId: number, data: any): Promise<any> => {
    await delay(1000); // Simulate network delay
    const petIndex = mockPets.findIndex(p => p.animalId === animalId);
    if (petIndex === -1) {
      throw new Error('Pet not found');
    }
    
    // Update the pet data
    mockPets[petIndex] = {
      ...mockPets[petIndex],
      ...data,
      animalId,
      updatedAt: new Date().toISOString()
    };
    
    return {
      animal_id: animalId,
      status: "ok"
    };
  },

  // Delete file
  deleteFile: async (fileId: number): Promise<any> => {
    await delay(300); // Simulate network delay
    // In a real implementation, this would delete the file from storage
    return { status: "ok" };
  },

  // Upload file
  uploadFile: async (file: File): Promise<any> => {
    await delay(1000); // Simulate network delay
    // In a real implementation, this would upload the file to storage
    return {
      fileId: Math.floor(Math.random() * 100000),
      status: "ok"
    };
  },

  getProfile: async (): Promise<UserProfile> => {
    const response = await fetch('/api/profile', {
      headers: getHeaders(),
    });
    return handleResponse<UserProfile>(response);
  },
  
  updateProfile: async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(profileData),
    });
    return handleResponse<UserProfile>(response);
  },
};