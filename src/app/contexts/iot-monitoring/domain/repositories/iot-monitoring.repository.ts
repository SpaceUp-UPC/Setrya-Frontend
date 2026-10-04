import { Observable } from 'rxjs';

import { Device } from '../models/device';
import { Alert } from '../models/alert';
import { TemperatureReading } from '../models/temperature-reading';
import { PowerReading } from '../models/power-reading';
import { SecurityEvent } from '../models/security-event';

export abstract class IotMonitoringRepository {

  abstract getDevices(homeId: number): Observable<Device[]>;

  abstract getAlerts(homeId: number): Observable<Alert[]>;

  abstract getTemperatureReadings(
    deviceId: number
  ): Observable<TemperatureReading[]>;

  abstract getPowerReadings(
    deviceId: number
  ): Observable<PowerReading[]>;

  abstract getSecurityEvents(
    deviceId: number
  ): Observable<SecurityEvent[]>;
}
