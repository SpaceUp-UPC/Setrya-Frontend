import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';

import { GetAlertsUseCase } from '../../../application/use-cases/get-alerts.use-case';

@Component({
  selector: 'app-alerts-page',
  imports: [
    AsyncPipe,
    DatePipe
  ],
  templateUrl: './alerts-page.html',
  styleUrl: './alerts-page.scss'
})
export class AlertsPage {

  private readonly getAlerts =
    inject(GetAlertsUseCase);

  readonly alerts$ =
    this.getAlerts.execute(1);
}
