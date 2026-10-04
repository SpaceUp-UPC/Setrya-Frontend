import { Injectable } from '@angular/core';
import { forkJoin, Observable, of, switchMap, map } from 'rxjs';

import { SpaceManagementRepository } from '../../domain/repositories/space-management.repository';

import { IotMonitoringRepository } from '../../../iot-monitoring/domain/repositories/iot-monitoring.repository';
import { DeviceType } from '../../../iot-monitoring/domain/enums/device-type';

import { HomeOverview } from '../models/home-overview';

@Injectable({
  providedIn: 'root'
})
export class GetHomeOverviewUseCase {

  constructor(
    private readonly spaceRepository: SpaceManagementRepository,
    private readonly iotRepository: IotMonitoringRepository
  ) {}

  execute(homeId: number): Observable<HomeOverview> {

    return forkJoin({
      home: this.spaceRepository.getHomeById(homeId),
      devices: this.iotRepository.getDevices(homeId),
      alerts: this.iotRepository.getAlerts(homeId)
    }).pipe(

      switchMap(({ home, devices, alerts }) => {

        const temperatureDevice =
          devices.find(
            device =>
              device.type === DeviceType.TEMPERATURE_SENSOR
          );

        const securityDevice =
          devices.find(
            device =>
              device.type === DeviceType.SECURITY_SENSOR
          );

        const powerDevice =
          devices.find(
            device =>
              device.type === DeviceType.ELECTRICAL_PROTECTOR
          );

        return forkJoin({

          temperatureReadings: temperatureDevice
            ? this.iotRepository.getTemperatureReadings(
              temperatureDevice.id
            )
            : of([]),

          securityEvents: securityDevice
            ? this.iotRepository.getSecurityEvents(
              securityDevice.id
            )
            : of([]),

          powerReadings: powerDevice
            ? this.iotRepository.getPowerReadings(
              powerDevice.id
            )
            : of([])

        }).pipe(

          map(({
                 temperatureReadings,
                 securityEvents,
                 powerReadings
               }) => ({

            home,
            devices,

            temperature:
              temperatureReadings.at(-1) ?? null,

            security:
              securityEvents.at(-1) ?? null,

            power:
              powerReadings.at(-1) ?? null,

            alerts

          }))

        );

      })

    );
  }
}
