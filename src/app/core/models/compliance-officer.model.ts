import { CaseResponse, CaseStatus, AlertSeverity, AlertStatus } from './bank-admin.model';

export interface ComplianceOfficerDashboardResponse {
  totalAssignedCases: number;
  openCasesCount: number;
  inProgressCasesCount: number;
  escalatedCasesCount: number;
  closedCasesCount: number;
  relatedAlertsCount: number;
}

export type NoteType = 'OBSERVATION' | 'EVIDENCE_REFERENCE' | 'DECISION_RATIONALE';

export interface CaseNoteCreateRequest {
  noteType?: NoteType;
  content?: string;
  noteText?: string;
}

export interface CaseNoteResponse {
  noteId: string;
  caseId?: string;
  authorId?: string;
  authorName?: string;
  authorEmail?: string;
  noteType?: NoteType;
  content?: string;
  noteText?: string;
  createdAt: string;
}

export interface CloseCaseNoActionRequest {
  rationale: string;
}

export interface SarStrPreviewResponse {
  caseId: string;
  caseCode: string;
  primaryAccountNo: string;
  primaryAccountHolder: string;
  bankName: string;
  totalAlertAmount: number;
  alertCount: number;
  triggeringRulesSummary: string;
  suggestedNarrative: string;
}

export type FiuTypologyCategory =
  | 'STRUCTURING'
  | 'LAYERING'
  | 'PEP_TRANSACTION'
  | 'FRAUD_RELATED_ML'
  | 'VELOCITY_CHECK'
  | 'GEOGRAPHIC_RISK'
  | 'RAPID_PASS_THROUGH'
  | 'DORMANT_ACCOUNT'
  | 'UTURN_TRANSACTION'
  | 'CIRCULAR_LOOPING'
  | 'OTHER_SUSPICIOUS_ACTIVITY';

export interface SarStrFilingRequest {
  reportType: 'SAR' | 'STR';
  typologyCategory: FiuTypologyCategory;
  descriptionOfActivity: string;
  basisForSuspicion: string;
  supportingEvidence: string;
}

export interface SarStrFilingResponse {
  sarStrId: string;
  referenceNumber: string;
  caseId: string;
  caseCode: string;
  reportType: string;
  status: string;
  filedByEmail: string;
  filedAt: string;
}

export interface CaseInvestigationResponse {
  caseSummary?: {
    caseId: string;
    caseCode: string;
    status: CaseStatus;
    assignedToId?: string;
    assignedToName?: string;
    assignedToEmail?: string;
    createdById?: string;
    createdByName?: string;
    falsePositiveRationale?: string;
    createdAt: string;
    closedAt?: string;
  };
  triggeringTransactions?: Array<{
    transactionId: string;
    txnNo: string;
    amount: number;
    currency: string;
    txnType: string;
    direction: string;
    counterpartyName?: string;
    counterpartyAccountNo?: string;
    counterpartyBank?: string;
    counterpartyCountryCode?: string;
    txnTimestamp: string;
    countryCode?: string;
    batchId?: string;
    batchCode?: string;
    alertCode?: string;
    alertSeverity?: AlertSeverity;
    ruleCode?: string;
    ruleName?: string;
  }>;
  customerAccountProfile?: {
    accountId: string;
    accountNumber: string;
    accountHolderName: string;
    accountType: string;
    bankName: string;
    countryCode?: string;
    riskRating?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    openedAt?: string;
    note?: string;
  };
  relatedTransactions?: Array<{
    transactionId: string;
    txnNo: string;
    amount: number;
    currency: string;
    txnType: string;
    direction: string;
    counterpartyName?: string;
    counterpartyAccountNo?: string;
    txnTimestamp: string;
    relationType?: string;
  }>;
  customerTransactionHistory?: {
    content: Array<{
      transactionId: string;
      txnNo: string;
      amount: number;
      currency: string;
      txnType: string;
      direction: string;
      counterpartyName?: string;
      counterpartyAccountNo?: string;
      counterpartyBank?: string;
      txnTimestamp: string;
    }>;
    totalElements: number;
    totalPages: number;
    number: number;
  };
  counterparties?: Array<{
    counterpartyName: string;
    counterpartyAccountNo?: string;
    counterpartyBank?: string;
    counterpartyCountryCode?: string;
    transactionCount: number;
    totalAmount: number;
  }>;
  linkedAccounts?: Array<{
    accountId: string;
    accountNumber: string;
    accountHolderName: string;
    accountType: string;
    riskRating?: string;
  }>;
  historicalAlerts?: Array<{
    alertId: string;
    alertCode: string;
    severity: AlertSeverity;
    alertStatus: AlertStatus;
    ruleCode?: string;
    ruleName?: string;
    createdAt: string;
  }>;
  historicalCases?: Array<{
    caseId: string;
    caseCode: string;
    status: CaseStatus;
    createdAt: string;
  }>;
}
