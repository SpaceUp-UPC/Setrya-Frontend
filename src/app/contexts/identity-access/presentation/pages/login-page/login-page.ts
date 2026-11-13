import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import {
  TranslatePipe,
  TranslateService
} from '@ngx-translate/core';

import { LoginUseCase } from '../../../application/use-cases/login.use-case';
import { AuthSessionService } from '../../../application/services/auth-session.service';
import { UserRole } from '../../../domain/enums/user-role';

@Component({
  selector: 'app-login-page',

  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    TranslatePipe
  ],

  templateUrl: './login-page.html',
  styleUrl: './login-page.scss'
})
export class LoginPage {

  private readonly formBuilder = inject(FormBuilder);

  private readonly loginUseCase = inject(LoginUseCase);

  private readonly session = inject(AuthSessionService);

  private readonly router = inject(Router);

  readonly translate = inject(TranslateService);

  readonly isLoading = signal(false);

  readonly errorKey = signal<string | null>(null);

  readonly form = this.formBuilder.nonNullable.group({

    email: [
      '',
      [
        Validators.required,
        Validators.email
      ]
    ],

    password: [
      '',
      [
        Validators.required
      ]
    ]

  });

  changeLanguage(
    language: 'en-US' | 'es-419'
  ): void {

    this.translate.use(language);

  }

  submit(): void {

    if (this.isLoading()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorKey.set(null);

    this.loginUseCase
      .execute(this.form.getRawValue())
      .subscribe({

        next: authenticatedSession => {

          this.isLoading.set(false);

          if (!this.session.setSession(authenticatedSession)) {
            this.errorKey.set('login.serviceError');
            return;
          }

          const role = authenticatedSession.user.role;

          const destination =
            role === UserRole.IMPLEMENTER
              ? '/implementer'
              : '/dashboard';

          void this.router.navigateByUrl(destination);

        },

        error: error => {

          this.isLoading.set(false);

          if (
            error instanceof Error &&
            error.message === 'UNSUPPORTED_ROLE'
          ) {
            this.errorKey.set('login.unsupportedRole');
            return;
          }

          if (error instanceof HttpErrorResponse) {

            if (error.status === 401 || error.status === 403) {
              this.errorKey.set('login.invalidCredentials');
              return;
            }

            if (error.status === 0) {
              this.errorKey.set('login.connectionError');
              return;
            }

          }

          this.errorKey.set('login.serviceError');

        }

      });

  }

}