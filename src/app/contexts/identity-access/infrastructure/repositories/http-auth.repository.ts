import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  map,
  Observable,
  throwError
} from 'rxjs';

import { environment } from '../../../../../environments/environment';

import { AuthRepository } from '../../domain/repositories/auth.repository';
import { LoginCredentials } from '../../domain/models/login-credentials';
import { AuthenticatedSession } from '../../domain/models/authenticated-session';
import { UserRole } from '../../domain/enums/user-role';

interface IamSignInResponse {
  id: number;
  name: string;
  email: string;
  role: string;
  token: string;
}

@Injectable()
export class HttpAuthRepository extends AuthRepository {

  private readonly http = inject(HttpClient);

  private readonly iamApiUrl =
    environment.iamApiUrl.replace(/\/+$/, '');

  login(
    credentials: LoginCredentials
  ): Observable<AuthenticatedSession> {

    if (!this.iamApiUrl) {
      return throwError(
        () => new Error('IAM_NOT_CONFIGURED')
      );
    }

    const body = {
      username: credentials.email.trim(),
      password: credentials.password
    };

    return this.http
      .post<IamSignInResponse>(
        `${this.iamApiUrl}/api/v1/authentication/sign-in`,
        body
      )
      .pipe(
        map(response => {

          if (
            !Number.isInteger(response?.id) ||
            typeof response.name !== 'string' ||
            typeof response.email !== 'string' ||
            typeof response.token !== 'string' ||
            !response.token
          ) {
            throw new Error('INVALID_IAM_RESPONSE');
          }

          if (
            response.role !== UserRole.HOME_OWNER &&
            response.role !== UserRole.IMPLEMENTER
          ) {
            throw new Error('UNSUPPORTED_ROLE');
          }

          return {
            user: {
              id: response.id,
              name: response.name,
              email: response.email,
              role: response.role
            },
            token: response.token
          };

        })
      );

  }

}