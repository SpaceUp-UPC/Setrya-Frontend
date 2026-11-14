
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

import {
  TranslatePipe,
  TranslateService
} from '@ngx-translate/core';

import {
  finalize,
  forkJoin,
  Subscription
} from 'rxjs';

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
  IotAlertStatus,
  IotDevice
} from '../../../domain/models/iot-api.models';

type AlertTypeFilter =
  | 'all'
  | 'critical'
  | 'security'
  | 'temperature'
  | 'humidity';

type AlertStatusFilter = 'all' | IotAlertStatus;

@Component({
  selector: 'app-alerts-page',
  imports: [
    DatePipe,
    RouterLink,
    TranslatePipe
  ],
  templateUrl: './alerts-page.html',
  styleUrl: './alerts-page.scss'
})
export class AlertsPage implements OnInit {

  private readonly session = inject(AuthSessionService);
  private readonly spaceApi = inject(SpaceApiService);
  private readonly iotApi = inject(IotMonitoringApiService);
  private readonly translate = inject(TranslateService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private alertsRequest?: Subscription;

  readonly spaces = signal<Space[]>([]);
  readonly selectedSpaceId = signal('');

  readonly alerts = signal<IotAlert[]>([]);
  readonly devices = signal<IotDevice[]>([]);

  readonly loading = signal(false);
  readonly error = signal(false);
  readonly actionError = signal(false);
  readonly busyAlertId = signal<string | null>(null);

  readonly selectedFilter = signal<AlertTypeFilter>('all');
  readonly selectedStatus = signal<AlertStatusFilter>('all');
  readonly selectedAlertId = signal<string | null>(null);

  readonly typeFilters: {
    value: AlertTypeFilter;
    labelKey: string;
  }[] = [
    { value: 'all', labelKey: 'alerts.filters.all' },
    { value: 'critical', labelKey: 'alerts.filters.critical' },
    { value: 'security', labelKey: 'alerts.filters.security' },
    { value: 'temperature', labelKey: 'alerts.filters.temperature' },
    { value: 'humidity', labelKey: 'alerts.filters.humidity' }
  ];

  readonly selectedSpace = computed(() =>
    this.spaces().find(
      space => space.id === this.selectedSpaceId()
    ) ?? null
  );

  readonly activeAlertsCount = computed(() =>
    this.alerts().filter(
      alert => alert.status !== 'closed'
    ).length
  );

  readonly filteredAlerts = computed(() => {
    const type = this.selectedFilter();
    const status = this.selectedStatus();

    return this.alerts().filter(alert => {

      const matchesStatus =
        status === 'all' || alert.status === status;

      let matchesType = true;

      switch (type) {
        case 'critical':
          matchesType = alert.severity === 'critical';
          break;

        case 'security':
          matchesType =
            alert.metricType === 'intrusion' ||
            alert.metricType === 'escalation';
          break;

        case 'temperature':
          matchesType = alert.metricType === 'temperature';
          break;

        case 'humidity':
          matchesType = alert.metricType === 'humidity';
          break;
      }

      return matchesStatus && matchesType;
    });
  });

  readonly selectedAlert = computed(() => {
    const filtered = this.filteredAlerts();
    const selectedId = this.selectedAlertId();

    return filtered.find(
      alert => alert.id === selectedId
    ) ?? filtered[0] ?? null;
  });

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
          this.loadAlerts();
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
    this.selectedAlertId.set(null);
    this.selectedFilter.set('all');
    this.selectedStatus.set('all');

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { spaceId: id },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });

    this.loadAlerts();
  }

  refresh(): void {
    if (this.selectedSpaceId()) {
      this.loadAlerts();
    } else {
      this.loadSpaces();
    }
  }

  private loadAlerts(): void {
    const spaceId = this.selectedSpaceId();

    this.alertsRequest?.unsubscribe();

    if (!spaceId) {
      this.error.set(true);
      return;
    }

    this.loading.set(true);
    this.error.set(false);
    this.actionError.set(false);
    this.alerts.set([]);
    this.devices.set([]);

    this.alertsRequest = forkJoin({
      alerts: this.iotApi.getAlertsBySpace(spaceId),
      devices: this.iotApi.getDevicesBySpace(spaceId)
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => {
          this.alerts.set(
            [...result.alerts].sort(
              (a, b) =>
                Date.parse(b.createdAt) -
                Date.parse(a.createdAt)
            )
          );

          this.devices.set(result.devices);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.error.set(true);
        }
      });
  }

  setFilter(filter: AlertTypeFilter): void {
    this.selectedFilter.set(filter);
    this.selectedAlertId.set(null);
  }

  changeStatus(event: Event): void {
    const value =
      (event.target as HTMLSelectElement).value;

    if (
      value === 'all' ||
      value === 'created' ||
      value === 'sent' ||
      value === 'acknowledged' ||
      value === 'closed'
    ) {
      this.selectedStatus.set(value);
      this.selectedAlertId.set(null);
    }
  }

  selectAlert(alert: IotAlert): void {
    this.selectedAlertId.set(alert.id);
    this.actionError.set(false);
  }

  getDeviceName(deviceId: string): string {
    return this.devices().find(
      device => device.id === deviceId
    )?.name ?? deviceId;
  }

  getSeverityClass(severity: string): string {
    switch (severity) {
      case 'high':
      case 'critical':
        return 'ds-status ds-status--critical';

      case 'medium':
        return 'ds-status ds-status--warning';

      default:
        return 'ds-status ds-status--info';
    }
  }

  acknowledgeAlert(alert: IotAlert): void {
    if (
      this.busyAlertId() !== null ||
      (alert.status !== 'created' && alert.status !== 'sent')
    ) {
      return;
    }

    this.actionError.set(false);
    this.busyAlertId.set(alert.id);

    this.iotApi.acknowledgeAlert(alert.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.busyAlertId.set(null))
      )
      .subscribe({
        next: updated => {
          if (this.selectedSpaceId() !== alert.spaceId) {
            return;
          }

          this.alerts.update(items =>
            items.map(item =>
              item.id === updated.id ? updated : item
            )
          );
        },
        error: () => {
          this.actionError.set(true);
        }
      });
  }

  closeAlert(alert: IotAlert): void {
    if (
      this.busyAlertId() !== null ||
      alert.status === 'closed'
    ) {
      return;
    }

    const confirmed = window.confirm(
      this.translate.instant('alerts.confirmClose')
    );

    if (!confirmed) {
      return;
    }

    this.actionError.set(false);
    this.busyAlertId.set(alert.id);

    this.iotApi.closeAlert(alert.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.busyAlertId.set(null))
      )
      .subscribe({
        next: updated => {
          if (this.selectedSpaceId() !== alert.spaceId) {
            return;
          }

          this.alerts.update(items =>
            items.map(item =>
              item.id === updated.id ? updated : item
            )
          );
        },
        error: () => {
          this.actionError.set(true);
        }
      });
  }
}
