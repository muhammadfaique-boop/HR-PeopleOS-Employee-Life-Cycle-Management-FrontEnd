import { Injectable, inject } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import {
  ApprovalDecision,
  ApprovalTask,
  AttendanceCorrection,
  AttendanceData,
  BenefitPlan,
  Dashboard,
  EmployeeNotification,
  ExpenseClaim,
  LeaveData,
  LeaveRequest,
  PolicyDocument,
  ResignationRequest,
  Session
} from '../../../shared/models/peopleos.models';
import { FileDownloadService } from '../../../core/services/file-download.service';
import { AttendanceApiService } from '../../../services/attendance/attendance-api.service';
import { AuthApiService } from '../../../services/auth/auth-api.service';
import { ChangePasswordRequestDto } from '../../auth/change-password-model/change-password-request.dto';
import { LoginRequestDto } from '../../auth/login-model/login-request.dto';
import { ResetPasswordRequestDto } from '../../auth/reset-password-model/reset-password-request.dto';
import { BenefitsApiService } from '../../../services/benefits/benefits-api.service';
import { DashboardApiService } from '../../../services/dashboard/dashboard-api.service';
import { ExpenseApiService } from '../../../services/expense/expense-api.service';
import { LeaveApiService } from '../../../services/leave/leave-api.service';
import { ProfileUpdateRequestDto } from '../../people/profile-update-model/profile-update-request.dto';
import { PeopleApiService } from '../../../services/people/people-api.service';
import { PoliciesApiService } from '../../../services/policies/policies-api.service';
import { ResignationApiService } from '../../../services/resignation/resignation-api.service';
import { NotificationsApiService } from '../../../services/notifications/notifications-api.service';

export interface PeopleOsWorkspaceResponse {
  dashboard: Dashboard;
  attendance: AttendanceData;
  leave: LeaveData;
  benefits: BenefitPlan[];
  policies: PolicyDocument[];
  expenseClaims: ExpenseClaim[];
  resignations: ResignationRequest[];
  employeeNotifications: EmployeeNotification[];
}

@Injectable({ providedIn: 'root' })
export class PeopleOsFacade {
  private readonly attendanceApi = inject(AttendanceApiService);
  private readonly authApi = inject(AuthApiService);
  private readonly benefitsApi = inject(BenefitsApiService);
  private readonly dashboardApi = inject(DashboardApiService);
  private readonly downloads = inject(FileDownloadService);
  private readonly expenseApi = inject(ExpenseApiService);
  private readonly leaveApi = inject(LeaveApiService);
  private readonly peopleApi = inject(PeopleApiService);
  private readonly policiesApi = inject(PoliciesApiService);
  private readonly resignationApi = inject(ResignationApiService);
  private readonly notificationsApi = inject(NotificationsApiService);

  login(request: LoginRequestDto): Observable<Session> {
    return this.authApi.login(request);
  }

  loadWorkspace(employeeId = 2): Observable<PeopleOsWorkspaceResponse> {
    return forkJoin({
      dashboard: this.dashboardApi.getDashboard(),
      attendance: this.attendanceApi.getAttendance(),
      leave: this.leaveApi.getLeave(),
      benefits: this.benefitsApi.getBenefits(),
      policies: this.policiesApi.getPolicies(),
      expenseClaims: this.expenseApi.getClaims(),
      resignations: this.resignationApi.getResignations(),
      employeeNotifications: this.notificationsApi.getNotifications(employeeId)
    });
  }

  changePassword(request: ChangePasswordRequestDto): Observable<unknown> {
    return this.authApi.changePassword(request);
  }

  resetPassword(request: ResetPasswordRequestDto): Observable<unknown> {
    return this.authApi.resetPassword(request);
  }

  submitLeave(request: unknown): Observable<LeaveRequest> {
    return this.leaveApi.submitLeave(request);
  }

  submitCorrection(request: unknown): Observable<AttendanceCorrection> {
    return this.attendanceApi.submitCorrection(request);
  }

  submitExpense(request: unknown): Observable<ExpenseClaim> {
    return this.expenseApi.submitClaim(request);
  }

  submitResignation(request: unknown): Observable<ResignationRequest> {
    return this.resignationApi.submitResignation(request);
  }

  decideApproval(approvalId: number, decision: ApprovalDecision): Observable<ApprovalTask> {
    return this.dashboardApi.decideApproval(approvalId, decision);
  }

  markNotificationsRead(employeeId: number): Observable<void> {
    return this.notificationsApi.markAllRead(employeeId);
  }

  clearNotification(employeeId: number, notificationId: number): Observable<void> {
    return this.notificationsApi.clearNotification(employeeId, notificationId);
  }

  updateProfile(employeeId: number, request: ProfileUpdateRequestDto) {
    return this.peopleApi.updateProfile(employeeId, request);
  }

  downloadAttendance(format: 'excel' | 'pdf', employeeId: number): void {
    const extension = format === 'pdf' ? 'pdf' : 'csv';
    const fallbackName = `Login_UserId_${employeeId}.Attendance log.${extension}`;
    this.attendanceApi.download(format, employeeId).subscribe(response => this.downloads.saveResponse(response, fallbackName));
  }
}
