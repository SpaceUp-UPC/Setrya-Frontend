import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthSessionService } from '../../application/services/auth-session.service';
import { UserRole } from '../../domain/enums/user-role';

export const roleGuard = (
  allowedRole: UserRole
): CanActivateFn => () => {

  const session = inject(AuthSessionService);
  const router = inject(Router);

  if (!session.hasValidSession()) {
    return router.createUrlTree(['/login']);
  }

  const user = session.currentUser();

  if (user?.role === allowedRole) {
    return true;
  }

  const destination =
    user?.role === UserRole.IMPLEMENTER
      ? '/implementer'
      : '/dashboard';

  return router.createUrlTree([destination]);

};