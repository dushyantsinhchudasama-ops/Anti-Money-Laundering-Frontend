import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  let outgoingReq = req;

  // Attach token only for protected non-auth endpoints
  if (token && !req.url.includes('/auth/')) {
    outgoingReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  // Intercept the HTTP response and handle 401 Unauthorized errors
  return next(outgoingReq).pipe(
    catchError((error: HttpErrorResponse) => {
      console.log(error);
      if (error.status === 401) {
        // 1. Clear session/token details from local storage or signal state
          // console.log("00000000000000000000000000000000000000")
        // 2. Redirect user to login page
        authService.clearLocalSession();
        router.navigate(['/login']);
      }

      return throwError(() => error);
    })
  );
};