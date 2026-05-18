import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  AttendanceCorrection,
  ExpenseClaim,
  LeaveRequest,
  ResignationRequest,
  Session
} from '../../../shared/models/peopleos.models';
import { FileDownloadService } from '../../../core/services/file-download.service';
import { ChangePasswordRequestDto, LoginRequestDto, ProfileUpdateRequestDto } from '../models/peopleos.dto';
import { PeopleOsApiService, PeopleOsWorkspaceResponse } from '../services/peopleos-api.service';

@Injectable({ providedIn: 'root' })
export class PeopleOsFacade {
  private readonly api = inject(PeopleOsApiService);
  private readonly downloads = inject(FileDownloadService);

  login(request: LoginRequestDto): Observable<Session> {
    return this.api.login(request);
  }

  loadWorkspace(): Observable<PeopleOsWorkspaceResponse> {
    return this.api.loadWorkspace();
  }

  changePassword(request: ChangePasswordRequestDto): Observable<unknown> {
    return this.api.changePassword(request);
  }

  submitLeave(request: unknown): Observable<LeaveRequest> {
    return this.api.submitLeave(request);
  }

  submitCorrection(request: unknown): Observable<AttendanceCorrection> {
    return this.api.submitCorrection(request);
  }

  submitExpense(request: unknown): Observable<ExpenseClaim> {
    return this.api.submitExpense(request);
  }

  submitResignation(request: unknown): Observable<ResignationRequest> {
    return this.api.submitResignation(request);
  }

  updateProfile(employeeId: number, request: ProfileUpdateRequestDto) {
    return this.api.updateProfile(employeeId, request);
  }

  downloadAttendance(format: 'excel' | 'pdf', employeeId: number): void {
    const extension = format === 'pdf' ? 'pdf' : 'csv';
    const fallbackName = `Login_UserId_${employeeId}.Attendance log.${extension}`;
    this.api.downloadAttendance(format, employeeId).subscribe(response => this.downloads.saveResponse(response, fallbackName));
  }
}
