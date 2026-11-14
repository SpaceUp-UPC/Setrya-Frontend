
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
  selector: 'app-humidity-page',
  imports: [
    DatePipe,
    DecimalPipe,
    RouterLink,
    TranslatePipe
  ],
  templateUrl: './humidity-page.html',
  styleUrl: './humidity-page.scss'
})
export class HumidityPage implements OnInit {

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

  readonly humidityDevices = computed(() => {
    const deviceIdsWithReadings = new Set(
      this.readings()
        .filter(reading => reading.metricType === 'humidity')
        .map(reading => reading.deviceId)
    );

    return this.devices().filter(device =>
      device.thresholds.some(
        threshold => threshold.metricType === 'humidity'
      ) || deviceIdsWithReadings.has(device.id)
    );
  });

  readonly selectedDevice = computed(() =>
    this.humidityDevices().find(
      device => device.id === this.selectedDeviceId()
    ) ?? null
  );

  readonly humidityThreshold = computed(() =>
    this.selectedDevice()?.thresholds.find(
      threshold => threshold.metricType === 'humidity'
    ) ?? null
  );

  readonly humidityReadings = computed(() =>
    this.readings()
      .filter(reading =>
        reading.metricType === 'humidity' &&
        reading.deviceId === this.selectedDeviceId()
      )
      .sort(
        (a, b) =>
          Date.parse(a.receivedAt) - Date.parse(b.receivedAt)
      )
      .slice(-12)
  );

  readonly currentReading = computed(() =>
    this.humidityReadings().at(-1) ?? null
  );

  readonly recentReadings = computed(() =>
    [...this.humidityReadings()].reverse().slice(0, 5)
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
    this.selectedDeviceId.set('');

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

    if (
      this.humidityDevices().some(device => device.id === id)
    ) {
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
    const previousDeviceId = this.selectedDeviceId();

    this.monitoringRequest?.unsubscribe();

    if (!spaceId) {
      this.error.set(true);
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(false);

    this.monitoringRequest = forkJoin({
      devices: this.iotApi.getDevicesBySpace(spaceId),
      readings: this.iotApi.getReadingsBySpace(spaceId, 100)
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => {
          this.devices.set(result.devices);
          this.readings.set(result.readings);

          const available = this.humidityDevices();

          const selected = available.find(
            device => device.id === previousDeviceId
          ) ?? available[0];

          this.selectedDeviceId.set(selected?.id ?? '');
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.error.set(true);
        }
      });
  }

  getBarHeight(value: number): number {
    return Math.min(100, Math.max(0, value));
  }
}
