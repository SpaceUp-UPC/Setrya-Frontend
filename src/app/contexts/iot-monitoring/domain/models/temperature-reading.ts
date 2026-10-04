import { TemperatureStatus } from '../enums/temperature-status';

export interface TemperatureReading {
  id: number;
  deviceId: number;
  temperature: number;
  threshold1: number;
  threshold2: number;
  status: TemperatureStatus;
  recordedAt: string;
}
