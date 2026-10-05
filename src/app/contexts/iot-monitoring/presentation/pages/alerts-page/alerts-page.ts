import { AsyncPipe, DatePipe } from '@angular/common';
import {
  Component,
  inject,
  signal
} from '@angular/core';

import { tap } from 'rxjs';

import { TranslatePipe } from '@ngx-translate/core';

import { GetAlertsUseCase } from '../../../application/use-cases/get-alerts.use-case';

import { Alert } from '../../../domain/models/alert';

type AlertFilter =
  | 'ALL'
  | 'CRITICAL'
  | 'SECURITY'
  | 'TEMPERATURE'
  | 'POWER';

@Component({
  selector: 'app-alerts-page',

  imports: [
    AsyncPipe,
    DatePipe,
    TranslatePipe
  ],

  templateUrl: './alerts-page.html',
  styleUrl: './alerts-page.scss'
})
export class AlertsPage {

  private readonly getAlerts =
    inject(GetAlertsUseCase);

  readonly selectedFilter =
    signal<AlertFilter>('ALL');

  readonly selectedAlert =
    signal<Alert | null>(null);

  readonly alerts$ =
    this.getAlerts
      .execute(1)
      .pipe(
        tap(alerts => {

          if (
            !this.selectedAlert() &&
            alerts.length > 0
          ) {
            this.selectedAlert.set(alerts[0]);
          }

        })
      );


  setFilter(
    filter: AlertFilter,
    alerts: Alert[]
  ): void {

    this.selectedFilter.set(filter);

    const filteredAlerts =
      this.filterAlerts(alerts, filter);

    const currentAlert =
      this.selectedAlert();

    const currentStillVisible =
      filteredAlerts.some(
        alert =>
          alert.id === currentAlert?.id
      );

    if (!currentStillVisible) {

      this.selectedAlert.set(
        filteredAlerts[0] ?? null
      );

    }

  }


  selectAlert(alert: Alert): void {

    this.selectedAlert.set(alert);

  }


  filterAlerts(
    alerts: Alert[],
    filter: AlertFilter = this.selectedFilter()
  ): Alert[] {

    switch (filter) {

      case 'CRITICAL':
        return alerts.filter(
          alert =>
            alert.severity === 'CRITICAL'
        );

      case 'SECURITY':
        return alerts.filter(
          alert =>
            alert.source === 'SECURITY'
        );

      case 'TEMPERATURE':
        return alerts.filter(
          alert =>
            alert.source === 'TEMPERATURE'
        );

      case 'POWER':
        return alerts.filter(
          alert =>
            alert.source === 'POWER'
        );

      default:
        return alerts;

    }

  }


  getSeverityClass(
    severity: string
  ): string {

    switch (severity) {

      case 'CRITICAL':
        return 'ds-status ds-status--critical';

      case 'WARNING':
        return 'ds-status ds-status--warning';

      default:
        return 'ds-status ds-status--info';

    }

  }


  getSourceTranslationKey(
    source: string
  ): string {

    switch (source) {

      case 'SECURITY':
        return 'navigation.security';

      case 'TEMPERATURE':
        return 'navigation.temperature';

      case 'POWER':
        return 'navigation.power';

      default:
        return 'alerts.unknownSource';

    }

  }

}
