import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { AuthRepository } from '../../domain/repositories/auth.repository';
import { LoginCredentials } from '../../domain/models/login-credentials';
import { User } from '../../domain/models/user';
import { UserRole } from '../../domain/enums/user-role';

interface UserResponse {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

@Injectable()
export class HttpAuthRepository extends AuthRepository {

  private readonly apiUrl = 'http://localhost:3000';

  constructor(
    private readonly http: HttpClient
  ) {
    super();
  }

  login(
    credentials: LoginCredentials
  ): Observable<User | null> {

    const params = new HttpParams()
      .set('email', credentials.email)
      .set('password', credentials.password);

    return this.http
      .get<UserResponse[]>(
        `${this.apiUrl}/users`,
        { params }
      )
      .pipe(
        map(users => {

          const user = users[0];

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
