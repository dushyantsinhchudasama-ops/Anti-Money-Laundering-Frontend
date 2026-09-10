import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

//  attaches the JWT Bearer token to all outgoing API requests EXCEPT authentication endpoints (/auth/**).

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // attach token only for protected non-auth endpoints
  if (token && !req.url.includes('/auth/')) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(authReq);
  }

  // skip token for auth endpoints or when token is not present
  return next(req);
};
