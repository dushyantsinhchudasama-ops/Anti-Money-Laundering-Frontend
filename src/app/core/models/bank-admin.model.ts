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
  userId: string;
  officerId: string;
  userCode: string;
  officerName: string;
  email: string;
  activeCaseCount: number;
  investigatingCaseCount: number;
}

export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertStatus = 'OPEN' | 'ASSIGNED' | 'CLOSED' | 'NEW' | 'UNDER_REVIEW' | 'CASE_CREATED' | 'DISMISSED';

export interface AlertResponse {
  alertId: string;
  alertCode?: string;
  transactionId?: string;
  transactionTxnNo?: string;
  ruleId?: string;
  ruleName?: string;
  ruleCode?: string;
  severity: AlertSeverity;
  alertStatus?: AlertStatus;
  status?: AlertStatus;
  score?: number;
  amount?: number;
  triggerAmount?: number;
  currency?: string;
  caseId?: string;
  caseCode?: string;
  createdAt: string;
}

export interface AlertDetailResponse {
  alertId: string;
  alertCode?: string;
  severity: AlertSeverity;
  alertStatus?: AlertStatus;
  status?: AlertStatus;
  createdAt: string;

  // Transaction Details
  transactionId?: string;
  transactionTxnNo?: string;
  amount?: number;
  triggerAmount?: number;
  currency?: string;
  transactionType?: string;
  direction?: string;
  originatorAccountNumber?: string;
  counterpartyName?: string;
  counterpartyAccountNo?: string;
  counterpartyBank?: string;
  counterpartyCountryCode?: string;
  transactionTimestamp?: string;

  // Triggered Rule Details
  ruleId?: string;
  ruleCode?: string;
  ruleName?: string;
  ruleDescription?: string;
  typology?: string;
  ruleParameters?: Record<string, any>;
  parameters?: Record<string, any>;

  // Case Reference
  caseId?: string;
  caseCode?: string;
}

export interface AlertStatsResponse {
  totalAlerts?: number;
  totalAlertsCount?: number;
  newAlerts?: number;
  openAlertsCount?: number;
  underReviewAlerts?: number;
  assignedAlertsCount?: number;
  closedAlertsCount?: number;
  caseCreatedAlerts?: number;
  dismissedAlerts?: number;
  highSeverityAlerts?: number;
  highSeverityCount?: number;
  mediumSeverityCount?: number;
  lowSeverityCount?: number;
  criticalSeverityAlerts?: number;
}

export type CaseStatus = 'OPEN' | 'IN_PROGRESS' | 'INVESTIGATING' | 'ESCALATED' | 'PENDING_APPROVAL' | 'CLOSED_NO_ACTION' | 'CLOSED_SAR_FILED' | 'SAR_FILED';

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
  assigneeId?: string;
  assignedToId?: string;
  initialNote?: string;
  notes?: string;
}

export interface ReassignCaseRequest {
  newAssigneeId?: string;
  newAssignedToId?: string;
  reason?: string;
  reassignmentNotes?: string;
}

export type BatchStatus = 'QUEUED' | 'PROCESSING' | 'PROCESSED_NO_ALERTS' | 'PROCESSED_ALERTS_GENERATED' | 'REJECTED' | 'REJECTED_FORMAT' | 'PARTIALLY_PROCESSED' | 'COMPLETED';

export interface BatchValidationErrorDto {
  rowNumber: number;
  fieldName: string;
  errorMessage: string;
}

export interface BatchUploadResponse {
  batchId: string;
  batchCode?: string;
  fileName?: string;
  status: BatchStatus;
  totalRecords?: number;
  processedRecords?: number;
  rejectedRecords?: number;
  alertsGeneratedCount?: number;
  alertsTriggered?: number;
  uploadedAt?: string;
  errors?: BatchValidationErrorDto[];
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
