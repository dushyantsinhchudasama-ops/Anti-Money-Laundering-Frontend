import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SystemAdminService } from '../../../core/services/system-admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  totalRules: number = 0;
  totalTenants: number = 0;
  isLoading: boolean = false;

  private systemAdminService = inject(SystemAdminService);
  private cdr = inject(ChangeDetectorRef)

  ngOnInit(): void {
    this.fetchOverview();
  }

  fetchOverview(): void {
    this.isLoading = true;

    this.systemAdminService.getAllRules().subscribe({
      next: (res) => {
        this.totalRules = res.totalElements || res.content?.length || 0;
        this.cdr.detectChanges();
      },
      error: () => {}
    });

    this.systemAdminService.getAllTenants().subscribe({
      next: (data) => {
        this.totalTenants = data ? data.length : 0;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
