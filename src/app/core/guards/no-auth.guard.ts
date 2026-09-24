import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const noAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    if (authService.isMustResetPassword()) {
      router.navigate(['/reset-password'], { replaceUrl: true });
      return false;
    }

    const role = authService.getUserRole();
    if (role === 'SYSTEM_ADMIN') {
      router.navigate(['/admin'], { replaceUrl: true });
    } else if (role === 'BANK_ADMIN') {
      router.navigate(['/bank'], { replaceUrl: true });
    } else if (role === 'COMPLIANCE_OFFICER') {
      router.navigate(['/compliance'], { replaceUrl: true });
    } else {
      authService.logout().subscribe({
        next:(msg: any)=>{
          authService.clearLocalSession();
          router.navigate(['/'], { replaceUrl: true });
        },
        error:(err:any)=>{
          console.log(err);
        }
      });
    }
    return false;
  }

  return true;
};
