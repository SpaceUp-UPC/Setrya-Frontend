import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Alert } from '../../domain/models/alert';
import { IotMonitoringRepository } from '../../domain/repositories/iot-monitoring.repository';

@Injectable({
  providedIn: 'root'
})
export class GetAlertsUseCase {

  constructor(
    private readonly repository: IotMonitoringRepository
  ) {}

  execute(homeId: number): Observable<Alert[]> {
    return this.repository.getAlerts(homeId);
  }
}
