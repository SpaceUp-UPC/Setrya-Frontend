import {
  AsyncPipe,
  DatePipe,
  DecimalPipe
} from '@angular/common';

import {
  Component,
  inject
} from '@angular/core';

import { TranslatePipe } from '@ngx-translate/core';

import { GetTemperatureDetailUseCase } from '../../../application/use-cases/get-temperature-detail.use-case';

@Component({
  selector: 'app-temperature-page',

  imports: [
    AsyncPipe,
    DatePipe,
    DecimalPipe,
    TranslatePipe
  ],

  templateUrl: './temperature-page.html',
  styleUrl: './temperature-page.scss'
})
export class TemperaturePage {

  private readonly getTemperatureDetail =
    inject(GetTemperatureDetailUseCase);

  readonly detail$ =
    this.getTemperatureDetail.execute(1);

  getBarHeight(
    temperature: number,
    readings: { temperature: number }[]
  ): number {

    if (readings.length === 0) {
      return 10;
    }

    const values =
      readings.map(
        reading => reading.temperature
      );

    const min =
      Math.min(...values) - 2;

    const max =
      Math.max(...values) + 2;

    const range =
      Math.max(max - min, 1);

    const normalized =
      (temperature - min) / range;

    return Math.max(
      15,
      Math.round(normalized * 100)
    );
  }

}
