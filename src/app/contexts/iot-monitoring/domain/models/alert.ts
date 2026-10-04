import { AlertSeverity } from '../enums/alert-severity';
import { AlertSource } from '../enums/alert-source';

export interface Alert {
  id: number;
  homeId: number;
  source: AlertSource;
  severity: AlertSeverity;
  title: string;
  description: string;
  createdAt: string;
  acknowledged: boolean;
}
