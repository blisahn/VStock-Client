import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/models/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }
  const roles = route.data['roles'] as string[] | undefined;
  if (!roles || roles.length === 0) return true;
  return authService.hasAnyRole(roles) ? true : router.createUrlTree(['/']);
};




