import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { BankAdminService } from '../../../core/services/bank-admin.service';
import {
  AlertResponse,
  AlertDetailResponse,
  AlertStatsResponse,
  AlertSeverity,
  AlertStatus,
  ComplianceOfficerResponse
} from '../../../core/models/bank-admin.model';

@Component({
  selector: 'app-alert-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './alert-management.component.html',
  styleUrls: ['./alert-management.component.css']
})
export class AlertManagementComponent implements OnInit {
  alerts: AlertResponse[] = [];
  stats: AlertStatsResponse | null = null;
  officers: ComplianceOfficerResponse[] = [];

  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  // Filter criteria
  selectedSeverity: AlertSeverity | '' = '';
  selectedStatus: AlertStatus | '' = '';

  // Multi-alert selection for Case Assignment
  selectedAlertIds: string[] = [];

  // Modals state
  showAssignModal = false;
  showDetailModal = false;
  viewingAlertDetail: AlertDetailResponse | null = null;

  // Case Assignment Form
  caseForm = {
    assignedToId: '',
    notes: ''
  };

  private bankAdminService = inject(BankAdminService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadAlertStats();
    this.loadAlerts();
    this.loadOfficers();
  }

  loadAlertStats(): void {
    this.bankAdminService.getAlertStats().subscribe({
      next: (res) => this.stats = res,
      error: () => {}
    });
  }

  loadAlerts(): void {
    this.isLoading = true;
    this.bankAdminService.getAlerts(
      this.selectedSeverity || undefined,
      undefined,
      this.selectedStatus || undefined
    ).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res) => {
        this.alerts = res.content || [];
        this.selectedAlertIds = [];
      },
      error: (err) => this.errorMessage = err.error?.message || 'Failed to load transaction alerts.'
    });
  }

  loadOfficers(): void {
    this.bankAdminService.getComplianceOfficers().subscribe({
      next: (res) => this.officers = (res.content || []).filter(o => o.isActive),
      error: () => {}
    });
  }

  toggleSelectAll(event: any): void {
    if (event.target.checked) {
      this.selectedAlertIds = this.alerts.map(a => a.alertId);
    } else {
      this.selectedAlertIds = [];
    }
  }

  toggleAlertSelection(alertId: string): void {
    const index = this.selectedAlertIds.indexOf(alertId);
    if (index > -1) {
      this.selectedAlertIds.splice(index, 1);
    } else {
      this.selectedAlertIds.push(alertId);
    }
  }

  isSelected(alertId: string): boolean {
    return this.selectedAlertIds.includes(alertId);
  }

  openAssignModal(): void {
    if (this.selectedAlertIds.length === 0) {
      this.errorMessage = 'Please select at least one alert to assign to a case.';
      return;
    }
    this.showAssignModal = true;
    this.errorMessage = '';
    this.successMessage = '';
    if (this.officers.length > 0) {
      this.caseForm.assignedToId = this.officers[0].userId;
    }
  }

  closeAssignModal(): void {
    this.showAssignModal = false;
  }

  onAssignAlerts(): void {
    if (!this.caseForm.assignedToId) {
      this.errorMessage = 'Please select a compliance officer.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const request = {
      alertIds: this.selectedAlertIds,
      assignedToId: this.caseForm.assignedToId,
      notes: this.caseForm.notes.trim() || undefined
    };

    this.bankAdminService.assignAlertsToCase(request).pipe(
      finalize(() => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res) => {
        this.successMessage = `Case '${res.caseCode}' created successfully with ${this.selectedAlertIds.length} alert(s) assigned!`;
        this.showAssignModal = false;
        this.selectedAlertIds = [];
        this.loadAlerts();
        this.loadAlertStats();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to create case and assign alerts.';
      }
    });
  }

  openAlertDetail(alertId: string): void {
    this.bankAdminService.getAlertDetail(alertId).subscribe({
      next: (res) => {
        this.viewingAlertDetail = res;
        this.showDetailModal = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to fetch alert details.';
      }
    });
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.viewingAlertDetail = null;
  }
}
