import {
  computed,
  inject,
  Injectable,
  PLATFORM_ID,
  signal
} from '@angular/core';

import { isPlatformBrowser } from '@angular/common';

import { User } from '../../domain/models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthSessionService {

  private readonly platformId = inject(PLATFORM_ID);

  private readonly isBrowser =
    isPlatformBrowser(this.platformId);

  private readonly storageKey = 'setrya-user';

  private readonly currentUserSignal =
    signal<User | null>(this.loadStoredUser());

  readonly currentUser =
    this.currentUserSignal.asReadonly();

  readonly isAuthenticated =
    computed(() => this.currentUserSignal() !== null);

  setUser(user: User): void {

    this.currentUserSignal.set(user);

    if (this.isBrowser) {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify(user)
      );
    }
  }

  clear(): void {

    this.currentUserSignal.set(null);

    if (this.isBrowser) {
      localStorage.removeItem(this.storageKey);
    }
  }

  private loadStoredUser(): User | null {

    if (!this.isBrowser) {
      return null;
    }

    const storedUser =
      localStorage.getItem(this.storageKey);

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as User;
    } catch {
      localStorage.removeItem(this.storageKey);
      return null;
    }
  }
}
