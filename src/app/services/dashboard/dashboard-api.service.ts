import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/config/api.config';
import { ApprovalDecision, ApprovalTask, Dashboard } from '../../shared/models/peopleos.models';
import { mapDashboardResponse } from '../../features/peopleos/mappers/peopleos.mapper';

@Injectable({ providedIn: 'root' })
export class DashboardApiService {
  private readonly http = inject(HttpClient);

  getDashboard(): Observable<Dashboard> {
    return this.http.get<Dashboard>(`${API_BASE_URL}/peopleos/dashboard`).pipe(map(mapDashboardResponse));
  }

  decideApproval(approvalId: number, decision: ApprovalDecision): Observable<ApprovalTask> {
    return this.http.post<ApprovalTask>(`${API_BASE_URL}/peopleos/approvals/${approvalId}/decision`, { decision });
  }
}
