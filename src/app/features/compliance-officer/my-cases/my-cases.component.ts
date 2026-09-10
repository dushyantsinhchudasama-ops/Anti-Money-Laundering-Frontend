import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ComplianceOfficerService } from '../../../core/services/compliance-officer.service';
import { CaseResponse, CaseStatus } from '../../../core/models/bank-admin.model';

@Component({
  selector: 'app-my-cases',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-cases.component.html',
  styleUrls: ['./my-cases.component.css']
})
export class MyCasesComponent implements OnInit {
  cases: CaseResponse[] = [];
  isLoading = false;
  errorMessage = '';

  selectedStatus: CaseStatus | '' = '';
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  private complianceService = inject(ComplianceOfficerService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadCases();
  }

  loadCases(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.complianceService.getAssignedCases(
      this.selectedStatus || undefined,
      this.currentPage,
      this.pageSize
    ).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res) => {
        this.cases = res.content || [];
        this.totalPages = res.totalPages || 0;
        this.totalElements = res.totalElements || 0;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load assigned cases.';
      }
    });
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.loadCases();
  }

  onPageChange(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadCases();
    }
  }

  startInvestigation(caseId: string, event: Event): void {
    event.stopPropagation();
    this.complianceService.startInvestigation(caseId).subscribe({
      next: () => {
        this.router.navigate(['/compliance/cases', caseId, 'investigate']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to start investigation.';
        this.cdr.detectChanges();
      }
    });
  }

  goToInvestigation(caseId: string): void {
    this.router.navigate(['/compliance/cases', caseId, 'investigate']);
  }
}
