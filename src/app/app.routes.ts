import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./layouts/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [authGuard, roleGuard],
    data: { expectedRole: 'SYSTEM_ADMIN' },
    children: [
      {
        path: '',
        loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'rules',
        loadComponent: () => import('./features/admin/rule-management/rule-management.component').then(m => m.RuleManagementComponent)
      },
      {
        path: 'banks',
        loadComponent: () => import('./features/admin/bank-onboarding/bank-onboarding.component').then(m => m.BankOnboardingComponent)
      },
      {
        path: 'create-bank-admin',
        loadComponent: () => import('./features/admin/create-bank-admin/create-bank-admin.component').then(m => m.CreateBankAdminComponent)
      }
    ]
  },
  {
    path: 'bank',
    loadComponent: () => import('./layouts/bank-admin-layout/bank-admin-layout.component').then(m => m.BankAdminLayoutComponent),
    canActivate: [authGuard, roleGuard],
    data: { expectedRole: 'BANK_ADMIN' },
    children: [
      {
        path: '',
        loadComponent: () => import('./features/bank-admin/bank-dashboard/bank-dashboard.component').then(m => m.BankDashboardComponent)
      },
      {
        path: 'officers',
        loadComponent: () => import('./features/bank-admin/officer-management/officer-management.component').then(m => m.OfficerManagementComponent)
      },
      {
        path: 'alerts',
        loadComponent: () => import('./features/bank-admin/alert-management/alert-management.component').then(m => m.AlertManagementComponent)
      },
      {
        path: 'cases',
        loadComponent: () => import('./features/bank-admin/case-management/case-management.component').then(m => m.CaseManagementComponent)
      },
      {
        path: 'batches',
        loadComponent: () => import('./features/bank-admin/batch-upload/batch-upload.component').then(m => m.BatchUploadComponent)
      },
      {
        path: 'sar-str',
        loadComponent: () => import('./features/bank-admin/sar-str-log/sar-str-log.component').then(m => m.SarStrLogComponent)
      }
    ]
  },
  {
    path: 'compliance',
    loadComponent: () => import('./layouts/compliance-layout/compliance-layout.component').then(m => m.ComplianceLayoutComponent),
    canActivate: [authGuard, roleGuard],
    data: { expectedRole: 'COMPLIANCE_OFFICER' },
    children: [
      {
        path: '',
        loadComponent: () => import('./features/compliance-officer/compliance-dashboard/compliance-dashboard.component').then(m => m.ComplianceDashboardComponent)
      },
      {
        path: 'cases',
        loadComponent: () => import('./features/compliance-officer/my-cases/my-cases.component').then(m => m.MyCasesComponent)
      },
      {
        path: 'cases/:caseId/investigate',
        loadComponent: () => import('./features/compliance-officer/case-investigation/case-investigation.component').then(m => m.CaseInvestigationComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
