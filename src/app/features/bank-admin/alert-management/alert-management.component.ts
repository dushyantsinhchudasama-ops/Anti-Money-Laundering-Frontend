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

  // Pagination state
  currentPage = 0;
  pageSize = 20;
  totalPages = 0;
  totalElements = 0;

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
    this.loadAlerts(0);
    this.loadOfficers();
  }

  loadAlertStats(): void {
    this.bankAdminService.getAlertStats().subscribe({
      next: (res) => this.stats = res,
      error: () => { }
    });
  }

  loadAlerts(page: number = 0): void {
    this.currentPage = page;
    this.isLoading = true;
    this.bankAdminService.getAlerts(
      this.selectedSeverity || undefined,
      undefined,
      this.selectedStatus || undefined,
      undefined,
      undefined,
      this.currentPage,
      this.pageSize
    ).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res) => {
        this.alerts = res.content || [];
        this.totalElements = res.totalElements || this.alerts.length;
        this.totalPages = res.totalPages || (this.totalElements > 0 ? Math.ceil(this.totalElements / this.pageSize) : 1);
        this.selectedAlertIds = [];
      },
      error: (err) => this.errorMessage = err.error?.message || 'Failed to load transaction alerts.'
    });
  }

  onPageSizeChange(newSize: any): void {
    this.pageSize = Number(newSize);
    this.loadAlerts(0);
  }

  goToPage(page: number): void {
    if (page >= 0 && (this.totalPages === 0 || page < this.totalPages)) {
      this.loadAlerts(page);
    }
  }

  get minRecordIndex(): number {
    if (this.totalElements === 0) return 0;
    return this.currentPage * this.pageSize + 1;
  }

  get maxRecordIndex(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.totalElements);
  }

  loadOfficers(): void {
    this.bankAdminService.getComplianceOfficers(0, 100).subscribe({
      next: (res) => {
        this.officers = (res.content || []).filter(o => o.isActive);
        if (this.officers.length > 0 && !this.caseForm.assignedToId) {
          this.caseForm.assignedToId = this.officers[0].userId;
        }
      },
      error: () => { }
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
    if (this.officers.length === 0) {
      this.loadOfficers();
    }
    this.showAssignModal = true;
    this.errorMessage = '';
    this.successMessage = '';
    if (this.officers.length > 0 && !this.caseForm.assignedToId) {
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

    const notesContent = this.caseForm.notes.trim() || undefined;
    const request = {
      alertIds: this.selectedAlertIds,
      assigneeId: this.caseForm.assignedToId,
      assignedToId: this.caseForm.assignedToId,
      initialNote: notesContent,
      notes: notesContent
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
        this.caseForm.notes = '';
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
