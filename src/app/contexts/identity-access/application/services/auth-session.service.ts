import {
  computed,
  inject,
  Injectable,
  PLATFORM_ID,
  signal
} from '@angular/core';

import { isPlatformBrowser } from '@angular/common';

import { User } from '../../domain/models/user';
import { UserRole } from '../../domain/enums/user-role';
import { AuthenticatedSession } from '../../domain/models/authenticated-session';

@Injectable({
  providedIn: 'root'
})
export class AuthSessionService {

  private readonly platformId = inject(PLATFORM_ID);

  private readonly isBrowser =
    isPlatformBrowser(this.platformId);

  private readonly storageKey = 'setrya-auth-session';

  private readonly sessionSignal =
    signal<AuthenticatedSession | null>(
      this.loadStoredSession()
    );

  readonly currentUser = computed<User | null>(
    () => this.sessionSignal()?.user ?? null
  );

  readonly accessToken = computed<string | null>(
    () => this.sessionSignal()?.token ?? null
  );

  readonly isAuthenticated = computed(
    () => this.sessionSignal() !== null
  );

  setSession(session: AuthenticatedSession): boolean {

    if (!this.isTokenActive(session.token)) {
      return false;
    }

    this.sessionSignal.set(session);

    if (this.isBrowser) {
      sessionStorage.setItem(
        this.storageKey,
        JSON.stringify(session)
      );

      // Retirar la sesión simulada anterior.
      localStorage.removeItem('setrya-user');
    }

    return true;
  }

  hasValidSession(): boolean {

    const session = this.sessionSignal();

    if (!session) {
      return false;
    }

    if (!this.isTokenActive(session.token)) {
      this.clear();
      return false;
    }

    return true;
  }

  clear(): void {

    this.sessionSignal.set(null);

    if (this.isBrowser) {
      sessionStorage.removeItem(this.storageKey);
      localStorage.removeItem('setrya-user');
    }

  }

  private loadStoredSession(): AuthenticatedSession | null {

    if (!this.isBrowser) {
      return null;
    }

    const stored = sessionStorage.getItem(
      this.storageKey
    );

    if (!stored) {
      return null;
    }

    try {
      const session = JSON.parse(
        stored
      ) as AuthenticatedSession;

      const role = session?.user?.role;

      const validRole =
        role === UserRole.HOME_OWNER ||
        role === UserRole.IMPLEMENTER;

      if (
        !validRole ||
        typeof session?.user?.email !== 'string' ||
        typeof session?.token !== 'string' ||
        !this.isTokenActive(session.token)
      ) {
        sessionStorage.removeItem(this.storageKey);
        return null;
      }

      return session;

    } catch {
      sessionStorage.removeItem(this.storageKey);
      return null;
    }

  }

  private isTokenActive(token: string): boolean {

    try {

      const payloadPart = token.split('.')[1];

      if (!payloadPart) {
        return false;
      }

      const base64 = payloadPart
        .replace(/-/g, '+')
        .replace(/_/g, '/');

      const padded = base64.padEnd(
        Math.ceil(base64.length / 4) * 4,
        '='
      );

      const payload = JSON.parse(
        atob(padded)
      );

      return (
        typeof payload.exp === 'number' &&
        payload.exp * 1000 > Date.now()
      );

    } catch {
      return false;
    }

  }

}