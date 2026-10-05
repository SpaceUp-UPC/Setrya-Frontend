import { Injectable } from '@angular/core';

import {
  forkJoin,
  map,
  Observable,
  of,
  switchMap
} from 'rxjs';

import { IotMonitoringRepository } from '../../domain/repositories/iot-monitoring.repository';
import { DeviceType } from '../../domain/enums/device-type';

import { TemperatureDetail } from '../models/temperature-detail';

@Injectable({
  providedIn: 'root'
})
export class GetTemperatureDetailUseCase {

  constructor(
    private readonly repository: IotMonitoringRepository
  ) {}

  execute(homeId: number): Observable<TemperatureDetail | null> {

    return this.repository
      .getDevices(homeId)
      .pipe(

        switchMap(devices => {

          const device = devices.find(
            item =>
              item.type === DeviceType.TEMPERATURE_SENSOR
          );

          if (!device) {
            return of(null);
          }

          return forkJoin({
            readings:
              this.repository
                .getTemperatureReadings(device.id)
          }).pipe(

            map(({ readings }) => ({

              device,

              currentReading:
                readings.at(-1) ?? null,

              readings

            }))

          );

        })

      );

  }

}
