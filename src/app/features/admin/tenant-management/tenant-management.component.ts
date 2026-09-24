import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { SystemAdminService } from '../../../core/services/system-admin.service';
import { BankAdminSummary, Tenant, TenantStatus } from '../../../core/models/tenant.model';

@Component({
  selector: 'app-tenant-management',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './tenant-management.component.html',
  styleUrls: ['./tenant-management.component.css']
})
export class TenantManagementComponent implements OnInit {
  tenants: Tenant[] = [];
  selectedTenantId = '';
  selectedTenant: Tenant | null = null;
  tenantAdmins: BankAdminSummary[] = [];
  searchTerm = '';
  isLoading = false;
  isSaving = false;
  feedbackMessage = '';
  feedbackType: 'success' | 'error' | '' = '';

  private systemAdminService = inject(SystemAdminService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadTenants();
  }

  get filteredTenants(): Tenant[] {
    if (!this.searchTerm.trim()) {
      return this.tenants;
    }

    const term = this.searchTerm.toLowerCase();
    return this.tenants.filter((tenant) =>
      tenant.tenantCode.toLowerCase().includes(term) ||
      tenant.displayName.toLowerCase().includes(term) ||
      tenant.tenantName.toLowerCase().includes(term)
    );
  }

  loadTenants(): void {
    this.isLoading = true;
    this.feedbackMessage = '';
    this.feedbackType = '';

    this.systemAdminService.getAllTenants().pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (tenants) => {
        this.tenants = tenants || [];
        this.searchTerm = '';
        if (this.selectedTenantId) {
          this.selectTenantById(this.selectedTenantId);
        } else if (this.tenants.length > 0) {
          this.selectTenantById(this.tenants[0].tenantId);
        } else {
          this.selectedTenantId = '';
          this.selectedTenant = null;
          this.tenantAdmins = [];
        }
      },
      error: () => {
        this.feedbackMessage = 'Unable to load tenants.';
        this.feedbackType = 'error';
      }
    });
  }

  selectTenantById(tenantId: string): void {
    const tenant = this.tenants.find((item) => item.tenantId === tenantId) || null;
    this.selectedTenantId = tenant?.tenantId || '';
    this.selectedTenant = tenant;
    this.searchTerm = '';

    if (tenant) {
      this.loadBankAdminsForSelectedTenant(tenant.tenantId);
    } else {
      this.tenantAdmins = [];
    }
  }

  loadBankAdminsForSelectedTenant(tenantId: string): void {
    this.systemAdminService.getBankAdminsForTenant(tenantId).subscribe({
      next: (admins) => {
        this.tenantAdmins = admins || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.tenantAdmins = [];
        this.feedbackMessage = err.error?.message || 'Unable to load bank admins for this tenant.';
        this.feedbackType = 'error';
      }
    });
  }

  get tenantStatusLabel(): string {
    return this.selectedTenant?.status || 'ACTIVE';
  }

  get tenantStatusBadgeClass(): string {
    switch (this.selectedTenant?.status) {
      case 'ACTIVE': return 'status-active';
      case 'SUSPENDED': return 'status-suspended';
      case 'OFFBOARDED': return 'status-offboarded';
      default: return 'status-onboarding';
    }
  }

  toggleTenantStatus(): void {
    const tenant = this.selectedTenant;
    if (!tenant || tenant.status === 'OFFBOARDED') {
      return;
    }

    const nextStatus: TenantStatus = tenant.status === 'ACTIVE' || tenant.status === 'ONBOARDING'
      ? 'SUSPENDED'
      : 'ACTIVE';

    const actionLabel = nextStatus === 'SUSPENDED' ? 'suspend' : 'activate';
    if (!confirm(`Are you sure you want to ${actionLabel} tenant '${tenant.tenantName}'?`)) {
      return;
    }

    this.isSaving = true;
    this.systemAdminService.updateTenantStatus(tenant.tenantId, nextStatus).pipe(
      finalize(() => {
        this.isSaving = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (updatedTenant: Tenant) => {
        this.selectedTenant = updatedTenant;
        this.tenants = this.tenants.map((item) => item.tenantId === updatedTenant.tenantId ? updatedTenant : item);
        this.feedbackMessage = `Tenant '${updatedTenant.tenantName}' has been ${nextStatus === 'SUSPENDED' ? 'suspended' : 'activated'} successfully.`;
        this.feedbackType = 'success';
      },
      error: (err) => {
        this.feedbackMessage = err.error?.message || 'Unable to update tenant status.';
        this.feedbackType = 'error';
      }
    });
  }

  offboardTenant(): void {
    const tenant = this.selectedTenant;
    if (!tenant || tenant.status === 'OFFBOARDED') {
      return;
    }

    if (!confirm(`Are you sure you want to offboard tenant '${tenant.tenantName}'? This will change the tenant status to OFFBOARDED.`)) {
      return;
    }

    this.isSaving = true;
    this.systemAdminService.updateTenantStatus(tenant.tenantId, 'OFFBOARDED').pipe(
      finalize(() => {
        this.isSaving = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (updatedTenant: Tenant) => {
        this.selectedTenant = updatedTenant;
        this.tenants = this.tenants.map((item) => item.tenantId === updatedTenant.tenantId ? updatedTenant : item);
        this.feedbackMessage = `Tenant '${updatedTenant.tenantName}' has been offboarded successfully.`;
        this.feedbackType = 'success';
      },
      error: (err) => {
        this.feedbackMessage = err.error?.message || 'Unable to offboard tenant.';
        this.feedbackType = 'error';
      }
    });
  }

  navigateToAddBankAdmin(): void {
    if (!this.selectedTenant) {
      this.feedbackMessage = 'Please select a tenant before adding a bank admin.';
      this.feedbackType = 'error';
      return;
    }

    if (this.selectedTenant.status === 'OFFBOARDED') {
      this.feedbackMessage = 'This tenant is offboarded. Add a bank admin is not available for offboarded tenants.';
      this.feedbackType = 'error';
      return;
    }

    this.router.navigate(['/admin/create-bank-admin'], {
      queryParams: { tenantId: this.selectedTenant.tenantId }
    });
  }

  goToOnboardNewBank(): void {
    this.router.navigate(['/admin/banks']);
  }

  toggleTenantAdminStatus(admin: BankAdminSummary): void {
    if (!this.selectedTenant) {
      return;
    }

    const nextState = !admin.isActive;
    if (!confirm(`Are you sure you want to ${nextState ? 'activate' : 'deactivate'} bank admin '${admin.firstName} ${admin.lastName}'?`)) {
      return;
    }

    this.isSaving = true;
    this.systemAdminService.toggleBankAdminStatus(this.selectedTenant.tenantId, admin.userId, admin.isActive).pipe(
      finalize(() => {
        this.isSaving = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (updated) => {
        this.tenantAdmins = this.tenantAdmins.map((item) => item.userId === updated.userId ? updated : item);
        this.feedbackMessage = `${updated.firstName} ${updated.lastName} ${updated.isActive ? 'activated' : 'deactivated'} successfully.`;
        this.feedbackType = 'success';
      },
      error: (err) => {
        this.feedbackMessage = err.error?.message || 'Failed to update bank admin status.';
        this.feedbackType = 'error';
      }
    });
  }

  resetBankAdminPassword(admin: BankAdminSummary): void {
    if (!this.selectedTenant) {
      return;
    }

    if (!confirm(`Are you sure you want to reset the password for '${admin.email}'?`)) {
      return;
    }

    this.isSaving = true;
    this.systemAdminService.resetBankAdminPassword(this.selectedTenant.tenantId, admin.userId).pipe(
      finalize(() => {
        this.isSaving = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (updated) => {
        this.tenantAdmins = this.tenantAdmins.map((item) => item.userId === updated.userId ? updated : item);
        this.feedbackMessage = `Password reset email sent to ${updated.email}.`;
        this.feedbackType = 'success';
      },
      error: (err) => {
        this.feedbackMessage = err.error?.message || 'Failed to reset password.';
        this.feedbackType = 'error';
      }
    });
  }
}
