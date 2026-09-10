import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { SystemAdminService } from '../../../core/services/system-admin.service';
import { CreateRuleResponse, RuleAssignmentResponse, RuleSeverity, RuleTypology } from '../../../core/models/rule.model';
import { Tenant } from '../../../core/models/tenant.model';

@Component({
  selector: 'app-rule-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rule-management.component.html',
  styleUrls: ['./rule-management.component.css']
})
export class RuleManagementComponent implements OnInit {
  activeTab: 'all-rules' | 'bank-assignments' = 'all-rules';

  rules: CreateRuleResponse[] = [];
  tenants: Tenant[] = [];
  assignedRulesForBank: RuleAssignmentResponse[] = [];

  isLoading = false;
  isLoadingAssignments = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  showCreateForm = false;
  showUpdateForm = false;
  showAssignForm = false;
  showDetailModal = false;

  selectedRule: CreateRuleResponse | null = null;
  editingRule: CreateRuleResponse | null = null;
  viewingRuleDetail: CreateRuleResponse | null = null;

  selectedTenantId = '';
  selectedBankIdForFilter = '';

  // Form fields for creating a new rule
  ruleForm = {
    ruleName: '',
    description: '',
    typology: 'STRUCTURING_SMURFING' as RuleTypology,
    defaultSeverity: 'HIGH' as RuleSeverity,
    windowDays: 7,
    reportingThreshold: 10000,
    maxTransactionCount: 10,
    highRiskCountriesStr: 'IR, KP, SY',
    minAmountThreshold: 5000,
    windowHours: 24,
    passThroughRatio: 0.9,
    moduloThreshold: 1000,
    dormantDays: 180
  };

  // Form fields for editing an existing rule
  editForm = {
    ruleName: '',
    description: '',
    defaultSeverity: 'HIGH' as RuleSeverity,
    isActive: true,
    windowDays: 7,
    reportingThreshold: 10000,
    maxTransactionCount: 10,
    highRiskCountriesStr: 'IR, KP, SY',
    minAmountThreshold: 5000,
    windowHours: 24,
    passThroughRatio: 0.9,
    moduloThreshold: 1000,
    dormantDays: 180
  };

  
  private systemAdminService = inject(SystemAdminService);
  private cdr = inject(ChangeDetectorRef);


  ngOnInit(): void {
    this.loadRules();
    this.loadTenants();
  }

  setTab(tab: 'all-rules' | 'bank-assignments'): void {
    this.activeTab = tab;
    this.errorMessage = '';
    this.successMessage = '';

    if (tab === 'bank-assignments') {
      if (this.tenants.length > 0 && !this.selectedBankIdForFilter) {
        this.selectedBankIdForFilter = this.tenants[0].tenantId;
      }
      if (this.selectedBankIdForFilter) {
        this.loadBankAssignments();
      }
    }
  }

