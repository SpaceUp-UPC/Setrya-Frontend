import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { TemperatureReading } from '../../domain/models/temperature-reading';
import { IotMonitoringRepository } from '../../domain/repositories/iot-monitoring.repository';

@Injectable({
  providedIn: 'root'
})
export class GetTemperatureReadingsUseCase {

  constructor(
    private readonly repository: IotMonitoringRepository
  ) {}

  execute(deviceId: number): Observable<TemperatureReading[]> {
    return this.repository.getTemperatureReadings(deviceId);
  }
}
