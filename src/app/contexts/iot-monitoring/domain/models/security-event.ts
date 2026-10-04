import { SecurityStatus } from '../enums/security-status';

export interface SecurityEvent {
  id: number;
  deviceId: number;
  personDetected: boolean;
  personRecognized: boolean;
  suspiciousSound: boolean;
  status: SecurityStatus;
  location: string;
  recordedAt: string;
}
