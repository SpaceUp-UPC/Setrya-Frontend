import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { SecurityEvent } from '../../domain/models/security-event';
import { IotMonitoringRepository } from '../../domain/repositories/iot-monitoring.repository';

@Injectable({
  providedIn: 'root'
})
export class GetSecurityEventsUseCase {

  constructor(
    private readonly repository: IotMonitoringRepository
  ) {}

  execute(deviceId: number): Observable<SecurityEvent[]> {
    return this.repository.getSecurityEvents(deviceId);
  }
}
