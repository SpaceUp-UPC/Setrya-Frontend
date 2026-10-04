import { Component, inject } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

import { AuthSessionService } from '../../../contexts/identity-access/application/services/auth-session.service';

@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './app-shell.html',
  styleUrl: './app-shell.scss'
})
export class AppShell {

  readonly session =
    inject(AuthSessionService);

  private readonly router =
    inject(Router);

  logout(): void {

    this.session.clear();

    this.router.navigate(['/login']);
  }
}
