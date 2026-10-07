import { Component, inject } from '@angular/core';

import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

import {
  TranslatePipe,
  TranslateService
} from '@ngx-translate/core';

import { AuthSessionService } from '../../../contexts/identity-access/application/services/auth-session.service';

@Component({
  selector: 'app-shell',

  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    TranslatePipe
  ],

  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss'
})
export class AppShell {

  readonly session =
    inject(AuthSessionService);

  readonly translate =
    inject(TranslateService);

  private readonly router =
    inject(Router);


  changeLanguage(
    language: 'en-US' | 'es-419'
  ): void {

    this.translate.use(language);

  }


  logout(): void {

    this.session.clear();

    this.router.navigate(['/login']);

  }

}
