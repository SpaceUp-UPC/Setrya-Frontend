import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../../environments/environment';

import { IotMonitoringRepository } from '../../domain/repositories/iot-monitoring.repository';

import { Device } from '../../domain/models/device';
import { Alert } from '../../domain/models/alert';
import { TemperatureReading } from '../../domain/models/temperature-reading';
import { PowerReading } from '../../domain/models/power-reading';
import { SecurityEvent } from '../../domain/models/security-event';

@Injectable()
export class HttpIotMonitoringRepository
  extends IotMonitoringRepository {

  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    environment.apiUrl;


  getDevices(
    homeId: number
  ): Observable<Device[]> {

    return this.http.get<Device[]>(
      `${this.apiUrl}/devices`,
      {
        params: {
          homeId
        }
      }
    );

  }


  getAlerts(
    homeId: number
  ): Observable<Alert[]> {

    return this.http.get<Alert[]>(
      `${this.apiUrl}/alerts`,
      {
        params: {
          homeId
        }
      }
    );

  }


  getTemperatureReadings(
    deviceId: number
  ): Observable<TemperatureReading[]> {

    return this.http.get<TemperatureReading[]>(
      `${this.apiUrl}/temperatureReadings`,
      {
        params: {
          deviceId
        }
      }
    );

  }


  getPowerReadings(
    deviceId: number
  ): Observable<PowerReading[]> {

    return this.http.get<PowerReading[]>(
      `${this.apiUrl}/powerReadings`,
      {
        params: {
          deviceId
        }
      }
    );

  }


  getSecurityEvents(
    deviceId: number
  ): Observable<SecurityEvent[]> {

    return this.http.get<SecurityEvent[]>(
      `${this.apiUrl}/securityEvents`,
      {
        params: {
          deviceId
        }
      }
    );

  }

}
