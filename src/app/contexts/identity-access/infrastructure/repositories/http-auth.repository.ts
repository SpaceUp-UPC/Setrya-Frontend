import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  map,
  Observable
} from 'rxjs';

import { environment } from '../../../../../environments/environment';

import { AuthRepository } from '../../domain/repositories/auth.repository';

import { LoginCredentials } from '../../domain/models/login-credentials';
import { User } from '../../domain/models/user';


interface FakeApiUser extends User {
  password: string;
}


@Injectable()
export class HttpAuthRepository
  extends AuthRepository {

  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    environment.apiUrl;


  login(
    credentials: LoginCredentials
  ): Observable<User | null> {

    return this.http
      .get<FakeApiUser[]>(
        `${this.apiUrl}/users`,
        {
          params: {
            email: credentials.email,
            password: credentials.password
          }
        }
      )
      .pipe(

        map(users => {

          const user =
            users[0];

          if (!user) {
            return null;
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          };

        })

      );

  }

}
