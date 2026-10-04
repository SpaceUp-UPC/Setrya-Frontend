import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';

import { GetHomeOverviewUseCase } from '../../../application/use-cases/get-home-overview.use-case';

@Component({
  selector: 'app-dashboard-page',
  imports: [
    AsyncPipe,
    DatePipe
  ],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss'
})
export class DashboardPage {

  private readonly getHomeOverview =
    inject(GetHomeOverviewUseCase);

  readonly overview$ =
    this.getHomeOverview.execute(1);
}
