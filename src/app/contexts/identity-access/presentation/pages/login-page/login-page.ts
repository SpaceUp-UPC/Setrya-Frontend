import { Component, inject, signal } from '@angular/core';
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

  private readonly formBuilder =
    inject(FormBuilder);

  private readonly loginUseCase =
    inject(LoginUseCase);

  private readonly session =
    inject(AuthSessionService);

  private readonly router =
    inject(Router);

  readonly translate =
    inject(TranslateService);

  readonly isLoading =
    signal(false);

  readonly errorKey =
    signal<string | null>(null);

  readonly form =
    this.formBuilder.nonNullable.group({

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

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;

    }

    this.isLoading.set(true);
    this.errorKey.set(null);

    this.loginUseCase
      .execute(this.form.getRawValue())
      .subscribe({

        next: user => {

          this.isLoading.set(false);

          if (!user) {

            this.errorKey.set(
              'login.invalidCredentials'
            );

            return;

          }

          this.session.setUser(user);

          this.router.navigate(['/dashboard']);

        },

        error: () => {

          this.isLoading.set(false);

          this.errorKey.set(
            'login.connectionError'
          );

        }

      });

  }

}
