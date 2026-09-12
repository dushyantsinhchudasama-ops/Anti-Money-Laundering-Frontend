import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { BankAdminService } from '../../../core/services/bank-admin.service';
import { BatchUploadResponse } from '../../../core/models/bank-admin.model';

@Component({
  selector: 'app-batch-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './batch-upload.component.html',
  styleUrls: ['./batch-upload.component.css']
})
export class BatchUploadComponent {
  selectedFile: File | null = null;
  isUploading = false;
  errorMessage = '';
  successMessage = '';

  lastUploadResponse: BatchUploadResponse | null = null;

  private bankAdminService = inject(BankAdminService);
  private cdr = inject(ChangeDetectorRef);

  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.selectedFile = file;
      this.errorMessage = '';
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.selectedFile = event.dataTransfer.files[0];
      this.errorMessage = '';
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onUpload(): void {
    if (!this.selectedFile) {
      this.errorMessage = 'Please select a transaction CSV file to upload.';
      return;
    }

    this.isUploading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.lastUploadResponse = null;

    const fileNameToReport = this.selectedFile.name;

    this.bankAdminService.uploadTransactionBatch(this.selectedFile).pipe(
      finalize(() => {
        this.isUploading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res) => {
        this.lastUploadResponse = res;
        if (res.status === 'REJECTED' || res.status === 'REJECTED_FORMAT' || (res.errors && res.errors.length > 0)) {
          this.errorMessage = `Batch validation failed with ${res.errors?.length || 0} validation error(s). Review row details below.`;
        } else {
          this.successMessage = `Batch file '${fileNameToReport}' (${res.batchCode || 'SUCCESS'}) ingested successfully! Total records: ${res.totalRecords || 0}, Alerts generated: ${res.alertsGeneratedCount || 0}.`;
          this.selectedFile = null;
        }
      },
      error: (err) => {
        const errorBody = err.error;
        if (errorBody && typeof errorBody === 'object' && (errorBody.status || errorBody.errors || errorBody.batchCode)) {
          this.lastUploadResponse = errorBody as BatchUploadResponse;
          const errCount = errorBody.errors?.length || 0;
          this.errorMessage = `Batch file processing failed with ${errCount} validation error(s). Please fix the highlighted rows below.`;
        } else {
          this.errorMessage = typeof errorBody === 'string'
            ? errorBody
            : (errorBody?.message || errorBody?.error || 'Failed to upload transaction batch.');
          this.lastUploadResponse = null;
        }
      }
    });
  }

  getProcessedCount(): number {
    if (!this.lastUploadResponse) return 0;
    if (this.lastUploadResponse.status === 'REJECTED' || this.lastUploadResponse.status === 'REJECTED_FORMAT') {
      return 0;
    }
    if (this.lastUploadResponse.processedRecords !== undefined) {
      return this.lastUploadResponse.processedRecords;
    }
    return this.lastUploadResponse.totalRecords || 0;
  }

  getErrorCount(): number {
    if (!this.lastUploadResponse) return 0;
    if (this.lastUploadResponse.errors && this.lastUploadResponse.errors.length > 0) {
      return this.lastUploadResponse.errors.length;
    }
    return this.lastUploadResponse.rejectedRecords || 0;
  }

  getAlertsCount(): number {
    if (!this.lastUploadResponse) return 0;
    return this.lastUploadResponse.alertsGeneratedCount ?? this.lastUploadResponse.alertsTriggered ?? 0;
  }

  downloadSampleExcel(): void {
    const headers = "TxnNo,OriginatorAccountNo,OriginatorName,Amount,Currency,TxnType,Direction,CounterpartyName,CounterpartyAccountNo,CounterpartyBank,CounterpartyCountryCode,TxnTimestamp,CountryCode\n";
    const sampleRows =
      "TXN10001,ACC-882190,Aarav Sharma,25000.00,INR,NEFT,IN,Global Trade LLC,CP-99001,HSBC,US,2026-09-09T14:30:00,IN\n" +
      "TXN10002,ACC-882190,Aarav Sharma,1250000.00,INR,UPI,OUT,Self Deposit,CP-00000,HDFC,IN,2026-09-09T15:10:00,IN\n" +
      "TXN10003,ACC-554112,Priya Patel,8500.00,USD,CHEQUE,IN,Tech Offshore Corp,CP-77112,Barclays,GB,2026-09-09T16:05:00,IN\n";

    const blob = new Blob([headers + sampleRows], { type: 'text/excel;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'AML_Transaction_Batch_Sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
