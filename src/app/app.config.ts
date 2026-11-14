import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners
} from '@angular/core';

import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';

import { AuthRepository } from
  './contexts/identity-access/domain/repositories/auth.repository';

import { HttpAuthRepository } from
  './contexts/identity-access/infrastructure/repositories/http-auth.repository';

import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),

    {
      provide: AuthRepository,
      useClass: HttpAuthRepository
    },

    provideClientHydration(),

    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: './i18n/',
        suffix: '.json'
      }),
      fallbackLang: 'en-US',
      lang: 'en-US'
    })
  ]
};
