import { UserRole } from './user.model';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  mustResetPassword: boolean;
  tenantCode?: string;
  userRole: UserRole | string;
}

export interface ResetPasswordRequest {
  email: string;
  tenantCode?: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
