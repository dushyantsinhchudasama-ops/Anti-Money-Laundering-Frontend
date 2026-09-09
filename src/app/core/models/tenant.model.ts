export type TenantStatus = 'ACTIVE' | 'SUSPENDED' | 'ONBOARDING';

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
