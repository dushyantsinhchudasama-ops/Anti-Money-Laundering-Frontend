export type TenantStatus = 'ACTIVE' | 'SUSPENDED' | 'ONBOARDING' | 'OFFBOARDED';

export interface Tenant {
  tenantId: string;
  tenantCode: string;
  tenantName: string;
  displayName: string;
  schemaName?: string;
  status: TenantStatus;
  onboardedByAdminId?: string;
  createdAt?: string;
}

export interface BankAdminSummary {
  userId: string;
  userCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  employeeId?: string;
  isActive: boolean;
  role?: 'BANK_ADMIN';
  mustResetPassword?: boolean;
}

export interface CreateTenantRequest {
  tenantCode: string;
  tenantName: string;
  displayName: string;
}

export interface CreateTenantResponse {
  tenantId: string;
  tenantCode: string;
  tenantName: string;
  displayName: string;
  schemaName: string;
  status: TenantStatus;
  onboardedByAdminId?: string;
  createdAt?: string;
}

export interface CreateBankAdminRequest {
  userCode: string;
  employeeId?: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  email: string;
}

export interface CreateBankAdminResponse {
  userId: string;
  userCode: string;
  email: string;
  firstName: string;
  lastName: string;
  userRole: string;
  tenantId: string;
  createdAt?: string;
}
