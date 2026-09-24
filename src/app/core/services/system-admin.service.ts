import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Rule,
  CreateRuleRequest,
  CreateRuleResponse,
  UpdateRuleRequest,
  AssignRuleRequest,
  RuleAssignmentResponse
} from '../models/rule.model';
import {
  Tenant,
  CreateTenantRequest,
  CreateTenantResponse,
  CreateBankAdminRequest,
  CreateBankAdminResponse,
  BankAdminSummary,
  TenantStatus
} from '../models/tenant.model';

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class SystemAdminService {
  private http = inject(HttpClient);

  getAllRules(page: number = 0, size: number = 50): Observable<PageResponse<CreateRuleResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<CreateRuleResponse>>(environment.endpoints.systemAdmin.rules.getAll, { params });
  }

  createRule(request: CreateRuleRequest): Observable<CreateRuleResponse> {
    return this.http.post<CreateRuleResponse>(environment.endpoints.systemAdmin.rules.create, request);
  }

  updateRule(ruleId: string, request: UpdateRuleRequest): Observable<CreateRuleResponse> {
    return this.http.patch<CreateRuleResponse>(environment.endpoints.systemAdmin.rules.update(ruleId), request);
  }

  assignRuleToTenant(ruleId: string, tenantId: string): Observable<RuleAssignmentResponse> {
    const request: AssignRuleRequest = { tenantId };
    return this.http.post<RuleAssignmentResponse>(environment.endpoints.systemAdmin.rules.assign(ruleId), request);
  }

  getAssignedRulesForTenant(tenantId: string): Observable<RuleAssignmentResponse[]> {
    return this.http.get<RuleAssignmentResponse[]>(environment.endpoints.systemAdmin.rules.getAssignedRules(tenantId));
  }

  unassignRuleFromTenant(ruleId: string, tenantId: string): Observable<void> {
    return this.http.delete<void>(environment.endpoints.systemAdmin.rules.unassign(ruleId, tenantId));
  }


  getAllTenants(): Observable<Tenant[]> {
    return this.http.get<Tenant[]>(environment.endpoints.systemAdmin.tenants.getAll);
  }

  updateTenantStatus(tenantId: string, status: TenantStatus): Observable<Tenant> {
    return this.http.patch<Tenant>(environment.endpoints.systemAdmin.tenants.updateStatus(tenantId), { status });
  }

  getBankAdminsForTenant(tenantId: string): Observable<BankAdminSummary[]> {
    return this.http.get<BankAdminSummary[]>(environment.endpoints.systemAdmin.tenants.getBankAdmins(tenantId));
  }

  resetBankAdminPassword(tenantId: string, userId: string): Observable<BankAdminSummary> {
    return this.http.post<BankAdminSummary>(environment.endpoints.systemAdmin.tenants.resetBankAdminPassword(tenantId, userId), {});
  }

  toggleBankAdminStatus(tenantId: string, userId: string, isActive: boolean): Observable<BankAdminSummary> {
    const url = isActive
      ? environment.endpoints.systemAdmin.tenants.deactivateBankAdmin(tenantId, userId)
      : environment.endpoints.systemAdmin.tenants.activateBankAdmin(tenantId, userId);
    return this.http.patch<BankAdminSummary>(url, {});
  }

  onboardTenant(request: CreateTenantRequest): Observable<CreateTenantResponse> {
    return this.http.post<CreateTenantResponse>(environment.endpoints.systemAdmin.tenants.onboard, request);
  }

  createBankAdmin(tenantId: string, request: CreateBankAdminRequest): Observable<CreateBankAdminResponse> {
    return this.http.post<CreateBankAdminResponse>(environment.endpoints.systemAdmin.tenants.createBankAdmin(tenantId), request);
  }
}
