export interface ComplianceOfficerRequest {
  userCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  employeeId?: string;
}

export interface ComplianceOfficerResponse {
  userId: string;
  userCode: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  employeeId?: string;
  role: string;
  isActive: boolean;
  mustResetPassword: boolean;
  createdAt: string;
}

export interface ComplianceOfficerWorkloadResponse {
  officerId: string;
  userCode: string;
  officerName: string;
  email: string;
  activeCaseCount: number;
  investigatingCaseCount: number;
}

export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertStatus = 'NEW' | 'UNDER_REVIEW' | 'CASE_CREATED' | 'DISMISSED';

export interface AlertResponse {
  alertId: string;
  alertCode?: string;
  ruleId: string;
  ruleName?: string;
  ruleCode?: string;
  severity: AlertSeverity;
  status: AlertStatus;
  score?: number;
  triggerAmount?: number;
  currency?: string;
  createdAt: string;
}

export interface AlertDetailResponse extends AlertResponse {
  ruleTypology?: string;
  parameters?: Record<string, any>;
  transactionDetails?: Record<string, any>;
  accountDetails?: Record<string, any>;
}

export interface AlertStatsResponse {
  totalAlerts: number;
  newAlerts: number;
  underReviewAlerts: number;
  caseCreatedAlerts: number;
  dismissedAlerts: number;
  highSeverityAlerts: number;
  criticalSeverityAlerts: number;
}

export type CaseStatus = 'OPEN' | 'INVESTIGATING' | 'PENDING_APPROVAL' | 'CLOSED_NO_ACTION' | 'SAR_FILED';

export interface CaseResponse {
  caseId: string;
  caseCode: string;
  status: CaseStatus;
  assignedToId?: string;
  assignedToName?: string;
  assignedToEmail?: string;
  alertCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateCaseRequest {
  alertIds: string[];
  assignedToId: string;
  notes?: string;
}

export interface ReassignCaseRequest {
  newAssignedToId: string;
  reassignmentNotes?: string;
}

export type BatchStatus = 'PROCESSING' | 'COMPLETED' | 'REJECTED';

export interface BatchUploadResponse {
  batchId: string;
  fileName?: string;
  status: BatchStatus;
  totalRecords?: number;
  processedRecords?: number;
  rejectedRecords?: number;
  alertsTriggered?: number;
  uploadedAt?: string;
}

export interface SarStrResponse {
  sarStrId: string;
  referenceNumber: string;
  caseId: string;
  caseCode?: string;
  reportType?: string;
  status?: string;
  filedByEmail?: string;
  filedAt?: string;
}
