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

    this.bankAdminService.uploadTransactionBatch(this.selectedFile).pipe(
      finalize(() => {
        this.isUploading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res) => {
        this.lastUploadResponse = res;
        this.successMessage = `Batch file '${this.selectedFile?.name}' processed successfully with status '${res.status}'!`;
        this.selectedFile = null;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || err.error?.error || 'Failed to upload transaction batch.';
      }
    });
  }
}
