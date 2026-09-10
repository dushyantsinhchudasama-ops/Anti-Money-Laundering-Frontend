import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { BankAdminService } from '../../../core/services/bank-admin.service';
import { CaseResponse, CaseStatus, ComplianceOfficerResponse } from '../../../core/models/bank-admin.model';

@Component({
  selector: 'app-case-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './case-management.component.html',
  styleUrls: ['./case-management.component.css']
})
export class CaseManagementComponent implements OnInit {
  cases: CaseResponse[] = [];
  officers: ComplianceOfficerResponse[] = [];

  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  selectedStatus: CaseStatus | '' = '';
  selectedOfficerId: string = '';

  // Modals state
  showDetailModal = false;
  showReassignModal = false;
  viewingCase: CaseResponse | null = null;
  reassigningCase: CaseResponse | null = null;

  // Reassign form
  reassignForm = {
    newAssignedToId: '',
    reassignmentNotes: ''
  };

  private bankAdminService = inject(BankAdminService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadCases();
    this.loadOfficers();
  }

  loadCases(): void {
    this.isLoading = true;
    this.bankAdminService.getCases(
      this.selectedStatus || undefined,
      this.selectedOfficerId || undefined
    ).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res) => this.cases = res.content || [],
      error: (err) => this.errorMessage = err.error?.message || 'Failed to load cases.'
    });
  }

  loadOfficers(): void {
    this.bankAdminService.getComplianceOfficers().subscribe({
      next: (res) => this.officers = (res.content || []).filter(o => o.isActive),
      error: () => { }
    });
  }

  openDetailModal(caseId: string): void {
    this.bankAdminService.getCaseDetail(caseId).subscribe({
      next: (res) => {
        this.viewingCase = res;
        this.showDetailModal = true;
        this.cdr.detectChanges();
      },
      error: (err) => this.errorMessage = err.error?.message || 'Failed to fetch case detail.'
    });
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.viewingCase = null;
  }

  openReassignModal(caseItem: CaseResponse): void {
    if (caseItem.status === 'CLOSED_NO_ACTION' || caseItem.status === 'CLOSED_SAR_FILED' || caseItem.status === 'SAR_FILED') {
      this.errorMessage = `Cannot reassign closed case ${caseItem.caseCode}.`;
      return;
    }
    this.reassigningCase = caseItem;
    this.showReassignModal = true;
    this.errorMessage = '';
    this.successMessage = '';
    if (this.officers.length > 0) {
      this.reassignForm.newAssignedToId = this.officers[0].userId;
    }
  }

  closeReassignModal(): void {
    this.showReassignModal = false;
    this.reassigningCase = null;
  }

  onReassignCase(): void {
    if (!this.reassigningCase || !this.reassignForm.newAssignedToId) {
      this.errorMessage = 'Please select a new compliance officer.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const reassignNote = this.reassignForm.reassignmentNotes.trim() || undefined;
    const request = {
      newAssigneeId: this.reassignForm.newAssignedToId,
      newAssignedToId: this.reassignForm.newAssignedToId,
      reason: reassignNote,
      reassignmentNotes: reassignNote
    };

    this.bankAdminService.reassignCase(this.reassigningCase.caseId, request).pipe(
      finalize(() => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res) => {
        this.successMessage = `Case '${res.caseCode}' reassigned successfully!`;
        this.showReassignModal = false;
        this.reassigningCase = null;
        this.loadCases();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to reassign case.';
      }
    });
  }
}
