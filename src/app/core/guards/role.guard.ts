import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isMustResetPassword() && !state.url.includes('/reset-password')) {
    router.navigate(['/reset-password']);
    return false;
  }

  const expectedRole = route.data['expectedRole'] as UserRole;
  const userRole = authService.getUserRole();

  if (userRole && userRole === expectedRole) {
    return true;
  }

  if (userRole === 'SYSTEM_ADMIN') {
    router.navigate(['/admin']);
  } else if (userRole === 'BANK_ADMIN') {
    router.navigate(['/bank']);
  } else if (userRole === 'COMPLIANCE_OFFICER') {
    router.navigate(['/compliance']);
  } else {
    router.navigate(['/login']);
  }

  return false;
};
