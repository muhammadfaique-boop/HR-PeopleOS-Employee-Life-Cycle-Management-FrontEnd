import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/config/api.config';
import { AttendanceCorrection, AttendanceData } from '../../shared/models/peopleos.models';

@Injectable({ providedIn: 'root' })
export class AttendanceApiService {
  private readonly http = inject(HttpClient);

  getAttendance(): Observable<AttendanceData> {
    return this.http.get<AttendanceData>(`${API_BASE_URL}/peopleos/attendance`);
  }

  submitCorrection(request: unknown): Observable<AttendanceCorrection> {
    return this.http.post<AttendanceCorrection>(`${API_BASE_URL}/peopleos/attendance/corrections`, request);
  }

  download(format: 'excel' | 'pdf', employeeId: number): Observable<HttpResponse<Blob>> {
    return this.http.get(`${API_BASE_URL}/peopleos/attendance/download/${format}?employeeId=${employeeId}`, {
      observe: 'response',
      responseType: 'blob'
    });
  }
}
