
export type IotMetricType =
  | 'temperature'
  | 'humidity'
  | 'voltage'
  | 'sound'
  | 'intrusion'
  | 'escalation'
  | 'device_error';

export type IotReadingStatus =
  | 'received'
  | 'validated'
  | 'out_of_range';

export type IotAlertSeverity =
  | 'low'
  | 'medium'
  | 'high'
  | 'critical';

export type IotAlertStatus =
  | 'created'
  | 'sent'
  | 'acknowledged'
  | 'closed';

export type IotMonitoringStatus =
  | 'normal'
  | 'attention';

export type IotLocalState =
  | 'NORMAL'
  | 'WARNING'
  | 'CRITICAL';

export interface IotThreshold {
  metricType: IotMetricType;
  minValue: number;
  maxValue: number;
  unit: string;
}

export interface IotDevice {
  id: string;
  spaceId: string;
  name: string;
  active: boolean;
  thresholds: IotThreshold[];
  createdAt: string;
}

export interface IotReading {
  id: string;
  deviceId: string;
  metricType: IotMetricType;
  value: number;
  unit: string;
  receivedAt: string;
  status: IotReadingStatus;

  measuredAt?: string;
  localState?: IotLocalState;
}

export interface IotAlert {
  id: string;
  readingId: string;
  deviceId: string;
  spaceId: string;
  metricType: IotMetricType;

  message: string;
  severity: IotAlertSeverity;
  status: IotAlertStatus;
  createdAt: string;

  acknowledgedAt?: string;
  closedAt?: string;

  reason?: string;
  eventId?: string;
  evidenceRef?: string;
}

export interface IotMonitoringSummary {
  spaceId: string;
  recentReadings: number;
  activeAlerts: number;
  status: IotMonitoringStatus;
}
