import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent, NavItem } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-bank-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent],
  templateUrl: './bank-admin-layout.component.html',
  styleUrls: ['./bank-admin-layout.component.css']
})
export class BankAdminLayoutComponent {
  navItems: NavItem[] = [
    { label: 'Overview', route: '/bank' },
    { label: 'Compliance Officers', route: '/bank/officers' },
    { label: 'Alert Monitoring', route: '/bank/alerts' },
    { label: 'Case Tracking', route: '/bank/cases' },
    { label: 'Batch Ingestion', route: '/bank/batches' },
    { label: 'Batch History', route: '/bank/batch-history' },
    { label: 'SAR / STR Filings', route: '/bank/sar-str' }
  ];
}
