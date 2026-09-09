import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent, NavItem } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-compliance-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent],
  templateUrl: './compliance-layout.component.html',
  styleUrls: ['./compliance-layout.component.css']
})
export class ComplianceLayoutComponent {
  navItems: NavItem[] = [
    { label: 'Investigation Workstation', route: '/compliance' }
  ];
}
