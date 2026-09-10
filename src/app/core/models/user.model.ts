export type UserRole = 'SYSTEM_ADMIN' | 'BANK_ADMIN' | 'COMPLIANCE_OFFICER';

export interface User {
  email: string;
  role: UserRole;
  tenantCode?: string | null;
}
