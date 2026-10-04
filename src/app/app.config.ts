import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { IotMonitoringRepository } from './contexts/iot-monitoring/domain/repositories/iot-monitoring.repository';
import { HttpIotMonitoringRepository } from './contexts/iot-monitoring/infrastructure/repositories/http-iot-monitoring.repository';
import { SpaceManagementRepository } from './contexts/space-management/domain/repositories/space-management.repository';
import { HttpSpaceManagementRepository } from './contexts/space-management/infrastructure/repositories/http-space-management.repository';
import { AuthRepository } from './contexts/identity-access/domain/repositories/auth.repository';
import { HttpAuthRepository } from './contexts/identity-access/infrastructure/repositories/http-auth.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),

    {
      provide: IotMonitoringRepository,
      useClass: HttpIotMonitoringRepository
    },
    {
      provide: SpaceManagementRepository,
      useClass: HttpSpaceManagementRepository
    },
    {
      provide: AuthRepository,
      useClass: HttpAuthRepository
    },
    provideClientHydration(),

  ],
};
