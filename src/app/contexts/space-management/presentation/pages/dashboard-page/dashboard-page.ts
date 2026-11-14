
import { DatePipe, DecimalPipe } from '@angular/common';

import {
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { forkJoin, Subscription } from 'rxjs';

import { AuthSessionService } from
  '../../../../identity-access/application/services/auth-session.service';

import { IotMonitoringApiService } from
  '../../../../iot-monitoring/infrastructure/services/iot-monitoring-api.service';

import {
  IotAlert,
  IotDevice,
  IotMonitoringSummary,
  IotReading
} from '../../../../iot-monitoring/domain/models/iot-api.models';

import { SpaceApiService } from
  '../../../infrastructure/services/space-api.service';

import { Space } from '../../../domain/models/space';

interface DashboardData {
  space: Space;
  devices: IotDevice[];
  readings: IotReading[];
  alerts: IotAlert[];
  summary: IotMonitoringSummary;
}

@Component({
  selector: 'app-dashboard-page',
  imports: [
    DatePipe,
    DecimalPipe,
    RouterLink,
    TranslatePipe
  ],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss'
})
export class DashboardPage implements OnInit {

  private readonly session = inject(AuthSessionService);
  private readonly spaceApi = inject(SpaceApiService);
  private readonly iotApi = inject(IotMonitoringApiService);
  private readonly destroyRef = inject(DestroyRef);

  private monitoringRequest?: Subscription;

  readonly spaces = signal<Space[]>([]);
  readonly selectedSpaceId = signal('');
  readonly data = signal<DashboardData | null>(null);

  readonly loading = signal(false);
  readonly error = signal(false);

  readonly latestTemperature = computed(() =>
    this.data()?.readings.find(
      reading => reading.metricType === 'temperature'
    ) ?? null
  );

  readonly latestHumidity = computed(() =>
    this.data()?.readings.find(
      reading => reading.metricType === 'humidity'
    ) ?? null
  );

  readonly recentAlerts = computed(() =>
    [...(this.data()?.alerts ?? [])]
      .sort(
        (a, b) =>
          Date.parse(b.createdAt) - Date.parse(a.createdAt)
      )
      .slice(0, 5)
  );

  ngOnInit(): void {
    this.loadSpaces();
  }

  private loadSpaces(): void {
    const user = this.session.currentUser();

    if (!user) {
      this.error.set(true);
      return;
    }

    this.loading.set(true);
    this.error.set(false);

    this.spaceApi.listByOwner(String(user.id))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: spaces => {
          this.spaces.set(spaces);

          if (spaces.length === 0) {
            this.data.set(null);
            this.loading.set(false);
            return;
          }

          const currentId = this.selectedSpaceId();

          const selected = spaces.find(
            space => space.id === currentId
          ) ?? spaces[0];

          this.selectedSpaceId.set(selected.id);
          this.loadMonitoring();
        },
        error: () => {
          this.loading.set(false);
          this.error.set(true);
        }
      });
  }

  selectSpace(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const spaceId = target.value;

    if (!this.spaces().some(space => space.id === spaceId)) {
      return;
    }

    this.selectedSpaceId.set(spaceId);
    this.loadMonitoring();
  }

  refresh(): void {
    if (this.selectedSpaceId()) {
      this.loadMonitoring();
    } else {
      this.loadSpaces();
    }
  }

  private loadMonitoring(): void {
    const space = this.spaces().find(
      item => item.id === this.selectedSpaceId()
    );

    this.monitoringRequest?.unsubscribe();

    if (!space) {
      this.data.set(null);
      this.loading.set(false);
      this.error.set(true);
      return;
    }

    this.loading.set(true);
    this.error.set(false);
    this.data.set(null);

    const spaceId = space.id;

    this.monitoringRequest = forkJoin({
      devices: this.iotApi.getDevicesBySpace(spaceId),
      readings: this.iotApi.getReadingsBySpace(spaceId, 100),
      alerts: this.iotApi.getAlertsBySpace(spaceId),
      summary: this.iotApi.getMonitoringSummary(spaceId)
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => {
          this.data.set({
            space,
            ...result
          });

          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.error.set(true);
        }
      });
  }

  getDeviceMetricLabel(device: IotDevice): string {
    const metric =
      device.thresholds[0]?.metricType ??
      this.data()?.readings.find(
        reading => reading.deviceId === device.id
      )?.metricType;

    return metric
      ? `monitoringReal.metrics.${metric}`
      : 'dashboard.device';
  }
}
