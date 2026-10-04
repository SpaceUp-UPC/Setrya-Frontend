import { PowerStatus } from '../enums/power-status';

export interface PowerReading {
  id: number;
  deviceId: number;
  voltage: number;
  current: number;
  power: number;
  accumulatedConsumption: number;
  relayEnabled: boolean;
  status: PowerStatus;
  recordedAt: string;
}
