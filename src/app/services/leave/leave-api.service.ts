import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';
import { LeaveData, LeaveRequest } from '../../../shared/models/peopleos.models';

@Injectable({ providedIn: 'root' })
export class LeaveApiService {
  private readonly http = inject(HttpClient);

  getLeave(): Observable<LeaveData> {
    return this.http.get<LeaveData>(`${API_BASE_URL}/peopleos/leave`);
  }

  submitLeave(request: unknown): Observable<LeaveRequest> {
    return this.http.post<LeaveRequest>(`${API_BASE_URL}/peopleos/leave/requests`, request);
  }
}
