import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { TranslatePipe } from '@ngx-translate/core';

import { AuthSessionService } from '../../../application/services/auth-session.service';

@Component({
  selector: 'app-implementer-pending-page',
  imports: [TranslatePipe],

  template: `
    <main class="pending-page">

      <section class="pending-card">

        <div class="brand-icon" aria-hidden="true">
          S
        </div>

        <h1>
          {{ 'implementer.pendingTitle' | translate }}
        </h1>

        <p>
          {{ 'implementer.pendingDescription' | translate }}
        </p>

        @if (session.currentUser(); as user) {
          <p class="account">
            {{ 'implementer.signedInAs' | translate }}
            <strong>{{ user.email }}</strong>
          </p>
        }

        <button
          type="button"
          (click)="logout()">

          {{ 'common.signOut' | translate }}

        </button>

      </section>

    </main>
  `,

  styles: [`
    .pending-page {
      min-height: 100vh;
      padding: 24px;
      display: grid;
      place-items: center;
      background: #F8F9FA;
    }

    .pending-card {
      width: 100%;
      max-width: 480px;
      padding: 40px;
      background: #FFFFFF;
      border-radius: 16px;
      text-align: center;
      box-shadow: 0 8px 30px rgba(44, 62, 80, .08);
    }

    .brand-icon {
      width: 52px;
      height: 52px;
      margin: 0 auto 24px;
      display: grid;
      place-items: center;
      background: #2C3E50;
      border-radius: 12px;
      color: #FFFFFF;
      font-size: 28px;
      font-weight: bold;
    }

    h1 {
      color: #2C3E50;
      font-size: 26px;
    }

    p {
      color: #333333;
      line-height: 1.6;
    }

    .account {
      margin-top: 24px;
      overflow-wrap: anywhere;
    }

    button {
      margin-top: 24px;
      padding: 12px 24px;
      border: 0;
      border-radius: 8px;
      background: #D4A373;
      color: #2C3E50;
      font-weight: bold;
      cursor: pointer;
    }

    button:focus-visible {
      outline: 3px solid #2C3E50;
      outline-offset: 3px;
    }
  `]
})
export class ImplementerPendingPage {

  readonly session = inject(AuthSessionService);

  private readonly router = inject(Router);

  logout(): void {

    this.session.clear();

    void this.router.navigateByUrl('/login');

  }

}