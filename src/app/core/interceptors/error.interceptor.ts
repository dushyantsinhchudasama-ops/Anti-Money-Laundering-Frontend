import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';


export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);


  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isLoginRequest = req.url.includes('/auth/login');

      if (error.status === 401 && !isLoginRequest) {
        // Token expired or invalid during an authenticated request: auto-logout
        authService.logout().subscribe({
          next:(next:any)=>{
            authService.clearLocalSession();
          router.navigate(['/'], { replaceUrl: true });

          },
          error:(error:any) =>
          {
            console.log(error);
          }
        });
      } else if (error.status === 428) {
        // Mandatory password reset required by backend JwtAuthenticationFilter
        console.warn('Password reset required before accessing system resources.');
      } else if (error.status === 403) {
        console.error('Access Denied: You do not have permission for this resource.');
      }

      return throwError(() => error);
    })
  );
};
