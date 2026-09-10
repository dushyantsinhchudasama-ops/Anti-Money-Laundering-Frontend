import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PageResponse } from './system-admin.service';
import {
  CaseResponse,
  CaseStatus,
  AlertResponse,
  AlertDetailResponse,
  AlertSeverity,
  AlertStatus
} from '../models/bank-admin.model';
import {
  ComplianceOfficerDashboardResponse,
  CaseNoteCreateRequest,
  CaseNoteResponse,
  CaseInvestigationResponse,
  CloseCaseNoActionRequest,
  SarStrPreviewResponse,
  SarStrFilingRequest,
  SarStrFilingResponse
} from '../models/compliance-officer.model';

@Injectable({
  providedIn: 'root'
})
export class ComplianceOfficerService {

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<ComplianceOfficerDashboardResponse> {
    return this.http.get<ComplianceOfficerDashboardResponse>(environment.endpoints.compliance.dashboard);
  }

  getAssignedCases(status?: CaseStatus, page: number = 0, size: number = 20): Observable<PageResponse<CaseResponse>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) params = params.set('status', status);
    return this.http.get<PageResponse<CaseResponse>>(environment.endpoints.compliance.cases, { params });
  }

  getCaseDetail(caseId: string): Observable<CaseResponse> {
    return this.http.get<CaseResponse>(`${environment.endpoints.compliance.cases}/${caseId}`);
  }

  startInvestigation(caseId: string): Observable<CaseResponse> {
    return this.http.post<CaseResponse>(`${environment.endpoints.compliance.cases}/${caseId}/start-investigation`, {});
  }

  getAssignedAlerts(
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
    return this.http.get<PageResponse<AlertResponse>>(environment.endpoints.compliance.alerts, { params });
  }

  getAlertDetail(alertId: string): Observable<AlertDetailResponse> {
    return this.http.get<AlertDetailResponse>(`${environment.endpoints.compliance.alerts}/${alertId}`);
  }

  createCaseNote(caseId: string, request: CaseNoteCreateRequest): Observable<CaseNoteResponse> {
    return this.http.post<CaseNoteResponse>(`${environment.endpoints.compliance.cases}/${caseId}/notes`, request);
  }

  getCaseNotes(caseId: string): Observable<CaseNoteResponse[]> {
    return this.http.get<CaseNoteResponse[]>(`${environment.endpoints.compliance.cases}/${caseId}/notes`);
  }

  getCaseInvestigationData(caseId: string, page: number = 0, size: number = 20): Observable<CaseInvestigationResponse> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<CaseInvestigationResponse>(`${environment.endpoints.compliance.cases}/${caseId}/investigation`, { params });
  }

  closeCaseNoAction(caseId: string, request: CloseCaseNoActionRequest): Observable<CaseResponse> {
    return this.http.post<CaseResponse>(`${environment.endpoints.compliance.cases}/${caseId}/close-no-action`, request);
  }

  getSarStrPreview(caseId: string): Observable<SarStrPreviewResponse> {
    return this.http.get<SarStrPreviewResponse>(`${environment.endpoints.compliance.cases}/${caseId}/sar-str/preview`);
  }

  fileSarStr(caseId: string, request: SarStrFilingRequest): Observable<SarStrFilingResponse> {
    return this.http.post<SarStrFilingResponse>(`${environment.endpoints.compliance.cases}/${caseId}/sar-str`, request);
  }

  downloadSarStrPdf(caseId: string): Observable<Blob> {
    return this.http.get(`${environment.endpoints.compliance.cases}/${caseId}/sar-str/pdf`, { responseType: 'blob' });
  }
}
