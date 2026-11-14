
import { DatePipe } from '@angular/common';

import {
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

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
  IotAlert,
  IotDevice
} from '../../../domain/models/iot-api.models';

@Component({
  selector: 'app-security-page',
  imports: [
    DatePipe,
    RouterLink,
    TranslatePipe
  ],
  templateUrl: './security-page.html',
  styleUrl: './security-page.scss'
})
export class SecurityPage implements OnInit {

  private readonly session = inject(AuthSessionService);
  private readonly spaceApi = inject(SpaceApiService);
  private readonly iotApi = inject(IotMonitoringApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private monitoringRequest?: Subscription;

  readonly spaces = signal<Space[]>([]);
  readonly selectedSpaceId = signal('');

  readonly devices = signal<IotDevice[]>([]);
  readonly alerts = signal<IotAlert[]>([]);

  readonly loading = signal(false);
  readonly error = signal(false);

  readonly selectedSpace = computed(() =>
    this.spaces().find(
      space => space.id === this.selectedSpaceId()
    ) ?? null
  );

  readonly securityAlerts = computed(() =>
    this.alerts()
      .filter(
        alert =>
          alert.metricType === 'intrusion' ||
          alert.metricType === 'escalation'
      )
      .sort(
        (a, b) =>
          Date.parse(b.createdAt) - Date.parse(a.createdAt)
      )
  );

  readonly activeSecurityAlerts = computed(() =>
    this.securityAlerts().filter(
      alert => alert.status !== 'closed'
    ).length
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
      this.loading.set(false);
      this.error.set(true);
      return;
    }

    this.loading.set(true);
    this.error.set(false);

    this.devices.set([]);
    this.alerts.set([]);

    this.monitoringRequest = forkJoin({
      devices: this.iotApi.getDevicesBySpace(spaceId),
      alerts: this.iotApi.getAlertsBySpace(spaceId)
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => {
          this.devices.set(result.devices);
          this.alerts.set(result.alerts);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.error.set(true);
        }
      });
  }

  getDeviceName(deviceId: string): string {
    return this.devices().find(
      device => device.id === deviceId
    )?.name ?? deviceId;
  }
}

