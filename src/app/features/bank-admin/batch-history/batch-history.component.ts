import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { BankAdminService } from '../../../core/services/bank-admin.service';
import { BatchUploadResponse, BatchStatus } from '../../../core/models/bank-admin.model';

@Component({
  selector: 'app-batch-history',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './batch-history.component.html',
  styleUrls: ['./batch-history.component.css']
})
export class BatchHistoryComponent implements OnInit {
  batches: BatchUploadResponse[] = [];
  filteredBatches: BatchUploadResponse[] = [];
  isLoading = false;
  errorMessage = '';

  // Search & Filter
  searchTerm = '';
  selectedStatus: string = 'ALL';

  // Modal State
  selectedBatch: BatchUploadResponse | null = null;
  isModalOpen = false;
  isLoadingDetail = false;
  modalErrorMessage = '';

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  // Overview Stats
  stats = {
    totalBatches: 0,
    totalRecordsProcessed: 0,
    totalAlertsGenerated: 0,
    rejectedBatchesCount: 0
  };

  private bankAdminService = inject(BankAdminService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadBatches();
  }

  loadBatches(page: number = 0): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.currentPage = page;

    this.bankAdminService.getBatches(this.currentPage, this.pageSize).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res) => {
        this.batches = res.content || [];
        this.totalPages = res.totalPages || 0;
        this.totalElements = res.totalElements || 0;
        this.calculateStats();
        this.applyFilters();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load transaction batch history.';
      }
    });
  }

  calculateStats(): void {
    this.stats.totalBatches = this.totalElements;
    this.stats.totalRecordsProcessed = this.batches.reduce((acc, b) => acc + (b.totalRecords || b.processedRecords || 0), 0);
    this.stats.totalAlertsGenerated = this.batches.reduce((acc, b) => acc + (b.alertsGeneratedCount || b.alertsTriggered || 0), 0);
    this.stats.rejectedBatchesCount = this.batches.filter(b => b.status === 'REJECTED' || b.status === 'REJECTED_FORMAT').length;
  }

  applyFilters(): void {
    let result = [...this.batches];

    if (this.selectedStatus !== 'ALL') {
      result = result.filter(b => b.status === this.selectedStatus);
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      result = result.filter(b =>
        (b.batchCode && b.batchCode.toLowerCase().includes(term)) ||
        (b.fileName && b.fileName.toLowerCase().includes(term)) ||
        (b.uploadedByEmail && b.uploadedByEmail.toLowerCase().includes(term)) ||
        (b.uploadedByName && b.uploadedByName.toLowerCase().includes(term))
      );
    }

    this.filteredBatches = result;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  viewBatchDetail(batch: BatchUploadResponse): void {
    if (!batch) return;
    this.selectedBatch = batch;
    this.isModalOpen = true;
    this.isLoadingDetail = true;
    this.modalErrorMessage = '';
    this.cdr.detectChanges();

    const batchIdToFetch = batch.batchId;
    if (!batchIdToFetch) {
      this.isLoadingDetail = false;
      this.cdr.detectChanges();
      return;
    }

    // Fetch full batch details including error logs if any
    this.bankAdminService.getBatchDetails(batchIdToFetch).pipe(
      finalize(() => {
        this.isLoadingDetail = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (fullBatch) => {
        if (fullBatch) {
          this.selectedBatch = fullBatch;
        }
      },
      error: (err) => {
        console.error('Error fetching batch details:', err);
        this.modalErrorMessage = err.error?.message || (typeof err.error === 'string' ? err.error : 'Unable to fetch full details for this batch.');
      }
    });
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedBatch = null;
    this.cdr.detectChanges();
  }

  getStatusBadgeClass(status: BatchStatus): string {
    switch (status) {
      case 'PROCESSED_NO_ALERTS':
      case 'COMPLETED':
        return 'bg-success';
      case 'PROCESSED_ALERTS_GENERATED':
        return 'bg-warning text-dark';
      case 'REJECTED':
      case 'REJECTED_FORMAT':
        return 'bg-danger';
      case 'QUEUED':
      case 'PROCESSING':
        return 'bg-info text-dark';
      default:
        return 'bg-secondary';
    }
  }

  getStatusLabel(status: BatchStatus): string {
    switch (status) {
      case 'PROCESSED_NO_ALERTS':
        return 'Clean (No Alerts)';
      case 'PROCESSED_ALERTS_GENERATED':
        return 'Alerts Generated';
      case 'REJECTED':
        return 'Rejected';
      case 'REJECTED_FORMAT':
        return 'Rejected Format';
      case 'QUEUED':
        return 'Queued';
      case 'PROCESSING':
        return 'Processing';
      default:
        return status;
    }
  }

  getProcessedCount(b: BatchUploadResponse | null): number {
    if (!b) return 0;
    if (b.status === 'REJECTED' || b.status === 'REJECTED_FORMAT') {
      return 0;
    }
    return b.processedRecords ?? b.totalRecords ?? 0;
  }

  getAlertsCount(b: BatchUploadResponse | null): number {
    if (!b) return 0;
    return b.alertsGeneratedCount ?? b.alertsTriggered ?? 0;
  }

  getErrorCount(b: BatchUploadResponse | null): number {
    if (!b) return 0;
    if (b.errors && b.errors.length > 0) return b.errors.length;
    return b.rejectedRecords || 0;
  }
}
