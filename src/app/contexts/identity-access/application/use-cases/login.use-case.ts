import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthRepository } from '../../domain/repositories/auth.repository';
import { LoginCredentials } from '../../domain/models/login-credentials';
import { User } from '../../domain/models/user';

@Injectable({
  providedIn: 'root'
})
export class LoginUseCase {

  constructor(
    private readonly repository: AuthRepository
  ) {}

  execute(
    credentials: LoginCredentials
  ): Observable<User | null> {
    return this.repository.login(credentials);
  }
}
