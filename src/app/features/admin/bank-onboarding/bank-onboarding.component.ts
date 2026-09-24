import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { SystemAdminService } from '../../../core/services/system-admin.service';
import { Tenant } from '../../../core/models/tenant.model';

@Component({
  selector: 'app-bank-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bank-onboarding.component.html',
  styleUrls: ['./bank-onboarding.component.css']
})
export class BankOnboardingComponent implements OnInit {
  tenants: Tenant[] = [];

  isLoading: boolean = false;
  isSubmitting: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  showOnboardForm: boolean = false;

  // New Bank Form fields
  tenantCode: string = '';
  tenantName: string = '';
  displayName: string = '';

  
  private systemAdminService = inject(SystemAdminService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
 

  ngOnInit(): void {
    this.loadTenants();
  }

  loadTenants(): void {
    this.isLoading = true;
    this.systemAdminService.getAllTenants().pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (data) => {
        this.tenants = data || [];
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load onboarded bank tenants.';
      }
    });
  }

  toggleOnboardForm(): void {
    this.showOnboardForm = !this.showOnboardForm;
    this.errorMessage = '';
    this.successMessage = '';
  }

  onOnboardTenant(): void {
    if (!this.tenantCode || !this.tenantName || !this.displayName) {
      this.errorMessage = 'Tenant Code, Tenant Name, and Display Name are required.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const request = {
      tenantCode: this.tenantCode.trim().toUpperCase(),
      tenantName: this.tenantName.trim(),
      displayName: this.displayName.trim()
    };

    this.systemAdminService.onboardTenant(request).pipe(
      finalize(() => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res) => {
        this.successMessage = `Bank '${res.displayName}' (${res.tenantCode}) onboarded successfully!`;
        this.showOnboardForm = false;
        this.resetForm();
        this.loadTenants();
      },
      error: (err) => {
        console.error('Error onboarding tenant:', err);
        this.errorMessage = err.error?.message || err.error?.error || 'Failed to onboard bank tenant.';
      }
    });
  }

  goToAddBankAdmin(tenant: Tenant): void {
    this.router.navigate(['/admin/create-bank-admin'], { queryParams: { tenantId: tenant.tenantId, tenantCode: tenant.tenantCode } });
  }

  private resetForm(): void {
    this.tenantCode = '';
    this.tenantName = '';
    this.displayName = '';
  }
}
