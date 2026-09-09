import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  email = '';
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  errorMessage = '';
  successMessage = '';
  isLoading = false;

  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    const storedEmail = this.authService.getUserEmail();
    if (storedEmail) {
      this.email = storedEmail;
    }
  }

  onResetPassword(): void {
    if (!this.email || !this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'Please fill in all password reset fields.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'New password and confirm password do not match.';
      return;
    }

    if (this.newPassword.length < 8) {
      this.errorMessage = 'New password must be at least 8 characters long.';
      return;
    }

    if (this.newPassword === this.currentPassword) {
      this.errorMessage = 'New password must be different from current temporary password.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const request = {
      email: this.email.trim(),
      tenantCode: this.authService.getTenantCode() || undefined,
      currentPassword: this.currentPassword,
      newPassword: this.newPassword,
      confirmPassword: this.confirmPassword
    };

    this.authService.resetPassword(request).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (response) => {
        this.successMessage = 'Password updated successfully! Redirecting to your dashboard...';
        setTimeout(() => {
          const role = response.userRole || this.authService.getUserRole();
          if (role === 'SYSTEM_ADMIN') {
            this.router.navigate(['/admin']);
          } else if (role === 'BANK_ADMIN') {
            this.router.navigate(['/bank']);
          } else if (role === 'COMPLIANCE_OFFICER') {
            this.router.navigate(['/compliance']);
          } else {
            this.router.navigate(['/']);
          }
        }, 1500);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || error.error?.error || 'Failed to reset password. Please check your credentials.';
      }
    });
  }

  onLogout(): void {
    this.authService.logout();
  }
}
