import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, of } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, ResetPasswordRequest } from '../models/auth.model';
import { User, UserRole } from '../models/user.model';
import { NotificationService } from './notification.service';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'aml_access_token';
  private readonly USER_ROLE_KEY = 'aml_user_role';
  private readonly TENANT_CODE_KEY = 'aml_tenant_code';
  private readonly USER_EMAIL_KEY = 'aml_user_email';
  private readonly MUST_RESET_PASS_KEY = 'aml_must_reset_password';

  currentUser = signal<User | null>(this.getStoredUser());

  private http = inject(HttpClient);
  private router = inject(Router);
  private notificationService = inject(NotificationService);


  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(environment.endpoints.auth.login, credentials).pipe(
      tap((response: LoginResponse) => {
        if (response.accessToken) {
          localStorage.setItem(this.TOKEN_KEY, response.accessToken);
          localStorage.setItem(this.USER_ROLE_KEY, response.userRole);
          localStorage.setItem(this.USER_EMAIL_KEY, credentials.email);

          if (response.tenantCode) {
            localStorage.setItem(this.TENANT_CODE_KEY, response.tenantCode);
          } else {
            localStorage.removeItem(this.TENANT_CODE_KEY);
          }

          if (response.mustResetPassword) {
            localStorage.setItem(this.MUST_RESET_PASS_KEY, 'true');
          } else {
            localStorage.removeItem(this.MUST_RESET_PASS_KEY);
          }

          this.currentUser.set({
            email: credentials.email,
            role: response.userRole as UserRole,
            tenantCode: response.tenantCode || null
          });
        }
      })
    );
  }

  resetPassword(request: ResetPasswordRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(environment.endpoints.auth.resetPassword, request).pipe(
      tap((response: LoginResponse) => {
        if (response.accessToken) {
          localStorage.setItem(this.TOKEN_KEY, response.accessToken);
          localStorage.setItem(this.USER_ROLE_KEY, response.userRole);
        }
        localStorage.removeItem(this.MUST_RESET_PASS_KEY);
      })
    );
  }


  logout(): Observable<void> {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) {
      return of(void 0);
    }

    return this.http.post<void>(
      environment.endpoints.auth.logout,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
  }

  //after logout clearing the sesison
  clearLocalSession(): void {

    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_ROLE_KEY);
    localStorage.removeItem(this.TENANT_CODE_KEY);
    localStorage.removeItem(this.USER_EMAIL_KEY);
    localStorage.removeItem(this.MUST_RESET_PASS_KEY);

    this.notificationService.resetState();

    this.currentUser.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isMustResetPassword(): boolean {
    return localStorage.getItem(this.MUST_RESET_PASS_KEY) === 'true';
  }

  setMustResetPassword(flag: boolean): void {
    if (flag) {
      localStorage.setItem(this.MUST_RESET_PASS_KEY, 'true');
    } else {
      localStorage.removeItem(this.MUST_RESET_PASS_KEY);
    }
  }

  getUserRole(): UserRole | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return null;

    try {
      const decodedToken: any = jwtDecode(token);
      
      return decodedToken.roles[0].replace("ROLE_", "");
    } catch (error) {
      console.error('Invalid Token formate ', error)
      return null;
    }

  }

  getUserEmail(): string | null {
    return localStorage.getItem(this.USER_EMAIL_KEY);
  }

  getTenantCode(): string | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return null;

    try {
      const decodedToken: any = jwtDecode(token);
      console.log("hii",decodedToken.tenantCode);
      return decodedToken.tenantCode

    } catch (error) {
      console.error('Invalid Token formate ', error)
      return null;
    }
  }

  private getStoredUser(): User | null {
    const email = localStorage.getItem(this.USER_EMAIL_KEY);
    // const role = localStorage.getItem(this.USER_ROLE_KEY);
    const role = this.getUserRole();
    const tenantCode = this.getTenantCode();

    if (email && role) {
      return {
        email,
        role: role as UserRole,
        tenantCode: tenantCode || null
      };
    }
    return null;
  }
}
