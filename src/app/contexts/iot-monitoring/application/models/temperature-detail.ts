import { Device } from '../../domain/models/device';
import { TemperatureReading } from '../../domain/models/temperature-reading';

export interface TemperatureDetail {
  device: Device;
  currentReading: TemperatureReading | null;
  readings: TemperatureReading[];
}
