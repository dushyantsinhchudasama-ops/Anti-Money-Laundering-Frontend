import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PageResponse } from './system-admin.service';
import {
  ComplianceOfficerRequest,
  ComplianceOfficerResponse,
  ComplianceOfficerWorkloadResponse,
  AlertResponse,
  AlertDetailResponse,
  AlertStatsResponse,
  AlertSeverity,
  AlertStatus,
  CaseResponse,
  CaseStatus,
  CreateCaseRequest,
  ReassignCaseRequest,
  BatchUploadResponse,
  SarStrResponse
} from '../models/bank-admin.model';

@Injectable({
  providedIn: 'root'
})
export class BankAdminService {

  constructor(private http: HttpClient) {}

  // --- Compliance Officer Management ---

  createComplianceOfficer(request: ComplianceOfficerRequest): Observable<ComplianceOfficerResponse> {
    return this.http.post<ComplianceOfficerResponse>(environment.endpoints.bankAdmin.addOfficer, request);
  }

  getComplianceOfficers(page: number = 0, size: number = 20): Observable<PageResponse<ComplianceOfficerResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<ComplianceOfficerResponse>>(environment.endpoints.bankAdmin.officers, { params });
  }

  activateComplianceOfficer(officerId: string): Observable<ComplianceOfficerResponse> {
    return this.http.patch<ComplianceOfficerResponse>(environment.endpoints.bankAdmin.activateOfficer(officerId), {});
  }

  deactivateComplianceOfficer(officerId: string): Observable<ComplianceOfficerResponse> {
    return this.http.patch<ComplianceOfficerResponse>(environment.endpoints.bankAdmin.deactivateOfficer(officerId), {});
  }

  resetComplianceOfficerPassword(officerId: string): Observable<ComplianceOfficerResponse> {
    return this.http.post<ComplianceOfficerResponse>(environment.endpoints.bankAdmin.resetOfficerPassword(officerId), {});
  }

  getComplianceOfficerWorkloads(): Observable<ComplianceOfficerWorkloadResponse[]> {
    return this.http.get<ComplianceOfficerWorkloadResponse[]>(environment.endpoints.bankAdmin.workload);
  }

  // --- Alert Dashboard & Monitoring ---

  getAlerts(
    severity?: AlertSeverity,
    ruleId?: string,
    status?: AlertStatus,
    startDate?: string,
    endDate?: string,
    page: number = 0,
    size: number = 20
  ): Observable<PageResponse<AlertResponse>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (severity) params = params.set('severity', severity);
    if (ruleId) params = params.set('ruleId', ruleId);
    if (status) params = params.set('status', status);
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<PageResponse<AlertResponse>>(environment.endpoints.bankAdmin.alerts, { params });
  }

  getAlertStats(): Observable<AlertStatsResponse> {
    return this.http.get<AlertStatsResponse>(environment.endpoints.bankAdmin.alertStats);
  }

  getAlertDetail(alertId: string): Observable<AlertDetailResponse> {
    return this.http.get<AlertDetailResponse>(environment.endpoints.bankAdmin.alertDetail(alertId));
  }

  // --- Case Assignment & Tracking ---

  assignAlertsToCase(request: CreateCaseRequest): Observable<CaseResponse> {
    return this.http.post<CaseResponse>(environment.endpoints.bankAdmin.assignCase, request);
  }

  reassignCase(caseId: string, request: ReassignCaseRequest): Observable<CaseResponse> {
    return this.http.post<CaseResponse>(environment.endpoints.bankAdmin.reassignCase(caseId), request);
  }

  getCases(status?: CaseStatus, assignedToId?: string, page: number = 0, size: number = 20): Observable<PageResponse<CaseResponse>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) params = params.set('status', status);
    if (assignedToId) params = params.set('assignedToId', assignedToId);

    return this.http.get<PageResponse<CaseResponse>>(environment.endpoints.bankAdmin.cases, { params });
  }

  getCaseDetail(caseId: string): Observable<CaseResponse> {
    return this.http.get<CaseResponse>(environment.endpoints.bankAdmin.caseDetail(caseId));
  }

  // --- Batch Transaction Ingestion ---

  uploadTransactionBatch(file: File): Observable<BatchUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<BatchUploadResponse>(environment.endpoints.batches.upload, formData);
  }

  getBatchDetails(batchId: string): Observable<BatchUploadResponse> {
    return this.http.get<BatchUploadResponse>(environment.endpoints.batches.getDetail(batchId));
  }

  // --- Institutional SAR / STR Regulatory Log ---

  getSarStrFilingLog(page: number = 0, size: number = 20): Observable<PageResponse<SarStrResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<SarStrResponse>>(environment.endpoints.bankAdmin.sarStr, { params });
  }

  downloadSarStrPdf(sarStrId: string): Observable<Blob> {
    return this.http.get(environment.endpoints.bankAdmin.sarStrPdf(sarStrId), { responseType: 'blob' });
  }
}
