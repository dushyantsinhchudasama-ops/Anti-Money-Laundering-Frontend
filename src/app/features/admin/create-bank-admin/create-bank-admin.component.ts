import { Component, OnInit, ChangeDetectorRef, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { SystemAdminService } from '../../../core/services/system-admin.service';
import { Tenant } from '../../../core/models/tenant.model';

@Component({
  selector: 'app-create-bank-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-bank-admin.component.html',
  styleUrls: ['./create-bank-admin.component.css']
})
export class CreateBankAdminComponent implements OnInit {
  tenants: Tenant[] = [];
  selectedTenantId: string = '';
  selectedTenant: Tenant | null = null;

  userCode: string = '';
  firstName: string = '';
  lastName: string = '';
  email: string = '';
  phoneNumber: string = '';
  employeeId: string = '';

  isLoadingTenants: boolean = false;
  isSubmitting: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  private systemAdminService = inject(SystemAdminService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
 

  ngOnInit(): void {
    this.loadTenants();
  }

  loadTenants(): void {
    this.isLoadingTenants = true;
    this.systemAdminService.getAllTenants().pipe(
      finalize(() => {
        this.isLoadingTenants = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (data) => {
        this.tenants = data || [];

        const paramTenantId = this.route.snapshot.queryParamMap.get('tenantId');
        if (paramTenantId && this.tenants.some(t => t.tenantId === paramTenantId)) {
          this.selectedTenantId = paramTenantId;
        } else {
          this.selectedTenantId = '';
        }

        this.selectedTenant = this.tenants.find(t => t.tenantId === this.selectedTenantId) || null;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load tenant banks.';
      }
    });
  }

  onCreateBankAdmin(): void {
    if (!this.selectedTenantId || !this.userCode || !this.firstName || !this.lastName || !this.email) {
      this.errorMessage = 'Please select a Bank Tenant and fill in all required fields (User Code, Name, Email).';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const request = {
      userCode: this.userCode.trim().toUpperCase(),
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      email: this.email.trim(),
      phoneNumber: this.phoneNumber.trim() || undefined,
      employeeId: this.employeeId.trim() || undefined
    };

    this.systemAdminService.createBankAdmin(this.selectedTenantId, request).pipe(
      finalize(() => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res) => {
        this.successMessage = `Bank Admin user '${res.firstName} ${res.lastName}' (${res.email}) created successfully for tenant!`;
        this.resetForm();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || err.error?.error || 'Failed to create Bank Admin user.';
      }
    });
  }

  goToBankList(): void {
    this.router.navigate(['/admin/tenants']);
  }

  private resetForm(): void {
    this.userCode = '';
    this.firstName = '';
    this.lastName = '';
    this.email = '';
    this.phoneNumber = '';
    this.employeeId = '';
  }
}