  loadRules(): void {
    this.isLoading = true;
    this.systemAdminService.getAllRules().pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res) => this.rules = res.content || [],
      error: (err) => this.errorMessage = err.error?.message || 'Failed to load rules.'
    });
  }

  loadTenants(): void {
    this.systemAdminService.getAllTenants().subscribe({
      next: (data) => {
        this.tenants = data || [];
        if (this.tenants.length > 0 && !this.selectedBankIdForFilter) {
          this.selectedBankIdForFilter = this.tenants[0].tenantId;
        }
        if (this.activeTab === 'bank-assignments' && this.selectedBankIdForFilter) {
          this.loadBankAssignments();
        }
        this.cdr.detectChanges();
      }
    });
  }

  loadBankAssignments(): void {
    if (!this.selectedBankIdForFilter) {
      this.assignedRulesForBank = [];
      return;
    }
    this.isLoadingAssignments = true;
    this.errorMessage = '';

    this.systemAdminService.getAssignedRulesForTenant(this.selectedBankIdForFilter).pipe(
      finalize(() => {
        this.isLoadingAssignments = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (data) => this.assignedRulesForBank = data || [],
      error: (err) => {
        this.assignedRulesForBank = [];
        this.errorMessage = err.error?.message || 'Failed to fetch assigned rules for selected bank.';
      }
    });
  }

  getRuleDetails(ruleId: string): CreateRuleResponse | undefined {
    return this.rules.find(r => r.ruleId === ruleId);
  }

  openRuleDetailModal(ruleId: string): void {
    const detail = this.getRuleDetails(ruleId);
    if (detail) {
      this.viewingRuleDetail = detail;
      this.showDetailModal = true;
    }
  }

  closeRuleDetailModal(): void {
    this.showDetailModal = false;
    this.viewingRuleDetail = null;
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    this.showUpdateForm = false;
    this.showAssignForm = false;
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Simple helper to create parameters map for backend
  private buildParameters(typology: RuleTypology, f: any): Record<string, any> {
    if (typology === 'STRUCTURING_SMURFING') {
      return { windowDays: Number(f.windowDays), reportingThreshold: Number(f.reportingThreshold) };
    }
    if (typology === 'VELOCITY_CHECK') {
      return { windowDays: Number(f.windowDays), maxTransactionCount: Number(f.maxTransactionCount) };
    }
    if (typology === 'GEOGRAPHIC_RISK') {
      const countries = f.highRiskCountriesStr.split(',').map((s: string) => s.trim().toUpperCase()).filter((s: string) => s.length > 0);
      return { highRiskCountries: countries };
    }
    if (typology === 'PEP_EXPOSURE') {
      return { minAmountThreshold: Number(f.minAmountThreshold) };
    }
    if (typology === 'RAPID_PASS_THROUGH') {
      return { windowHours: Number(f.windowHours), minAmountThreshold: Number(f.minAmountThreshold), passThroughRatio: Number(f.passThroughRatio) };
    }
    if (typology === 'ROUND_AMOUNT_FLAGGING') {
      return { moduloThreshold: Number(f.moduloThreshold) };
    }
    if (typology === 'DORMANT_ACCOUNT') {
      return { dormantDays: Number(f.dormantDays), minAmountThreshold: Number(f.minAmountThreshold) };
    }
    return { minAmountThreshold: Number(f.minAmountThreshold) };
  }

  onCreateRule(): void {
    if (!this.ruleForm.ruleName) {
      this.errorMessage = 'Rule name is required.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const request = {
      ruleName: this.ruleForm.ruleName.trim(),
      description: this.ruleForm.description.trim(),
      typology: this.ruleForm.typology,
      defaultSeverity: this.ruleForm.defaultSeverity,
      parameters: this.buildParameters(this.ruleForm.typology, this.ruleForm)
    };

    this.systemAdminService.createRule(request).pipe(
      finalize(() => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res) => {
        this.successMessage = `Rule '${res.ruleName}' created successfully!`;
        this.showCreateForm = false;
        this.resetCreateForm();
        this.loadRules();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to create rule.';
      }
    });
  }

  openEditForm(rule: CreateRuleResponse): void {
    this.editingRule = rule;
    this.showUpdateForm = true;
    this.showCreateForm = false;
    this.showAssignForm = false;
    this.errorMessage = '';
    this.successMessage = '';

    this.editForm.ruleName = rule.ruleName;
    this.editForm.description = rule.description || '';
    this.editForm.defaultSeverity = rule.defaultSeverity;
    this.editForm.isActive = rule.isActive;

    if (rule.parameters) {
      this.editForm.windowDays = rule.parameters['windowDays'] || 7;
      this.editForm.reportingThreshold = rule.parameters['reportingThreshold'] || 10000;
      this.editForm.maxTransactionCount = rule.parameters['maxTransactionCount'] || 10;
      this.editForm.minAmountThreshold = rule.parameters['minAmountThreshold'] || 5000;
      this.editForm.windowHours = rule.parameters['windowHours'] || 24;
      this.editForm.passThroughRatio = rule.parameters['passThroughRatio'] || 0.9;
      this.editForm.moduloThreshold = rule.parameters['moduloThreshold'] || 1000;
      this.editForm.dormantDays = rule.parameters['dormantDays'] || 180;
      if (Array.isArray(rule.parameters['highRiskCountries'])) {
        this.editForm.highRiskCountriesStr = rule.parameters['highRiskCountries'].join(', ');
      }
    }
  }

  onUpdateRule(): void {
    if (!this.editingRule) return;

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const updateRequest = {
      ruleName: this.editForm.ruleName.trim(),
      description: this.editForm.description.trim(),
      defaultSeverity: this.editForm.defaultSeverity,
      isActive: this.editForm.isActive,
      parameters: this.buildParameters(this.editingRule.typology, this.editForm)
    };

    this.systemAdminService.updateRule(this.editingRule.ruleId, updateRequest).pipe(
      finalize(() => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res) => {
        this.successMessage = `Rule '${res.ruleName}' updated successfully!`;
        this.showUpdateForm = false;
        this.editingRule = null;
        this.loadRules();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to update rule.';
      }
    });
  }

  openAssignModal(rule: CreateRuleResponse): void {
    this.selectedRule = rule;
    this.showAssignForm = true;
    this.showCreateForm = false;
    this.showUpdateForm = false;
    this.selectedTenantId = this.tenants.length > 0 ? this.tenants[0].tenantId : '';
    this.errorMessage = '';
    this.successMessage = '';
  }

  onAssignRule(): void {
    if (!this.selectedRule || !this.selectedTenantId) {
      this.errorMessage = 'Please select a tenant bank.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.systemAdminService.assignRuleToTenant(this.selectedRule.ruleId, this.selectedTenantId).pipe(
      finalize(() => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res) => {
        this.successMessage = `Rule '${res.ruleName}' assigned to bank '${res.tenantCode}'!`;
        this.showAssignForm = false;
        this.selectedBankIdForFilter = this.selectedTenantId;
        this.selectedRule = null;
        if (this.activeTab === 'bank-assignments') {
          this.loadBankAssignments();
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to assign rule.';
      }
    });
  }

  onUnassignRule(ruleId: string, tenantId: string, ruleName: string): void {
    if (!confirm(`Are you sure you want to unassign rule '${ruleName}' from this bank?`)) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    this.systemAdminService.unassignRuleFromTenant(ruleId, tenantId).subscribe({
      next: () => {
        this.successMessage = `Rule '${ruleName}' unassigned successfully!`;
        this.loadBankAssignments();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to unassign rule.';
        this.cdr.detectChanges();
      }
    });
  }

  private resetCreateForm(): void {
    this.ruleForm = {
      ruleName: '',
      description: '',
      typology: 'STRUCTURING_SMURFING',
      defaultSeverity: 'HIGH',
      windowDays: 7,
      reportingThreshold: 10000,
      maxTransactionCount: 10,
      highRiskCountriesStr: 'IR, KP, SY',
      minAmountThreshold: 5000,
      windowHours: 24,
      passThroughRatio: 0.9,
      moduloThreshold: 1000,
      dormantDays: 180
    };
  }
}
