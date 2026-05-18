import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/api.config';
import {
  AttendanceCorrection,
  AttendanceData,
  BenefitPlan,
  Dashboard,
  Employee,
  ExpenseClaim,
  LeaveData,
  LeaveRequest,
  PolicyDocument,
  ResignationRequest,
  Session
} from '../../../shared/models/peopleos.models';
import { ChangePasswordRequestDto, LoginRequestDto, ProfileUpdateRequestDto } from '../models/peopleos.dto';
import { mapDashboardResponse } from '../mappers/peopleos.mapper';

export interface PeopleOsWorkspaceResponse {
  dashboard: Dashboard;
  attendance: AttendanceData;
  leave: LeaveData;
  benefits: BenefitPlan[];
  policies: PolicyDocument[];
  expenseClaims: ExpenseClaim[];
  resignations: ResignationRequest[];
}

@Injectable({ providedIn: 'root' })
export class PeopleOsApiService {
  private readonly http = inject(HttpClient);

  login(request: LoginRequestDto): Observable<Session> {
    return this.http.post<Session>(`${API_BASE_URL}/auth/login`, request);
  }

  changePassword(request: ChangePasswordRequestDto): Observable<unknown> {
    return this.http.post(`${API_BASE_URL}/auth/change-password`, request);
  }

  loadWorkspace(): Observable<PeopleOsWorkspaceResponse> {
    return forkJoin({
      dashboard: this.http.get<Dashboard>(`${API_BASE_URL}/peopleos/dashboard`).pipe(map(mapDashboardResponse)),
      attendance: this.http.get<AttendanceData>(`${API_BASE_URL}/peopleos/attendance`),
      leave: this.http.get<LeaveData>(`${API_BASE_URL}/peopleos/leave`),
      benefits: this.http.get<BenefitPlan[]>(`${API_BASE_URL}/peopleos/benefits`),
      policies: this.http.get<PolicyDocument[]>(`${API_BASE_URL}/peopleos/policies`),
      expenseClaims: this.http.get<ExpenseClaim[]>(`${API_BASE_URL}/peopleos/expense`),
      resignations: this.http.get<ResignationRequest[]>(`${API_BASE_URL}/peopleos/resignations`)
    });
  }

  submitLeave(request: unknown): Observable<LeaveRequest> {
    return this.http.post<LeaveRequest>(`${API_BASE_URL}/peopleos/leave/requests`, request);
  }

  submitCorrection(request: unknown): Observable<AttendanceCorrection> {
    return this.http.post<AttendanceCorrection>(`${API_BASE_URL}/peopleos/attendance/corrections`, request);
  }

  submitExpense(request: unknown): Observable<ExpenseClaim> {
    return this.http.post<ExpenseClaim>(`${API_BASE_URL}/peopleos/expense/claims`, request);
  }

  submitResignation(request: unknown): Observable<ResignationRequest> {
    return this.http.post<ResignationRequest>(`${API_BASE_URL}/peopleos/resignations`, request);
  }

  updateProfile(employeeId: number, request: ProfileUpdateRequestDto): Observable<Employee> {
    return this.http.patch<Employee>(`${API_BASE_URL}/peopleos/employees/${employeeId}/profile`, request);
  }

  downloadAttendance(format: 'excel' | 'pdf', employeeId: number): Observable<HttpResponse<Blob>> {
    return this.http.get(`${API_BASE_URL}/peopleos/attendance/download/${format}?employeeId=${employeeId}`, {
      observe: 'response',
      responseType: 'blob'
    });
  }
}
