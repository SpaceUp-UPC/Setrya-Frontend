import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PowerReading } from '../../domain/models/power-reading';
import { IotMonitoringRepository } from '../../domain/repositories/iot-monitoring.repository';

@Injectable({
  providedIn: 'root'
})
export class GetPowerReadingsUseCase {

  constructor(
    private readonly repository: IotMonitoringRepository
  ) {}

  execute(deviceId: number): Observable<PowerReading[]> {
    return this.repository.getPowerReadings(deviceId);
  }
}
