import { DeviceType } from '../enums/device-type';

export interface Device {
  id: number;
  homeId: number;

  name: string;
  type: DeviceType;
  location: string;
  status: string;

  code?: string;
  batteryLevel?: number;
  lastSignalAt?: string;
}
