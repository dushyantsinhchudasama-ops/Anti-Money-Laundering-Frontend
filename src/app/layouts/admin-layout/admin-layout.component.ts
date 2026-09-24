import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent, NavItem } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent {
  navItems: NavItem[] = [
    { label: 'Overview', route: '/admin' },
    { label: 'Rule Engine', route: '/admin/rules' },
    { label: 'Bank Onboarding', route: '/admin/banks' },
    { label: 'Tenants', route: '/admin/tenants' },
    //{ label: 'Add Bank Admin', route: '/admin/create-bank-admin' }
  ];
}
