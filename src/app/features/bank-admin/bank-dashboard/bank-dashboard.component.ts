import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BankAdminService } from '../../../core/services/bank-admin.service';
import { AlertStatsResponse } from '../../../core/models/bank-admin.model';

@Component({
  selector: 'app-bank-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './bank-dashboard.component.html',
  styleUrls: ['./bank-dashboard.component.css']
})
export class BankDashboardComponent implements OnInit {
  stats: AlertStatsResponse | null = null;
  totalOfficers = 0;
  totalCases = 0;

  isLoading = false;

  private bankAdminService = inject(BankAdminService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.fetchOverview();
  }

  fetchOverview(): void {
    
    this.isLoading = true;
    this.bankAdminService.getAlertStats().subscribe({
      next: (res) => {
        this.stats = res;
        this.cdr.detectChanges();
      },
      error: () => {}
    });

    this.bankAdminService.getComplianceOfficers().subscribe({
      next: (res) => {
        this.totalOfficers = (res.content || []).length;
        this.cdr.detectChanges();
      },
      error: () => {}
    });

    this.bankAdminService.getCases().subscribe({
      next: (res) => {
        this.totalCases = (res.content || []).length;
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }
}
