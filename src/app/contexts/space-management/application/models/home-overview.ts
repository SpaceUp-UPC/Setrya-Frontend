import { Home } from '../../domain/models/home';

import { Device } from '../../../iot-monitoring/domain/models/device';
import { Alert } from '../../../iot-monitoring/domain/models/alert';
import { TemperatureReading } from '../../../iot-monitoring/domain/models/temperature-reading';
import { PowerReading } from '../../../iot-monitoring/domain/models/power-reading';
import { SecurityEvent } from '../../../iot-monitoring/domain/models/security-event';

export interface HomeOverview {
  home: Home;

  devices: Device[];

  temperature: TemperatureReading | null;

  power: PowerReading | null;

  security: SecurityEvent | null;

  alerts: Alert[];
}
