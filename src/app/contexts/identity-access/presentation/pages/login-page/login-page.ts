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

import { LoginUseCase } from '../../../application/use-cases/login.use-case';
import { AuthSessionService } from '../../../application/services/auth-session.service';

@Component({
  selector: 'app-login-page',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule
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

  readonly isLoading = signal(false);

  readonly errorMessage =
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

  submit(): void {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.loginUseCase
      .execute(this.form.getRawValue())
      .subscribe({

        next: user => {

          this.isLoading.set(false);

          if (!user) {
            this.errorMessage.set(
              'Invalid email or password.'
            );

            return;
          }

          this.session.setUser(user);

          this.router.navigate(['/dashboard']);
        },

        error: () => {

          this.isLoading.set(false);

          this.errorMessage.set(
            'Unable to connect to the authentication service.'
          );

        }

      });
  }
}
