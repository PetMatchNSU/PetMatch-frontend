export interface CityLocation {
  region: string;
  city: string;
}

export interface CityApiResponse {
  locations: CityLocation[];
}