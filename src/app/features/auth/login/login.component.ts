import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  tenantCode = '';

  errorMessage = '';
  infoMessage = '';
  isLoading = false;

  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  onLogin(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter email and password.';
      return;
    }

    this.errorMessage = '';
    this.infoMessage = '';
    this.isLoading = true;

    const credentials = {
      email: this.email.trim(),
      password: this.password
    };

    this.authService.login(credentials).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (response) => {
        if (response.mustResetPassword) {
          this.router.navigate(['/reset-password']);
          return;
        }

        const role = response.userRole;
        if (role === 'SYSTEM_ADMIN') {
          this.router.navigate(['/admin']);
        } else if (role === 'BANK_ADMIN') {
          this.router.navigate(['/bank']);
        } else if (role === 'COMPLIANCE_OFFICER') {
          this.router.navigate(['/compliance']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (error) => {
        if (error.status === 401) {
          this.errorMessage = 'Invalid email or password.';
        } else if (error.status === 428) {
          this.authService.setMustResetPassword(true);
          this.router.navigate(['/reset-password']);
        } else if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else if (error.error?.error) {
          this.errorMessage = error.error.error;
        } else {
          this.errorMessage = 'Unable to connect to authentication service.';
        }
      }
    });
  }
}
