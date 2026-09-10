import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { BankAdminService } from '../../../core/services/bank-admin.service';
import { ComplianceOfficerResponse, ComplianceOfficerWorkloadResponse } from '../../../core/models/bank-admin.model';

@Component({
  selector: 'app-officer-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './officer-management.component.html',
  styleUrls: ['./officer-management.component.css']
})
export class OfficerManagementComponent implements OnInit {
  officers: ComplianceOfficerResponse[] = [];
  workloads: ComplianceOfficerWorkloadResponse[] = [];

  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  showCreateForm = false;

  // Form for adding a new compliance officer
  officerForm = {
    userCode: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    employeeId: ''
  };

  private bankAdminService = inject(BankAdminService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadOfficers();
    this.loadWorkloads();
  }

  loadOfficers(): void {
    this.isLoading = true;
    this.bankAdminService.getComplianceOfficers().pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res) => this.officers = res.content || [],
      error: (err) => this.errorMessage = err.error?.message || 'Failed to load compliance officers.'
    });
  }

  loadWorkloads(): void {
    this.bankAdminService.getComplianceOfficerWorkloads().subscribe({
      next: (res) => {
        this.workloads = res || [];
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  getWorkloadForOfficer(officerId: string): number {
    if (!this.workloads || !officerId) return 0;
    const w = this.workloads.find(item => (item.userId || item.officerId) === officerId);
    return w ? w.activeCaseCount : 0;
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    this.errorMessage = '';
    this.successMessage = '';
  }

  onCreateOfficer(): void {
    if (!this.officerForm.userCode || !this.officerForm.firstName || !this.officerForm.lastName || !this.officerForm.email) {
      this.errorMessage = 'Please fill in required fields (User Code, First Name, Last Name, Email).';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const userCodeTrimmed = this.officerForm.userCode.trim().toUpperCase();
    const empId = this.officerForm.employeeId.trim() || `EMP-${userCodeTrimmed}`;

    const request = {
      userCode: userCodeTrimmed,
      firstName: this.officerForm.firstName.trim(),
      lastName: this.officerForm.lastName.trim(),
      email: this.officerForm.email.trim(),
      phoneNumber: this.officerForm.phoneNumber.trim() || undefined,
      employeeId: empId
    };

    this.bankAdminService.createComplianceOfficer(request).pipe(
      finalize(() => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res) => {
        this.successMessage = `Compliance Officer '${res.firstName} ${res.lastName}' (${res.email}) created successfully!`;
        this.showCreateForm = false;
        this.resetForm();
        this.loadOfficers();
      },
      error: (err) => {
        const errObj = err.error;
        if (typeof errObj === 'string') {
          this.errorMessage = errObj;
        } else if (errObj && errObj.message) {
          this.errorMessage = errObj.message;
        } else if (errObj && errObj.error) {
          this.errorMessage = errObj.error;
        } else {
          this.errorMessage = 'Failed to create compliance officer. Please check if user code or email already exists.';
        }
      }
    });
  }

  toggleStatus(officer: ComplianceOfficerResponse): void {
    const action = officer.isActive ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} Officer '${officer.firstName} ${officer.lastName}'?`)) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    const obs = officer.isActive
      ? this.bankAdminService.deactivateComplianceOfficer(officer.userId)
      : this.bankAdminService.activateComplianceOfficer(officer.userId);

    obs.subscribe({
      next: () => {
        this.successMessage = `Officer '${officer.firstName} ${officer.lastName}' ${action}d successfully!`;
        this.loadOfficers();
        this.loadWorkloads();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || `Failed to ${action} officer.`;
        this.cdr.detectChanges();
      }
    });
  }

  onResetPassword(officer: ComplianceOfficerResponse): void {
    if (!confirm(`Are you sure you want to reset password for '${officer.email}'?`)) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    this.bankAdminService.resetComplianceOfficerPassword(officer.userId).subscribe({
      next: () => {
        this.successMessage = `Temporary password email sent to '${officer.email}'!`;
        this.loadOfficers();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to reset password.';
        this.cdr.detectChanges();
      }
    });
  }

  private resetForm(): void {
    this.officerForm = {
      userCode: '',
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      employeeId: ''
    };
  }
}
