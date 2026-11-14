
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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { forkJoin, Subscription } from 'rxjs';

import { AuthSessionService } from
  '../../../../identity-access/application/services/auth-session.service';

import { SpaceApiService } from
  '../../../../space-management/infrastructure/services/space-api.service';

import { Space } from
  '../../../../space-management/domain/models/space';

import { IotMonitoringApiService } from
  '../../../infrastructure/services/iot-monitoring-api.service';

import {
  IotDevice,
  IotReading
} from '../../../domain/models/iot-api.models';

@Component({
  selector: 'app-temperature-page',
  imports: [
    DatePipe,
    DecimalPipe,
    RouterLink,
    TranslatePipe
  ],
  templateUrl: './temperature-page.html',
  styleUrl: './temperature-page.scss'
})
export class TemperaturePage implements OnInit {

  private readonly session = inject(AuthSessionService);
  private readonly spaceApi = inject(SpaceApiService);
  private readonly iotApi = inject(IotMonitoringApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private monitoringRequest?: Subscription;

  readonly spaces = signal<Space[]>([]);
  readonly selectedSpaceId = signal('');
  readonly selectedDeviceId = signal('');

  readonly devices = signal<IotDevice[]>([]);
  readonly readings = signal<IotReading[]>([]);

  readonly loading = signal(false);
  readonly error = signal(false);

  readonly selectedSpace = computed(() =>
    this.spaces().find(
      space => space.id === this.selectedSpaceId()
    ) ?? null
  );

  readonly temperatureDevices = computed(() => {
    const temperatureDeviceIds = new Set(
      this.readings()
        .filter(reading => reading.metricType === 'temperature')
        .map(reading => reading.deviceId)
    );

    return this.devices().filter(
      device =>
        device.thresholds.some(
          threshold => threshold.metricType === 'temperature'
        ) ||
        temperatureDeviceIds.has(device.id)
    );
  });

  readonly selectedDevice = computed(() =>
    this.temperatureDevices().find(
      device => device.id === this.selectedDeviceId()
    ) ?? null
  );

  readonly temperatureThreshold = computed(() =>
    this.selectedDevice()?.thresholds.find(
      threshold => threshold.metricType === 'temperature'
    ) ?? null
  );

  readonly temperatureReadings = computed(() =>
    this.readings()
      .filter(
        reading =>
          reading.metricType === 'temperature' &&
          reading.deviceId === this.selectedDeviceId()
      )
      .sort(
        (a, b) =>
          Date.parse(a.receivedAt) - Date.parse(b.receivedAt)
      )
      .slice(-12)
  );

  readonly currentReading = computed(() =>
    this.temperatureReadings().at(-1) ?? null
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
            this.loading.set(false);
            return;
          }

          const requestedId =
            this.route.snapshot.queryParamMap.get('spaceId');

          const selected =
            spaces.find(space => space.id === requestedId) ??
            spaces[0];

          this.selectedSpaceId.set(selected.id);
          this.loadMonitoring();
        },
        error: () => {
          this.loading.set(false);
          this.error.set(true);
        }
      });
  }

  changeSpace(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;

    if (!this.spaces().some(space => space.id === id)) {
      return;
    }

    this.selectedSpaceId.set(id);

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { spaceId: id },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });

    this.loadMonitoring();
  }

  changeDevice(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;

    if (this.temperatureDevices().some(device => device.id === id)) {
      this.selectedDeviceId.set(id);
    }
  }

  refresh(): void {
    if (this.selectedSpaceId()) {
      this.loadMonitoring();
    } else {
      this.loadSpaces();
    }
  }

  private loadMonitoring(): void {
    const spaceId = this.selectedSpaceId();

    this.monitoringRequest?.unsubscribe();

    if (!spaceId) {
      this.error.set(true);
      return;
    }

    this.loading.set(true);
    this.error.set(false);

    this.devices.set([]);
    this.readings.set([]);
    this.selectedDeviceId.set('');

    this.monitoringRequest = forkJoin({
      devices: this.iotApi.getDevicesBySpace(spaceId),
      readings: this.iotApi.getReadingsBySpace(spaceId, 100)
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => {
          this.devices.set(result.devices);
          this.readings.set(result.readings);

          const firstDevice = this.temperatureDevices()[0];
          this.selectedDeviceId.set(firstDevice?.id ?? '');

          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.error.set(true);
        }
      });
  }

  getBarHeight(
    value: number,
    readings: IotReading[]
  ): number {
    if (readings.length === 0) {
      return 15;
    }

    const values = readings.map(reading => reading.value);

    const min = Math.min(...values) - 2;
    const max = Math.max(...values) + 2;
    const range = Math.max(max - min, 1);

    const percentage = ((value - min) / range) * 100;

    return Math.min(100, Math.max(15, Math.round(percentage)));
  }
}
