import { Observable } from 'rxjs';

import { User } from '../models/user';
import { LoginCredentials } from '../models/login-credentials';

export abstract class AuthRepository {

  abstract login(
    credentials: LoginCredentials
  ): Observable<User | null>;
}
