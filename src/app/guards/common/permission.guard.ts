import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/models/auth.service';

export const permissionGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const perms = route.data['permissions'] as string[] | undefined;
  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }
  if (!perms || perms.length === 0) {
    return true;
  }
  return authService.hasAnyPermission(perms) ? true : router.createUrlTree(['/']);
};
