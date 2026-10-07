import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TranslatePipe } from '@ngx-translate/core';

import { GetHomeOverviewUseCase } from '../../../application/use-cases/get-home-overview.use-case';

import { Device } from '../../../../iot-monitoring/domain/models/device';
import { DeviceType } from '../../../../iot-monitoring/domain/enums/device-type';

@Component({
  selector: 'app-dashboard-page',

  imports: [
    AsyncPipe,
    DatePipe,
    RouterLink,
    TranslatePipe
  ],

  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss'
})
export class DashboardPage {

  private readonly getHomeOverview =
    inject(GetHomeOverviewUseCase);

  readonly overview$ =
    this.getHomeOverview.execute(1);


  getDeviceRoute(device: Device): string {

    switch (device.type) {

      case DeviceType.TEMPERATURE_SENSOR:
        return '/monitoring/temperature';

      case DeviceType.SECURITY_SENSOR:
        return '/monitoring/security';

      case DeviceType.ELECTRICAL_PROTECTOR:
        return '/monitoring/power';

      default:
        return '/dashboard';
    }

  }


  getDeviceTypeLabel(device: Device): string {

    switch (device.type) {

      case DeviceType.TEMPERATURE_SENSOR:
        return 'navigation.temperature';

      case DeviceType.SECURITY_SENSOR:
        return 'navigation.security';

      case DeviceType.ELECTRICAL_PROTECTOR:
        return 'navigation.power';

      default:
        return 'dashboard.device';
    }

  }


  getStatusClass(status: string): string {

    switch (status) {

      case 'CRITICAL':
      case 'EMERGENCY':
      case 'POWER_CUT':
        return 'ds-status ds-status--critical';

      case 'WARNING':
      case 'SUSPICIOUS_EVENT':
        return 'ds-status ds-status--warning';

      case 'NORMAL':
      case 'MONITORING':
        return 'ds-status ds-status--normal';

      default:
        return 'ds-status ds-status--info';
    }

  }

}
