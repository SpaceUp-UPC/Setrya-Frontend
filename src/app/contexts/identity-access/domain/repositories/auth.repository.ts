import { Observable } from 'rxjs';

import { LoginCredentials } from '../models/login-credentials';
import { AuthenticatedSession } from '../models/authenticated-session';

export abstract class AuthRepository {

  abstract login(
    credentials: LoginCredentials
  ): Observable<AuthenticatedSession>;

}