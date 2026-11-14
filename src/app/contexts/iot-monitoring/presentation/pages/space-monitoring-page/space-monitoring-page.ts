
import {
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';

import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';

import { forkJoin, map, switchMap, throwError } from 'rxjs';

import { AuthSessionService } from
  '../../../../identity-access/application/services/auth-session.service';

import { SpaceApiService } from
  '../../../../space-management/infrastructure/services/space-api.service';

import { Space } from
  '../../../../space-management/domain/models/space';

import { IotMonitoringApiService } from
  '../../../infrastructure/services/iot-monitoring-api.service';

import {
  IotAlert,
  IotDevice,
  IotMonitoringSummary,
  IotReading
} from '../../../domain/models/iot-api.models';

interface MonitoringOverviewData {
  space: Space;
  devices: IotDevice[];
  readings: IotReading[];
  alerts: IotAlert[];
  summary: IotMonitoringSummary;
}

@Component({
  selector: 'app-space-monitoring-page',
  imports: [DatePipe, DecimalPipe, RouterLink, TranslatePipe],
  templateUrl: './space-monitoring-page.html',
  styleUrl: './space-monitoring-page.scss'
})
export class SpaceMonitoringPage implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly session = inject(AuthSessionService);
  private readonly spaceApi = inject(SpaceApiService);
  private readonly iotApi = inject(IotMonitoringApiService);

  readonly overview = signal<MonitoringOverviewData | null>(null);
  readonly loading = signal(false);
  readonly error = signal(false);

  readonly latestTemperature = computed(() =>
    this.overview()?.readings.find(
      reading => reading.metricType === 'temperature'
    ) ?? null
  );

  readonly latestHumidity = computed(() =>
    this.overview()?.readings.find(
      reading => reading.metricType === 'humidity'
    ) ?? null
  );

  readonly activeDevices = computed(() =>
    this.overview()?.devices.filter(
      device => device.active
    ).length ?? 0
  );

  ngOnInit(): void {
    this.loadMonitoring();
  }

  loadMonitoring(): void {
    const spaceId = this.route.snapshot.paramMap.get('spaceId');
    const user = this.session.currentUser();

    if (!spaceId || !user) {
      this.error.set(true);
      return;
    }

    this.loading.set(true);
    this.error.set(false);
    this.overview.set(null);

    this.spaceApi.listByOwner(String(user.id)).pipe(
      switchMap(spaces => {

        const space = spaces.find(
          item => item.id === spaceId
        );

        if (!space) {
          return throwError(
            () => new Error('SPACE_NOT_FOUND')
          );
        }

        return forkJoin({
          devices: this.iotApi.getDevicesBySpace(spaceId),
          readings: this.iotApi.getReadingsBySpace(spaceId, 50),
          alerts: this.iotApi.getAlertsBySpace(spaceId),
          summary: this.iotApi.getMonitoringSummary(spaceId)
        }).pipe(
          map(result => ({
            space,
            ...result
          }))
        );

      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: result => {
        this.overview.set(result);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }
}
