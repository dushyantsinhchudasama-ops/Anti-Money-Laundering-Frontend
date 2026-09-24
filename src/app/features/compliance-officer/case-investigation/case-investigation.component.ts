import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ComplianceOfficerService } from '../../../core/services/compliance-officer.service';
import {
  CaseInvestigationResponse,
  CaseNoteResponse,
  NoteType,
  SarStrPreviewResponse,
  SarStrFilingRequest,
  SarStrFilingResponse
} from '../../../core/models/compliance-officer.model';

@Component({
  selector: 'app-case-investigation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './case-investigation.component.html',
  styleUrls: ['./case-investigation.component.css']
})
export class CaseInvestigationComponent implements OnInit {
  caseId: string = '';
  investigationData: CaseInvestigationResponse | null = null;
  caseNotes: CaseNoteResponse[] = [];

  isClosedCase(status?: string): boolean {
    if (!status) return false;
    return status === 'CLOSED_NO_ACTION' || status === 'CLOSED_SAR_FILED' || status === 'SAR_FILED';
  }

  isSarFiledCase(status?: string): boolean {
    if (!status) return false;
    return status === 'CLOSED_SAR_FILED' || status === 'SAR_FILED';
  }


  activeTab: 'overview' | 'profile' | 'history' | 'notes' = 'overview';
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  // New Note Form
  newNoteText = '';
  selectedNoteType: NoteType = 'OBSERVATION';

  // Close Case (No Action) Modal
  showCloseModal = false;
  closeRationale = '';

  // File SAR/STR Modal
  showSarModal = false;
  sarPreview: SarStrPreviewResponse | null = null;
  sarForm: SarStrFilingRequest = {
    reportType: 'SAR',
    typologyCategory: 'LAYERING',
    descriptionOfActivity: '',
    basisForSuspicion: '',
    supportingEvidence: ''
  };

  sarFilingResult: SarStrFilingResponse | null = null;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private complianceService = inject(ComplianceOfficerService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.caseId = this.route.snapshot.paramMap.get('caseId') || '';
    if (this.caseId) {
      this.loadInvestigationData();
      this.loadCaseNotes();
    } else {
      this.errorMessage = 'No case ID provided.';
    }
  }

  loadInvestigationData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.complianceService.getCaseInvestigationData(this.caseId).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res) => {
        this.investigationData = res;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load case investigation data.';
      }
    });
  }

  loadCaseNotes(): void {
    this.complianceService.getCaseNotes(this.caseId).subscribe({
      next: (notes) => {
        this.caseNotes = notes || [];
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  startInvestigation(): void {
    this.isSubmitting = true;
    this.complianceService.startInvestigation(this.caseId).pipe(
      finalize(() => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.successMessage = 'Investigation status updated to IN PROGRESS.';
        this.loadInvestigationData();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to update case status.';
      }
    });
  }

  onAddNote(): void {
    const text = this.newNoteText.trim();
    if (!text) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    const payload = {
      noteType: this.selectedNoteType || 'OBSERVATION',
      content: text,
      noteText: text
    };

    this.complianceService.createCaseNote(this.caseId, payload).pipe(
      finalize(() => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.newNoteText = '';
        this.selectedNoteType = 'OBSERVATION';
        this.loadCaseNotes();
        this.successMessage = 'Case note recorded successfully.';
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to add case note.';
      }
    });
  }

  // --- Close No Action (False Positive) ---

  openCloseModal(): void {
    this.closeRationale = '';
    this.showCloseModal = true;
  }

  closeCloseModal(): void {
    this.showCloseModal = false;
    this.closeRationale = '';
  }

  onCloseCaseNoAction(): void {
    if (!this.closeRationale.trim()) {
      this.errorMessage = 'Please provide a justification rationale for closing the case.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.complianceService.closeCaseNoAction(this.caseId, { rationale: this.closeRationale.trim() }).pipe(
      finalize(() => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.showCloseModal = false;
        this.successMessage = 'Case closed with NO ACTION (False Positive).';
        this.loadInvestigationData();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to close case.';
      }
    });
  }

  // --- File SAR / STR Report ---

  openSarModal(): void {
    this.showSarModal = true;
    this.sarFilingResult = null;
    this.errorMessage = '';

    this.complianceService.getSarStrPreview(this.caseId).subscribe({
      next: (preview) => {
        this.sarPreview = preview;
        this.sarForm.descriptionOfActivity = preview.suggestedNarrative || `Suspicious activity detected on account ${preview.primaryAccountNo} triggering ${preview.alertCount} alert(s) totaling ${preview.totalAlertAmount}.`;
        this.sarForm.basisForSuspicion = preview.triggeringRulesSummary || 'Observed transaction patterns violating regulatory threshold and rule engine policies.';
        this.sarForm.supportingEvidence = `Account ${preview.primaryAccountNo} transaction history and rule alert telemetry evidence.`;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load SAR/STR preview data.';
      }
    });
  }

  closeSarModal(): void {
    this.showSarModal = false;
    this.sarPreview = null;
    this.sarFilingResult = null;
  }

  onFileSarStr(): void {
    if (!this.sarForm.descriptionOfActivity.trim() || !this.sarForm.basisForSuspicion.trim() || !this.sarForm.supportingEvidence.trim()) {
      this.errorMessage = 'Please complete activity description, basis for suspicion, and supporting evidence.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.complianceService.fileSarStr(this.caseId, this.sarForm).pipe(
      finalize(() => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res) => {
        this.sarFilingResult = res;
        this.successMessage = `Regulatory ${res.reportType} report filed successfully! Ref No: ${res.referenceNumber}`;
        this.loadInvestigationData();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to file SAR/STR report.';
      }
    });
  }

  downloadPdf(): void {
    this.complianceService.downloadSarStrPdf(this.caseId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `SAR-STR-${this.caseId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to download PDF export.';
        this.cdr.detectChanges();
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/compliance/cases']);
  }
}
