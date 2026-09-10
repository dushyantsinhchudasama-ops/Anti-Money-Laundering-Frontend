export type RuleSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type RuleTypology =
  | 'STRUCTURING_SMURFING'
  | 'LAYERING'
  | 'PEP_EXPOSURE'
  | 'VELOCITY_CHECK'
  | 'ROUND_AMOUNT_FLAGGING'
  | 'GEOGRAPHIC_RISK'
  | 'FRAUD_RELATED_ML'
  | 'RAPID_PASS_THROUGH'
  | 'DORMANT_ACCOUNT'
  | 'UTURN_TRANSACTION'
  | 'CIRCULAR_LOOPING';

export type RuleStatus = 'DRAFT' | 'ACTIVE' | 'DEPRECATED';

export interface Rule {
  ruleId: string;
  ruleCode: string;
  ruleName: string;
  description: string;
  typology: RuleTypology;
  defaultSeverity: RuleSeverity;
  isActive: boolean;
  status: RuleStatus;
  parameters: Record<string, any>;
}

export interface CreateRuleRequest {
  ruleName: string;
  description: string;
  typology: RuleTypology;
  defaultSeverity: RuleSeverity;
  parameters: Record<string, any>;
}

export interface CreateRuleResponse {
  ruleId: string;
  ruleCode: string;
  ruleName: string;
  description: string;
  typology: RuleTypology;
  defaultSeverity: RuleSeverity;
  isActive: boolean;
  status: RuleStatus;
  parameters: Record<string, any>;
}

export interface UpdateRuleRequest {
  ruleName?: string;
  description?: string;
  defaultSeverity?: RuleSeverity;
  parameters?: Record<string, any>;
  isActive?: boolean;
}

export interface AssignRuleRequest {
  tenantId: string;
}

export interface RuleAssignmentResponse {
  assignmentId: string;
  tenantId: string;
  tenantCode: string;
  tenantName: string;
  ruleId: string;
  ruleCode: string;
  ruleName: string;
  assignedByAdminId?: string;
  assignedByEmail?: string;
  assignedAt?: string;
}
