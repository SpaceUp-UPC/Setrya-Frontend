import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';

import { GetPowerReadingsUseCase } from '../../../application/use-cases/get-power-readings.use-case';

@Component({
  selector: 'app-power-page',
  imports: [
    AsyncPipe,
    DatePipe
  ],
  templateUrl: './power-page.html',
  styleUrl: './power-page.scss'
})
export class PowerPage {

  private readonly getPowerReadings =
    inject(GetPowerReadingsUseCase);

  readonly readings$ =
    this.getPowerReadings.execute(3);
}
