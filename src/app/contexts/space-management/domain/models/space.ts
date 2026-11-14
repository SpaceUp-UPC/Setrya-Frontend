export type SpaceStatus =
  | 'active'
  | 'paused'
  | 'unavailable';

export interface SpaceLocation {
  address: string;
  district: string;
  city: string;
}

export interface SpaceDimensions {
  width: number;
  length: number;
}

export interface Space {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  location: SpaceLocation;
  dimensions: SpaceDimensions;
  status: SpaceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSpaceRequest {
  ownerId: string;
  name: string;
  description: string;
  location: SpaceLocation;
  dimensions: SpaceDimensions;
}