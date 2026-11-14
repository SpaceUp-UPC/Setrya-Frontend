import { inject, Injectable } from '@angular/core';

import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import {
  Observable,
  throwError
} from 'rxjs';

import { environment } from
  '../../../../../environments/environment';

import { AuthSessionService } from
  '../../../identity-access/application/services/auth-session.service';

import {
  IotAlert,
  IotAlertStatus,
  IotDevice,
  IotMonitoringSummary,
  IotReading
} from '../../domain/models/iot-api.models';

@Injectable({
  providedIn: 'root'
})
export class IotMonitoringApiService {

  private readonly http = inject(HttpClient);

  private readonly session = inject(AuthSessionService);

  private readonly baseUrl =
    environment.iotMonitoringApiUrl.replace(/\/+$/, '');

  private getHeaders(): HttpHeaders {
    const token = this.session.accessToken();

    return token
      ? new HttpHeaders({
          Authorization: `Bearer ${token}`
        })
      : new HttpHeaders();
  }

  private requireBaseUrl(): void {
    if (!this.baseUrl) {
      throw new Error('IOT_API_NOT_CONFIGURED');
    }
  }

  getDevicesBySpace(
    spaceId: string
  ): Observable<IotDevice[]> {

    try {
      this.requireBaseUrl();
    } catch (error) {
      return throwError(() => error);
    }

    return this.http.get<IotDevice[]>(
      `${this.baseUrl}/spaces/${encodeURIComponent(spaceId)}/devices`,
      {
        headers: this.getHeaders()
      }
    );
  }

  getReadingsBySpace(
    spaceId: string,
    limit = 100
  ): Observable<IotReading[]> {

    try {
      this.requireBaseUrl();
    } catch (error) {
      return throwError(() => error);
    }

    const safeLimit = Math.min(
      Math.max(Math.trunc(limit) || 100, 1),
      1000
    );

    return this.http.get<IotReading[]>(
      `${this.baseUrl}/spaces/${encodeURIComponent(spaceId)}/readings`,
      {
        headers: this.getHeaders(),
        params: {
          limit: String(safeLimit)
        }
      }
    );
  }

  getAlertsBySpace(
    spaceId: string,
    status?: IotAlertStatus
  ): Observable<IotAlert[]> {

    try {
      this.requireBaseUrl();
    } catch (error) {
      return throwError(() => error);
    }

    return this.http.get<IotAlert[]>(
      `${this.baseUrl}/spaces/${encodeURIComponent(spaceId)}/alerts`,
      {
        headers: this.getHeaders(),
        params: status ? { status } : {}
      }
    );
  }

  getMonitoringSummary(
    spaceId: string
  ): Observable<IotMonitoringSummary> {

    try {
      this.requireBaseUrl();
    } catch (error) {
      return throwError(() => error);
    }

    return this.http.get<IotMonitoringSummary>(
      `${this.baseUrl}/spaces/${encodeURIComponent(spaceId)}/monitoring-summary`,
      {
        headers: this.getHeaders()
      }
    );
  }

  acknowledgeAlert(
    alertId: string
  ): Observable<IotAlert> {

    if (!this.baseUrl) {
      return throwError(
        () => new Error('IOT_API_NOT_CONFIGURED')
      );
    }

    return this.http.patch<IotAlert>(
      `${this.baseUrl}/alerts/${encodeURIComponent(alertId)}/acknowledge`,
      {},
      {
        headers: this.getHeaders()
      }
    );
  }

  closeAlert(
    alertId: string
  ): Observable<IotAlert> {

    if (!this.baseUrl) {
      return throwError(
        () => new Error('IOT_API_NOT_CONFIGURED')
      );
    }

    return this.http.patch<IotAlert>(
      `${this.baseUrl}/alerts/${encodeURIComponent(alertId)}/close`,
      {},
      {
        headers: this.getHeaders()
      }
    );
  }
}
