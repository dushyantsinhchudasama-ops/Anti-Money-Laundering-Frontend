import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { BankAdminService } from '../../../core/services/bank-admin.service';
import { SarStrResponse } from '../../../core/models/bank-admin.model';

@Component({
  selector: 'app-sar-str-log',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sar-str-log.component.html',
  styleUrls: ['./sar-str-log.component.css']
})
export class SarStrLogComponent implements OnInit {
  filingLogs: SarStrResponse[] = [];

  isLoading = false;
  errorMessage = '';

  private bankAdminService = inject(BankAdminService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.isLoading = true;
    this.bankAdminService.getSarStrFilingLog().pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res) => this.filingLogs = res.content || [],
      error: (err) => this.errorMessage = err.error?.message || 'Failed to load SAR/STR filing logs.'
    });
  }

  downloadPdf(sarStrId: string, referenceNumber: string): void {
    this.bankAdminService.downloadSarStrPdf(sarStrId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `SAR-STR-${referenceNumber || sarStrId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => alert(err.error?.message || 'Failed to download SAR/STR PDF document.')
    });
  }
}
