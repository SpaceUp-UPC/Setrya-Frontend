import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';

import { GetTemperatureReadingsUseCase } from '../../../application/use-cases/get-temperature-readings.use-case';

@Component({
  selector: 'app-temperature-page',
  imports: [
    AsyncPipe,
    DatePipe
  ],
  templateUrl: './temperature-page.html',
  styleUrl: './temperature-page.scss'
})
export class TemperaturePage {

  private readonly getTemperatureReadings =
    inject(GetTemperatureReadingsUseCase);

  readonly readings$ =
    this.getTemperatureReadings.execute(1);
}
