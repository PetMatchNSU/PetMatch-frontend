export interface Species {
  id: number;
  name: string;
}

export interface AnimalInfo {
  species: Species[];
  goals: string[];
}

export interface PetFormData {
  name: string;
  speciesId: number | null;
  goal: string;
  cost: number | null;
  hasBreed: boolean | null;
  breed: string;
  gender: string;
  birthday: string;
  weight: number | null;
  color: string;
  geneticDiseases: string;
  description: string;
}

export interface Photo {
  id: number;
  file: File | null;
  url: string;
  isDeleted: boolean;
}

export interface Document {
  id: number;
  file: File | null;
  url: string;
  isDeleted: boolean;
  type: string;
}

export interface PetData extends PetFormData {
  animalId: number;
  canEdit: boolean;
  reviewStatus: string;
  photos: {
    mainPhotoId: number | null;
    additionalIds: number[];
  };
  documents: {
    vetPassportId: number | null;
    pedigreeId: number | null;
    vetCertificatesId: number | null;
    diplomasId: number | null;
    otherDocumentsId: number | null;
  };
  createdAt: string;
  updatedAt: string;
}