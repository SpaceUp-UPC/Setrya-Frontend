import { Routes } from '@angular/router';

import { authGuard } from './contexts/identity-access/presentation/guards/auth.guard';
import { roleGuard } from './contexts/identity-access/presentation/guards/role.guard';
import { UserRole } from './contexts/identity-access/domain/enums/user-role';

export const routes: Routes = [

  {
    path: 'login',
    loadComponent: () =>
      import(
        './contexts/identity-access/presentation/pages/login-page/login-page'
      ).then(m => m.LoginPage)
  },

  // Segmento 2: Implementadores
  {
    path: 'implementer',
    canActivate: [
      authGuard,
      roleGuard(UserRole.IMPLEMENTER)
    ],
    loadComponent: () =>
      import(
        './contexts/identity-access/presentation/pages/implementer-pending-page/implementer-pending-page'
      ).then(m => m.ImplementerPendingPage)
  },

  // Segmento 1: Propietarios
  {
    path: '',
    loadComponent: () =>
      import('./core/layout/app-shell/app-shell')
        .then(m => m.AppShell),

    canActivate: [
      authGuard,
      roleGuard(UserRole.HOME_OWNER)
    ],

    children: [
      {
        path: 'spaces',
        loadComponent: () =>
          import(
            './contexts/space-management/presentation/pages/spaces-page/spaces-page'
          ).then(m => m.SpacesPage)
      },

      {
        path: 'dashboard',
        loadComponent: () =>
          import(
            './contexts/space-management/presentation/pages/dashboard-page/dashboard-page'
          ).then(m => m.DashboardPage)
      },

      {
        path: 'monitoring/temperature',
        loadComponent: () =>
          import(
            './contexts/iot-monitoring/presentation/pages/temperature-page/temperature-page'
          ).then(m => m.TemperaturePage)
      },

      {
        path: 'monitoring/security',
        loadComponent: () =>
          import(
            './contexts/iot-monitoring/presentation/pages/security-page/security-page'
          ).then(m => m.SecurityPage)
      },

      {
        path: 'monitoring/power',
        loadComponent: () =>
          import(
            './contexts/iot-monitoring/presentation/pages/power-page/power-page'
          ).then(m => m.PowerPage)
      },

      {
        path: 'alerts',
        loadComponent: () =>
          import(
            './contexts/iot-monitoring/presentation/pages/alerts-page/alerts-page'
          ).then(m => m.AlertsPage)
      },

      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      }

    ]
  },

  {
    path: 'not-found',
    loadComponent: () =>
      import(
        './shared/components/not-found-page/not-found-page'
      ).then(m => m.NotFoundPage)
  },

  {
    path: '**',
    redirectTo: 'not-found'
  }

];